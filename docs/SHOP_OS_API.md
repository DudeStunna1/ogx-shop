# SHOP.OS API

## GET /health
Returns runtime health metadata.

## GET /shop/status
Returns runtime status and catalog/offer counts.

## GET /products
Returns all catalog products.

## POST /products
Creates a product with required fields: `id`, `name`, `priceCents`, `currency`.

## GET /offers
Returns active offers.

## POST /checkout/session
Creates checkout session from metadata payment input and line items, returns totals, licenses, and integrity hash.
