# Setup Capacitor Android Platform
# Run this script from the capacitor-app directory

Write-Host "🔧 Setting up Capacitor Android platform..." -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "capacitor.config.ts")) {
    Write-Host "❌ Error: capacitor.config.ts not found" -ForegroundColor Red
    Write-Host "Please run this script from the capacitor-app directory" -ForegroundColor Yellow
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Create www directory if it doesn't exist
if (-not (Test-Path "www")) {
    Write-Host "📁 Creating www directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "www" | Out-Null
}

# Copy web assets
Write-Host "📄 Copying web assets..." -ForegroundColor Yellow
Copy-Item -Path "..\web\*" -Destination "www\" -Recurse -Force

# Add Android platform if it doesn't exist
if (-not (Test-Path "android")) {
    Write-Host "🤖 Adding Android platform..." -ForegroundColor Yellow
    npx cap add android
} else {
    Write-Host "✅ Android platform already exists" -ForegroundColor Green
}

# Sync with native platforms
Write-Host "🔄 Syncing with native platforms..." -ForegroundColor Yellow
npx cap sync

Write-Host ""
Write-Host "✅ Capacitor Android setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open Android Studio: npx cap open android" -ForegroundColor White
Write-Host "  2. Build APK: cd android; .\gradlew assembleRelease" -ForegroundColor White
Write-Host "  3. Find APK at: android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor White
Write-Host ""
