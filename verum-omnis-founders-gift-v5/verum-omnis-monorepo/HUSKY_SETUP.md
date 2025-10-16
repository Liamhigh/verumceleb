# Husky Setup Guide

This guide explains how to set up Husky pre-commit hooks for the immutable rules system.

## Initial Setup

After cloning the repository, run:

```bash
npm install
```

This will:
1. Install Husky as a dev dependency
2. Initialize Husky hooks in `.husky/`
3. Set up the pre-commit hook

## Verifying Setup

Check if Husky is installed correctly:

```bash
ls -la .husky/
```

You should see:
- `pre-commit` - The pre-commit hook script

## Testing the Hook

1. Make a change to an immutable file:
   ```bash
   echo '{"test": "value"}' >> functions/assets/rules/01_constitution.json
   ```

2. Try to commit:
   ```bash
   git add functions/assets/rules/01_constitution.json
   git commit -m "Test commit"
   ```

3. The pre-commit hook should:
   - Detect changes to immutable files
   - Run verification
   - Fail with an error message

4. Restore the file:
   ```bash
   git restore functions/assets/rules/01_constitution.json
   ```

## How It Works

The pre-commit hook (`.husky/pre-commit`):

1. Checks if any files in `functions/assets/rules/` or `functions/assets/treaty/` are being committed
2. If yes, runs `npm run verify-immutable` to check integrity
3. If verification fails, blocks the commit
4. If verification passes, allows the commit to proceed

## Bypassing the Hook

**⚠️ NOT RECOMMENDED**: In emergencies, you can bypass the hook:

```bash
git commit --no-verify -m "Emergency commit"
```

However, this should only be done with proper authorization and understanding of the consequences.

## Troubleshooting

### Hook not running

If the hook doesn't run:

1. Check permissions:
   ```bash
   chmod +x .husky/pre-commit
   ```

2. Verify Husky is installed:
   ```bash
   npm install
   ```

3. Check if hooks are enabled:
   ```bash
   git config core.hooksPath
   ```
   
   Should return `.husky`

### Hook failing incorrectly

If the hook fails but files are correct:

1. Run manual verification:
   ```bash
   npm run verify-immutable
   ```

2. Check git status:
   ```bash
   git status
   ```

3. Ensure manifest is up to date:
   ```bash
   npm run generate-manifest
   npm run verify-immutable
   ```

## Uninstalling

To disable Husky hooks:

```bash
git config --unset core.hooksPath
```

To remove Husky completely:

```bash
npm uninstall husky
rm -rf .husky
```

## See Also

- [Main README](README.md) - Complete system documentation
- [Husky Documentation](https://typicode.github.io/husky/) - Official Husky docs
