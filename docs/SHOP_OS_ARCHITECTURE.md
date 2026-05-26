# SHOP.OS Architecture

The baseline uses a Cloudflare Worker entry (`worker.js`) and service modules:
- `services/product-catalog.js`
- `services/offer-runtime.js`
- `services/checkout-runtime.js`
- `services/license-runtime.js`

Data is loaded from `data/products.json` and `data/offers.json`. Checkout computes totals, applies offers, issues licenses, and returns an integrity hash.
