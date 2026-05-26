const test = require('node:test');
const assert = require('node:assert/strict');
const products = require('../data/products.json');
const { ProductCatalog } = require('../services/product-catalog');

test('product catalog lists seeded products', () => {
  const catalog = new ProductCatalog({ seedProducts: products });
  assert.equal(catalog.listProducts().length, 2);
});

test('product catalog adds valid products', () => {
  const catalog = new ProductCatalog({ seedProducts: [] });
  const created = catalog.addProduct({ id: 'prod_x', name: 'X', priceCents: 1000, currency: 'usd' });
  assert.equal(created.currency, 'USD');
  assert.equal(catalog.getProductById('prod_x').name, 'X');
});
