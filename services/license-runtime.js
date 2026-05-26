const crypto = require('node:crypto');

class LicenseRuntime {
  issueLicenses({ sessionId, lines }) {
    const issuedAt = new Date().toISOString();
    const licenses = [];

    for (const line of lines) {
      if (!line.licenseType || line.licenseType === 'none') {
        continue;
      }

      for (let i = 0; i < line.quantity; i += 1) {
        const tokenSource = `${sessionId}:${line.productId}:${i}:${issuedAt}`;
        const token = crypto.createHash('sha256').update(tokenSource).digest('hex').slice(0, 24);
        licenses.push({
          sessionId,
          productId: line.productId,
          licenseType: line.licenseType,
          key: `ogx_${token}`,
          issuedAt
        });
      }
    }

    return licenses;
  }
}

module.exports = { LicenseRuntime };
