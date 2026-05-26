const test = require('node:test');
const assert = require('node:assert/strict');
const { LicenseRuntime } = require('../services/license-runtime');

test('license runtime issues keys for licensable lines', () => {
  const runtime = new LicenseRuntime();
  const licenses = runtime.issueLicenses({
    sessionId: 'session_1',
    lines: [{ productId: 'prod_a', quantity: 2, licenseType: 'single-seat' }]
  });

  assert.equal(licenses.length, 2);
  assert.match(licenses[0].key, /^ogx_/);
});
