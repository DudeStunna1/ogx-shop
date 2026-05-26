const test = require('node:test');
const assert = require('node:assert/strict');
const products = require('../data/products.json');
const offers = require('../data/offers.json');
const { ProductCatalog } = require('../services/product-catalog');
const { OfferRuntime } = require('../services/offer-runtime');
const { LicenseRuntime } = require('../services/license-runtime');
const { CheckoutRuntime } = require('../services/checkout-runtime');

test('checkout creates session with integrity hash and licenses', () => {
  const productCatalog = new ProductCatalog({ seedProducts: products });
  const offerRuntime = new OfferRuntime({ offers, productCatalog });
  const licenseRuntime = new LicenseRuntime();
  const checkout = new CheckoutRuntime({ productCatalog, offerRuntime, licenseRuntime });

  const session = checkout.createSession(
    {
      items: [{ productId: 'prod_starter_kit', quantity: 1 }],
      payment: { provider: 'stripe', method: 'card-tokenized', reference: 'pi_123' }
    },
    { secretSalt: 'test-salt' }
  );

  assert.equal(session.payment.mode, 'metadata-only');
  assert.equal(typeof session.integrityHash, 'string');
  assert.equal(session.integrityHash.length, 64);
  assert.equal(session.licenses.length, 1);
});

test('checkout rejects raw card fields', () => {
  const productCatalog = new ProductCatalog({ seedProducts: products });
  const offerRuntime = new OfferRuntime({ offers, productCatalog });
  const licenseRuntime = new LicenseRuntime();
  const checkout = new CheckoutRuntime({ productCatalog, offerRuntime, licenseRuntime });

  assert.throws(() => {
    checkout.createSession({
      items: [{ productId: 'prod_starter_kit', quantity: 1 }],
      payment: { provider: 'x', method: 'x', cardNumber: '4242424242424242' }
    });
  }, /Raw card fields are prohibited/);
});
