# Validation

Validation workflow (`.github/workflows/validate.yml`) runs:
- JavaScript syntax checks via `node --check`
- Tests via `npm test`
- JSON parsing checks for data files
- YAML parsing check for `config/shop.yaml`
- Secret scan via Gitleaks action
