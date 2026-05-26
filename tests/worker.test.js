const test = require('node:test');
const assert = require('node:assert/strict');
const worker = require('../worker');

async function asJson(response) {
  return { status: response.status, body: await response.json() };
}

test('GET /health responds ok', async () => {
  const response = await worker.fetch(new Request('https://example.com/health'));
  const parsed = await asJson(response);
  assert.equal(parsed.status, 200);
  assert.equal(parsed.body.status, 'ok');
});

test('GET /products returns catalog', async () => {
  const response = await worker.fetch(new Request('https://example.com/products'));
  const parsed = await asJson(response);
  assert.equal(parsed.status, 200);
  assert.ok(Array.isArray(parsed.body.products));
  assert.ok(parsed.body.products.length >= 1);
});

test('POST /checkout/session creates a session', async () => {
  const response = await worker.fetch(
    new Request('https://example.com/checkout/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'prod_starter_kit', quantity: 1 }],
        payment: { provider: 'stripe', method: 'card-tokenized', reference: 'pi_123' }
      })
    }),
    { CHECKOUT_INTEGRITY_SALT: 'test-salt' }
  );

  const parsed = await asJson(response);
  assert.equal(parsed.status, 201);
  assert.equal(parsed.body.session.payment.mode, 'metadata-only');
});
