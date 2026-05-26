const crypto = require('node:crypto');

const PROHIBITED_CARD_FIELDS = ['cardNumber', 'number', 'cvc', 'cvv', 'expiry', 'expMonth', 'expYear', 'pan'];

class CheckoutRuntime {
  constructor({ productCatalog, offerRuntime, licenseRuntime } = {}) {
    this.productCatalog = productCatalog;
    this.offerRuntime = offerRuntime;
    this.licenseRuntime = licenseRuntime;
  }

  createSession(payload, options = {}) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Checkout payload is required');
    }

    this.assertNoRawCardData(payload);

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error('Checkout items are required');
    }

    if (!payload.payment || typeof payload.payment !== 'object') {
      throw new Error('Payment metadata is required');
    }

    const lines = payload.items.map((item) => {
      const quantity = Number(item.quantity || 1);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error('Item quantity must be a positive integer');
      }

      const product = this.productCatalog.getProductById(item.productId);
      if (!product || product.active === false) {
        throw new Error(`Product not found or inactive: ${item.productId}`);
      }

      return {
        productId: product.id,
        quantity,
        unitPriceCents: product.priceCents,
        subtotalCents: product.priceCents * quantity,
        currency: product.currency,
        licenseType: product.licenseType
      };
    });

    const subtotalCents = lines.reduce((acc, line) => acc + line.subtotalCents, 0);
    const discountCents = this.offerRuntime.applyOffers(lines);
    const totalCents = Math.max(0, subtotalCents - discountCents);
    const sessionId = crypto.randomUUID();

    const licenses = this.licenseRuntime.issueLicenses({ sessionId, lines });

    const integrityPayload = {
      sessionId,
      items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity, subtotalCents: line.subtotalCents })),
      subtotalCents,
      discountCents,
      totalCents,
      payment: {
        provider: payload.payment.provider || 'unknown',
        method: payload.payment.method || 'metadata'
      }
    };

    const secretSalt = options.secretSalt || '';
    const integrityHash = crypto
      .createHash('sha256')
      .update(`${secretSalt}:${JSON.stringify(integrityPayload)}`)
      .digest('hex');

    return {
      sessionId,
      subtotalCents,
      discountCents,
      totalCents,
      currency: lines[0].currency,
      payment: {
        mode: 'metadata-only',
        provider: integrityPayload.payment.provider,
        method: integrityPayload.payment.method,
        reference: payload.payment.reference || null
      },
      licenses,
      integrityHash,
      createdAt: new Date().toISOString()
    };
  }

  assertNoRawCardData(payload) {
    const stack = [payload];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || typeof current !== 'object') {
        continue;
      }

      for (const [key, value] of Object.entries(current)) {
        if (PROHIBITED_CARD_FIELDS.includes(String(key))) {
          throw new Error('Raw card fields are prohibited');
        }

        if (value && typeof value === 'object') {
          stack.push(value);
        }
      }
    }
  }
}

module.exports = { CheckoutRuntime };
