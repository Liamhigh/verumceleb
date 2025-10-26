# Verum Omnis Mobile Build Guide

This guide explains how to build and deploy the Verum Omnis mobile app using Capacitor.

## Prerequisites

- Node.js 20.x
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- Capacitor CLI: `npm install -g @capacitor/cli`

## Project Structure

```
capacitor-app/
├── capacitor.config.ts   # Capacitor configuration
├── package.json          # Dependencies
├── www/                  # Built web assets (synced from ../web)
├── android/              # Android native project
└── ios/                  # iOS native project
```

## Setup

### 1. Install Dependencies

```bash
cd capacitor-app
npm install
```

### 2. Build Web Assets

The mobile app uses the same web frontend. Build and sync:

```bash
npm run build
```

This script copies files from `../web` to `www/` and syncs with native platforms.

### 3. Sync Native Projects

```bash
npx cap sync
```

This copies web assets to native projects and updates native dependencies.

## Android Build

### Development Build

```bash
# Open in Android Studio
npx cap open android

# Or run directly
npx cap run android
```

### Release Build (APK)

```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Install APK to Web Downloads

To make the APK available for download from the website:

```bash
cp android/app/build/outputs/apk/release/app-release.apk ../web/downloads/verum-omnis.apk
```

### Code Signing

For production releases, you need to sign the APK:

1. Generate a keystore:
```bash
keytool -genkey -v -keystore verum-omnis.keystore -alias verum-omnis -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure in `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('path/to/verum-omnis.keystore')
            storePassword 'your-password'
            keyAlias 'verum-omnis'
            keyPassword 'your-password'
        }
    }
}
```

3. Build signed APK:
```bash
./gradlew assembleRelease
```

## iOS Build

### Development Build

```bash
# Open in Xcode
npx cap open ios

# Or run directly
npx cap run ios
```

### Release Build (App Store)

1. Open the project in Xcode
2. Configure signing & capabilities
3. Archive the project (Product → Archive)
4. Upload to App Store Connect

## Digital Asset Links (Android)

For App Links to work, you need to host `.well-known/assetlinks.json` on your domain.

Generate the file:

```bash
# Get SHA-256 fingerprint from your keystore
keytool -list -v -keystore verum-omnis.keystore -alias verum-omnis

# Create assetlinks.json
cat > ../web/.well-known/assetlinks.json << EOF
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.verumomnis.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
EOF
```

Deploy this file to: `https://yourdomain.com/.well-known/assetlinks.json`

## Troubleshooting

### Android Build Fails

```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

### Capacitor Not Syncing

```bash
# Force sync
npx cap sync --force
```

### Web Assets Not Updating

```bash
# Rebuild and sync
npm run build
npx cap sync
```

## App Configuration

Edit `capacitor.config.ts` to customize:

- App ID: `appId: 'com.verumomnis.app'`
- App Name: `appName: 'Verum Omnis'`
- Web Dir: `webDir: 'www'`
- Server URL (for dev): `url: 'http://localhost:8000'`

## Platform-Specific Features

### Android

- Minimum SDK: 22 (Android 5.1)
- Target SDK: 34 (Android 14)
- Package: `com.verumomnis.app`

### iOS

- Minimum iOS: 13.0
- Bundle ID: `com.verumomnis.app`

## Testing

### Android Emulator

```bash
npx cap run android --target=emulator
```

### Physical Device

```bash
# Enable USB debugging on device
npx cap run android --target=device
```

## Deployment

### Google Play Store

1. Build signed APK/AAB
2. Create Google Play Console account
3. Upload APK/AAB
4. Fill in store listing
5. Submit for review

### Apple App Store

1. Build and archive in Xcode
2. Upload to App Store Connect
3. Fill in app information
4. Submit for review

## Stateless Architecture

The mobile app maintains the same stateless architecture as the web app:

- No PII stored on device
- All hashing done client-side
- Constitutional rules enforced locally
- Firebase Hosting integration for backend

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com)
- [iOS Developer Guide](https://developer.apple.com)
