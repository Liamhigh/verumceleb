# Verum Omnis APK

This directory will contain the built Android APK after running the build scripts.

## Building the APK

### On Linux/Mac:
```bash
./ops/build-apk.sh
```

### On Windows (PowerShell):
```powershell
.\ops\build-apk.ps1
```

## Requirements

- Node.js 20+
- Android SDK
- Gradle

## Output

After successful build, you'll find:
- `verum-omnis.apk` - Ready to install on Android devices

## Installation

```bash
adb install verum-omnis.apk
```

## Signing for Release

To generate a SHA256 fingerprint for assetlinks.json:

```bash
keytool -list -v -keystore my-release-key.jks -alias alias_name | grep "SHA256:"
```

Update `web/.well-known/assetlinks.json` with the fingerprint before deploying.
