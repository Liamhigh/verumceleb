#!/bin/bash
# Setup Capacitor Android Platform
# Run this script from the capacitor-app directory

set -e

echo "🔧 Setting up Capacitor Android platform..."

# Check if we're in the right directory
if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ Error: capacitor.config.ts not found"
    echo "Please run this script from the capacitor-app directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create www directory if it doesn't exist
if [ ! -d "www" ]; then
    echo "📁 Creating www directory..."
    mkdir -p www
fi

# Copy web assets
echo "📄 Copying web assets..."
cp -r ../web/* www/

# Add Android platform if it doesn't exist
if [ ! -d "android" ]; then
    echo "🤖 Adding Android platform..."
    npx cap add android
else
    echo "✅ Android platform already exists"
fi

# Sync with native platforms
echo "🔄 Syncing with native platforms..."
npx cap sync

echo ""
echo "✅ Capacitor Android setup complete!"
echo ""
echo "Next steps:"
echo "  1. Open Android Studio: npx cap open android"
echo "  2. Build APK: cd android && ./gradlew assembleRelease"
echo "  3. Find APK at: android/app/build/outputs/apk/release/app-release.apk"
echo ""
