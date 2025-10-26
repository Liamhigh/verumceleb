# Mobile App Build Guide — Verum Omnis

This document explains how to build the Verum Omnis mobile app for Android and iOS using Capacitor.

## Prerequisites

### For Android:
- **Node.js** 18+ (LTS)
- **Android Studio** (latest version)
- **Android SDK** (API 33+)
- **Gradle** (included with Android Studio)

### For iOS:
- **Xcode** 14+ (macOS only)
- **CocoaPods** (`sudo gem install cocoapods`)
- **Apple Developer Account** (for distribution)

## Project Structure

```
verum-omnis-monorepo/
├── web/                    # Source web app
├── capacitor-app/          # Capacitor wrapper
│   ├── capacitor.config.ts # Capacitor configuration
│   ├── android/            # Android project (generated)
│   ├── ios/                # iOS project (generated)
│   └── www/                # Built web assets (synced from ../web)
└── ops/
    ├── build-apk.sh        # Android build script (Bash)
    └── build-apk.ps1       # Android build script (PowerShell)
```

## Configuration

The Capacitor config is located at `capacitor-app/capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'foundation.verumglobal.app',
  appName: 'Verum Omnis',
  webDir: 'www',
  server: {
    url: 'https://gitverum.web.app',
    cleartext: true
  }
};

export default config;
```

### Key Settings:
- **appId**: `foundation.verumglobal.app` (unique identifier)
- **appName**: `Verum Omnis` (displayed on device)
- **server.url**: `https://gitverum.web.app` (production web URL)

## Building for Android

### Option 1: Automated Script (Recommended)

#### Linux/macOS (Bash):
```bash
cd /workspaces/verumceleb
bash ops/build-apk.sh
```

#### Windows (PowerShell):
```powershell
cd C:\path\to\verumceleb
.\ops\build-apk.ps1
```

The script will:
1. Install dependencies (`npm install`)
2. Sync web assets to Capacitor (`npx cap sync android`)
3. Build APK (`./gradlew assembleRelease`)
4. Copy APK to `web/downloads/verum-omnis.apk`

### Option 2: Manual Build

1. **Install dependencies:**
   ```bash
   cd capacitor-app
   npm install
   ```

2. **Sync web assets:**
   ```bash
   npx cap sync android
   ```

3. **Open Android Studio:**
   ```bash
   npx cap open android
   ```

4. **Build in Android Studio:**
   - Select **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - Or use Gradle: `./gradlew assembleRelease` (inside `android/` directory)

5. **Locate APK:**
   ```
   capacitor-app/android/app/build/outputs/apk/release/app-release-unsigned.apk
   ```

### Signing the APK (Production)

For production release, sign the APK with a keystore:

1. **Generate keystore:**
   ```bash
   keytool -genkey -v -keystore verum-omnis.keystore -alias verum -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Sign APK:**
   ```bash
   jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
     -keystore verum-omnis.keystore \
     app-release-unsigned.apk verum
   ```

3. **Zipalign:**
   ```bash
   zipalign -v 4 app-release-unsigned.apk verum-omnis.apk
   ```

## Building for iOS

### Prerequisites:
- macOS with Xcode installed
- Apple Developer account ($99/year for App Store)

### Steps:

1. **Install dependencies:**
   ```bash
   cd capacitor-app
   npm install
   ```

2. **Sync web assets:**
   ```bash
   npx cap sync ios
   ```

3. **Open Xcode:**
   ```bash
   npx cap open ios
   ```

4. **Configure signing:**
   - Select project in Xcode navigator
   - Go to **Signing & Capabilities** tab
   - Select your Team (Apple Developer account)
   - Set Bundle Identifier: `foundation.verumglobal.app`

5. **Build:**
   - Select **Product → Archive**
   - Follow Xcode's distribution wizard for App Store or Ad Hoc distribution

## Android App Links (Deep Linking)

To enable deep linking (e.g., `https://gitverum.web.app` opens the app):

### 1. Generate SHA-256 Fingerprint

```bash
keytool -list -v -keystore verum-omnis.keystore -alias verum
```

Copy the **SHA256** value (e.g., `AB:CD:EF:12:34:56...`).

### 2. Update `assetlinks.json`

Edit `web/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "foundation.verumglobal.app",
    "sha256_cert_fingerprints": [
      "AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12"
    ]
  }
}]
```

### 3. Deploy to Firebase

The file must be publicly accessible at:
```
https://gitverum.web.app/.well-known/assetlinks.json
```

Deploy with:
```bash
firebase deploy --only hosting
```

### 4. Verify

Test at:
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://gitverum.web.app&relation=delegate_permission/common.handle_all_urls
```

## Testing

### Android Emulator:
1. Open Android Studio
2. **Tools → Device Manager**
3. Create/start an emulator (API 33+ recommended)
4. Run app: `npx cap run android`

### iOS Simulator:
1. Open Xcode
2. Select simulator from device dropdown
3. Click **Run** (▶️)

### Physical Device:
1. Enable **Developer Mode** on device
2. Connect via USB
3. Android: `adb devices` (should list device)
4. iOS: Trust computer when prompted
5. Run: `npx cap run android` or use Xcode for iOS

## Troubleshooting

### Issue: "SDK location not found"
**Solution**: Create `capacitor-app/android/local.properties`:
```properties
sdk.dir=/Users/USERNAME/Library/Android/sdk
```
(Replace with your SDK path)

### Issue: "CocoaPods not installed" (iOS)
**Solution**:
```bash
sudo gem install cocoapods
cd capacitor-app/ios/App
pod install
```

### Issue: APK not building
**Solution**: Clean Gradle cache:
```bash
cd capacitor-app/android
./gradlew clean
./gradlew assembleRelease
```

### Issue: White screen on app launch
**Solution**: 
1. Check `server.url` in `capacitor.config.ts` is correct
2. Ensure web app is deployed and accessible
3. Clear app data and reinstall

## Distribution

### Android:
- **Google Play Store**: Upload AAB (not APK) via Google Play Console
- **Direct Distribution**: Share signed APK via web/downloads/

### iOS:
- **App Store**: Archive → Upload to App Store Connect
- **TestFlight**: Distribute beta builds to testers
- **Enterprise**: Requires Apple Developer Enterprise Program

## Updating the App

After updating the web app:

1. **Sync changes:**
   ```bash
   cd capacitor-app
   npx cap sync
   ```

2. **Rebuild:**
   ```bash
   # Android
   bash ../ops/build-apk.sh
   
   # iOS
   npx cap open ios
   # Then build in Xcode
   ```

3. **Deploy:**
   - Upload new version to stores
   - Or distribute new APK directly

## Environment Variables

For production builds with API keys:

1. **Create `.env` file** in `capacitor-app/`:
   ```env
   OPENAI_API_KEY=sk-...
   RPC_URL=https://...
   PRIVATE_KEY=0x...
   ```

2. **Access in app:**
   ```javascript
   const apiKey = process.env.OPENAI_API_KEY;
   ```

**⚠️ Security Note**: Never commit `.env` to git. Add to `.gitignore`.

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/studio)
- [iOS Developer Guide](https://developer.apple.com/xcode/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

**Questions?** Contact the Verum Omnis Foundation team.

© 2025 Verum Omnis Foundation. Patent Pending.
