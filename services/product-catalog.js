class ProductCatalog {
  constructor({ seedProducts = [] } = {}) {
    this.products = new Map();
    for (const product of seedProducts) {
      this.products.set(product.id, { ...product });
    }
  }

  listProducts() {
    return Array.from(this.products.values());
  }

  getProductById(id) {
    return this.products.get(id) || null;
  }

  addProduct(input) {
    if (!input || typeof input !== 'object') {
      throw new Error('Product payload is required');
    }

    const required = ['id', 'name', 'priceCents', 'currency'];
    for (const field of required) {
      if (!input[field]) {
        throw new Error(`Missing required product field: ${field}`);
      }
    }

    if (this.products.has(input.id)) {
      throw new Error('Product id already exists');
    }

    const priceCents = Number(input.priceCents);
    if (!Number.isInteger(priceCents) || priceCents < 0) {
      throw new Error('priceCents must be a non-negative integer');
    }

    const product = {
      id: String(input.id),
      name: String(input.name),
      description: input.description ? String(input.description) : '',
      priceCents,
      currency: String(input.currency).toUpperCase(),
      licenseType: input.licenseType ? String(input.licenseType) : 'none',
      active: input.active !== false,
      metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {}
    };

    this.products.set(product.id, product);
    return product;
  }
}

module.exports = { ProductCatalog };
