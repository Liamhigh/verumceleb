# Verum Celeb Repository

This repository contains the Verum Omnis platform with immutable rules and treaty enforcement.

## Immutable Pack Verification

The repository includes automated verification of immutable files to ensure the integrity of the constitutional core.

### Protected Files

The following files are cryptographically protected and must never be modified:
- `verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/assets/rules/**`
- `verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/assets/treaty/**`

### Verification Process

**Pre-commit Hook**: Before each commit, the system automatically verifies:
```bash
npm run verify-immutable
```

**GitHub Actions**: On every push and PR, the CI runs verification to ensure no immutable files have been altered.

### Scripts

- `npm run verify-immutable` - Verify the integrity of immutable files
- `npm run generate-manifest` - Generate a new manifest (authorized users only)

### Setup

After cloning, run:
```bash
npm install
```

This will install Husky and set up the pre-commit hooks automatically.

## Development

See the main README in `verum-omnis-founders-gift-v5/verum-omnis-monorepo/` for detailed build and deployment instructions.

For AI coding agents, please read `.github/copilot-instructions.md` for important guidelines about the immutable core.
