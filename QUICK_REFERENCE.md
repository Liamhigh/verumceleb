# Quick Reference: Immutable Rules System

## 🚀 Quick Start

After cloning the repository:

```bash
npm install  # Install Husky hooks
```

## 📝 Common Commands

### Verify Integrity
```bash
npm run verify-immutable
```
Checks all immutable files against the manifest.

### Generate Manifest
```bash
npm run generate-manifest
```
Creates a new manifest after making authorized changes.

## 🔄 Typical Workflow

### Modifying Existing Rules

```bash
# 1. Edit the rule file
vim verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/assets/rules/01_constitution.json

# 2. Generate new manifest
npm run generate-manifest

# 3. Verify (optional but recommended)
npm run verify-immutable

# 4. Commit BOTH files
git add verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/assets/rules/01_constitution.json
git add verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/assets/rules/manifest.json
git commit -m "Update constitution rule"
```

### Adding New Rules

```bash
# 1. Create the new rule file
vim verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/assets/rules/30_new_rule.yaml

# 2. Generate manifest (adds new file)
npm run generate-manifest

# 3. Verify
npm run verify-immutable

# 4. Commit BOTH
git add verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/assets/rules/30_new_rule.yaml
git add verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/assets/rules/manifest.json
git commit -m "Add new rule"
```

## ⚠️ Error Messages

### "Hash mismatch"
**Meaning:** File was modified but manifest wasn't updated
**Fix:** Run `npm run generate-manifest`

### "Unexpected files"
**Meaning:** New files exist that aren't in manifest
**Fix:** Run `npm run generate-manifest`

### "Pre-commit hook failed"
**Meaning:** Trying to commit changes without updating manifest
**Fix:** Run `npm run generate-manifest` then commit again

## 🛡️ Protection Layers

1. **Pre-commit Hook** - Runs automatically when you commit
2. **GitHub Actions** - Runs on every PR and push to main
3. **Manual Verification** - Run anytime with `npm run verify-immutable`

## 📚 Full Documentation

- **System Overview:** `verum-omnis-founders-gift-v5/verum-omnis-monorepo/README.md`
- **Husky Setup:** `verum-omnis-founders-gift-v5/verum-omnis-monorepo/HUSKY_SETUP.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`

## 🆘 Need Help?

1. Check the error message - they're designed to be helpful
2. Try `npm run verify-immutable` to see current state
3. Review the documentation files
4. Ask team members familiar with the system

## 🚨 Emergency: Bypass Hook

**⚠️ Only with proper authorization:**

```bash
git commit --no-verify -m "Emergency commit"
```

**Note:** CI will still verify on the server side.

## ✅ Best Practices

- ✅ Always run `generate-manifest` after changing rules
- ✅ Commit file changes AND manifest together
- ✅ Run `verify-immutable` before pushing
- ✅ Never manually edit manifest.json
- ✅ Keep changes atomic (one logical change per commit)

## 📊 File Locations

```
Repository Root (run npm commands here)
└── verum-omnis-founders-gift-v5/
    └── verum-omnis-monorepo/
        ├── functions/assets/
        │   ├── rules/
        │   │   └── manifest.json    ← Source of truth
        │   └── treaty/
        └── scripts/
            ├── verify-immutable-pack.mjs
            └── generate-manifest.mjs
```

## 💡 Tips

- The pre-commit hook only runs if you change immutable files
- Verification is fast (usually under 1 second)
- SHA-512 hashes detect even tiny changes
- The manifest tracks file size as a quick check
- Documentation changes (CHANGELOGs) are excluded
