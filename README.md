# ogx-shop

SHOP.OS baseline runtime for OGX commerce flows.

## Runtime
- `GET /health`
- `GET /shop/status`
- `GET /products`
- `POST /products`
- `GET /offers`
- `POST /checkout/session`

## Quick start
```bash
npm test
node --check worker.js
```

## Commerce guardrails
- Metadata-only payment abstraction.
- No raw card fields accepted by checkout runtime.
- No hardcoded payment secrets.
- Licensing supported for licensable products.
- Checkout sessions include SHA-256 integrity hashes.
