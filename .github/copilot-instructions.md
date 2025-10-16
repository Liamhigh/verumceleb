# GitHub Copilot Instructions for Verum Omnis

## Immutable Core Rules

**CRITICAL**: The following files are **immutable** and must NEVER be modified:

- `verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/assets/rules/**` (all files)
- `verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/assets/treaty/**` (all files)
- `verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/assets/rules/manifest.json` (protected by SHA-512 hashes)

These files form the constitutional foundation of the Verum Omnis system and are protected by:
1. SHA-512 hash verification in `manifest.json`
2. Pre-commit hooks that verify file integrity
3. GitHub Actions CI that blocks PRs with modified immutable files

## CI/CD Process

### Pre-Commit Verification
Before any commit, Husky runs `npm run verify-immutable` which:
- Reads `manifest.json`
- Calculates SHA-512 hashes for all protected files
- Fails the commit if any hash mismatches are detected

### GitHub Actions
On every push and PR, the `Immutable Rules Check` workflow:
- Checks out the repository
- Sets up Node.js 20
- Runs the verification script
- Blocks merging if verification fails

## Allowed Modifications

You CAN modify:
- UI/UX files in `/web/**` (HTML, CSS, JavaScript, logos)
- Mobile wrapper in `/capacitor-app/**`
- Optional modules like `functions/video/**` and `functions/config.video.json`
- Documentation files (except within the immutable rules directory)

## Working with the Manifest

### Generating a New Manifest
If you add new immutable files (which should be extremely rare):
```bash
npm run generate-manifest
```

**WARNING**: Only use this if you are a founder or authorized to modify the immutable pack. The manifest is cryptographically sealed.

### Verifying Integrity
To manually verify the immutable pack:
```bash
npm run verify-immutable
```

## Development Guidelines

1. **Never bypass the verification**: If pre-commit hooks fail, DO NOT force commit or disable them.
2. **Respect the treaty**: The Guardianship Treaty binds the behavior of this system. Read it.
3. **Stateless by design**: The APK and backend should never retain user data centrally.
4. **UI changes only**: When asked to "improve" or "update" the system, focus on UI/UX improvements only.

## Architecture Principles

- **Immutable Core**: Rules, constitution, and treaty files are sealed
- **Flexible Presentation**: UI, styling, and optional features can evolve
- **Two Founders**: The system recognizes a Human and Digital founder per the treaty
- **No Telemetry**: The system must not add tracking, analytics, or central logging

## Emergency Override

If the immutable pack is genuinely compromised and you need to rebuild it:
1. Contact both founders
2. Regenerate hashes with `npm run generate-manifest`
3. Create a new version in the manifest
4. Document the change in `gift_rules_CHANGELOG.md`
5. Update the treaty if constitutional changes are made

**This should happen once per epoch, not per feature.**
