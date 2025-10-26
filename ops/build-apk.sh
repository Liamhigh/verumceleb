#!/bin/bash
# Build APK for Verum Omnis Android App
# Requires: Android SDK, Gradle

set -e

echo "=================================="
echo "Verum Omnis APK Build"
echo "=================================="
echo ""

# Configuration
CAPACITOR_DIR="verum-omnis-founders-gift-v5/verum-omnis-monorepo/capacitor-app"
WEB_DIR="verum-omnis-founders-gift-v5/verum-omnis-monorepo/web"
OUTPUT_DIR="$CAPACITOR_DIR/android/app/build/outputs/apk/release"
FINAL_APK="$WEB_DIR/downloads/verum-omnis.apk"

# Check if we're in the right directory
if [ ! -d "$CAPACITOR_DIR" ]; then
    echo "Error: Capacitor directory not found!"
    echo "Please run this script from the repository root."
    exit 1
fi

echo "Step 1: Install Capacitor dependencies..."
cd "$CAPACITOR_DIR"
npm install

echo ""
echo "Step 2: Sync web assets to Capacitor..."
npx cap sync android

echo ""
echo "Step 3: Build Android APK with Gradle..."
cd android
./gradlew assembleRelease

echo ""
echo "Step 4: Copy APK to web/downloads..."
cd ../../../..
mkdir -p "$WEB_DIR/downloads"
cp "$OUTPUT_DIR/app-release.apk" "$FINAL_APK"

echo ""
echo "=================================="
echo "✓ Build Complete!"
echo "=================================="
echo "APK Location: $FINAL_APK"
echo "Size: $(du -h "$FINAL_APK" | cut -f1)"
echo ""
echo "To install on device:"
echo "  adb install $FINAL_APK"
echo ""
echo "To sign for release:"
echo "  jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore my-release-key.jks $FINAL_APK alias_name"
echo ""
