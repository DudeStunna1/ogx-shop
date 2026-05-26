const test = require('node:test');
const assert = require('node:assert/strict');
const offers = require('../data/offers.json');
const { ProductCatalog } = require('../services/product-catalog');
const { OfferRuntime } = require('../services/offer-runtime');

test('offer runtime returns active offers', () => {
  const catalog = new ProductCatalog({ seedProducts: [] });
  const runtime = new OfferRuntime({ offers, productCatalog: catalog });
  assert.equal(runtime.listOffers().length, 1);
});

test('offer runtime applies percentage discount', () => {
  const runtime = new OfferRuntime({ offers, productCatalog: null });
  const discount = runtime.applyOffers([{ productId: 'prod_starter_kit', subtotalCents: 1000 }]);
  assert.equal(discount, 100);
});
