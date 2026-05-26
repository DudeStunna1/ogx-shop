class OfferRuntime {
  constructor({ offers = [], productCatalog } = {}) {
    this.offers = offers.map((offer) => ({ ...offer }));
    this.productCatalog = productCatalog;
  }

  listOffers() {
    return this.offers.filter((offer) => offer.active !== false);
  }

  applyOffers(lines) {
    const activeOffers = this.listOffers();
    let discountCents = 0;

    for (const offer of activeOffers) {
      for (const line of lines) {
        if (!Array.isArray(offer.productIds) || !offer.productIds.includes(line.productId)) {
          continue;
        }

        if (offer.type === 'percent') {
          discountCents += Math.floor((line.subtotalCents * Number(offer.value || 0)) / 100);
        }

        if (offer.type === 'fixed_cents') {
          discountCents += Number(offer.value || 0);
        }
      }
    }

    return Math.max(0, Math.floor(discountCents));
  }
}

module.exports = { OfferRuntime };
