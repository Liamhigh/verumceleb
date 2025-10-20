# Startup verification

Functions call `verifyImmutablePack()` at startup and require:

- `functions/assets/rules/manifest.json`

Do not deploy without the manifest. In emergencies only, you can temporarily guard the call to avoid cold-start crashes:

```js
try { verifyImmutablePack(); }
catch (e) { console.warn("Immutable verify skipped:", e?.message || e); }
```

Revert the guard immediately after restoring the manifest.

Ensure secrets (like `OPENAI_API_KEY`) are set in the Firebase project and redeploy functions after adding/updating secrets.
