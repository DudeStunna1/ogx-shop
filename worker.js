const productSeeds = require('./data/products.json');
const offerSeeds = require('./data/offers.json');
const { ProductCatalog } = require('./services/product-catalog');
const { OfferRuntime } = require('./services/offer-runtime');
const { LicenseRuntime } = require('./services/license-runtime');
const { CheckoutRuntime } = require('./services/checkout-runtime');

const productCatalog = new ProductCatalog({ seedProducts: productSeeds });
const offerRuntime = new OfferRuntime({ offers: offerSeeds, productCatalog });
const licenseRuntime = new LicenseRuntime();
const checkoutRuntime = new CheckoutRuntime({ productCatalog, offerRuntime, licenseRuntime });

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

async function routeRequest(request, env = {}) {
  const url = new URL(request.url);

  if (request.method === 'GET' && url.pathname === '/health') {
    return jsonResponse(200, { status: 'ok', service: 'ogx-shop', time: new Date().toISOString() });
  }

  if (request.method === 'GET' && url.pathname === '/shop/status') {
    return jsonResponse(200, {
      shopId: 'ogx-shop',
      status: 'operational',
      products: productCatalog.listProducts().length,
      offers: offerRuntime.listOffers().length,
      licensing: true,
      paymentMode: 'metadata-only'
    });
  }

  if (request.method === 'GET' && url.pathname === '/products') {
    return jsonResponse(200, { products: productCatalog.listProducts() });
  }

  if (request.method === 'POST' && url.pathname === '/products') {
    let body;
    try {
      body = await request.json();
    } catch (_error) {
      return jsonResponse(400, { error: 'Invalid JSON body' });
    }

    try {
      const product = productCatalog.addProduct(body);
      return jsonResponse(201, { product });
    } catch (error) {
      return jsonResponse(400, { error: error.message });
    }
  }

  if (request.method === 'GET' && url.pathname === '/offers') {
    return jsonResponse(200, { offers: offerRuntime.listOffers() });
  }

  if (request.method === 'POST' && url.pathname === '/checkout/session') {
    let body;
    try {
      body = await request.json();
    } catch (_error) {
      return jsonResponse(400, { error: 'Invalid JSON body' });
    }

    try {
      const session = checkoutRuntime.createSession(body, { secretSalt: env.CHECKOUT_INTEGRITY_SALT });
      return jsonResponse(201, { session });
    } catch (error) {
      return jsonResponse(400, { error: error.message });
    }
  }

  return jsonResponse(404, { error: 'Not found' });
}

module.exports = {
  fetch: (request, env, ctx) => routeRequest(request, env, ctx),
  routeRequest
};
