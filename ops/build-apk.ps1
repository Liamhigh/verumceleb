# Build APK for Verum Omnis Android App (PowerShell)
# Requires: Android SDK, Gradle

param(
    [switch]$SkipSync = $false
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Verum Omnis APK Build" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$CapacitorDir = "verum-omnis-founders-gift-v5/verum-omnis-monorepo/capacitor-app"
$WebDir = "verum-omnis-founders-gift-v5/verum-omnis-monorepo/web"
$OutputDir = "$CapacitorDir/android/app/build/outputs/apk/release"
$FinalApk = "$WebDir/downloads/verum-omnis.apk"

# Check if we're in the right directory
if (-not (Test-Path $CapacitorDir)) {
    Write-Host "Error: Capacitor directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the repository root."
    exit 1
}

Write-Host "Step 1: Install Capacitor dependencies..." -ForegroundColor Yellow
Push-Location $CapacitorDir
npm install
Pop-Location

if (-not $SkipSync) {
    Write-Host ""
    Write-Host "Step 2: Sync web assets to Capacitor..." -ForegroundColor Yellow
    Push-Location $CapacitorDir
    npx cap sync android
    Pop-Location
}

Write-Host ""
Write-Host "Step 3: Build Android APK with Gradle..." -ForegroundColor Yellow
Push-Location "$CapacitorDir/android"
.\gradlew.bat assembleRelease
Pop-Location

Write-Host ""
Write-Host "Step 4: Copy APK to web/downloads..." -ForegroundColor Yellow
if (-not (Test-Path "$WebDir/downloads")) {
    New-Item -ItemType Directory -Path "$WebDir/downloads" -Force | Out-Null
}
Copy-Item "$OutputDir/app-release.apk" $FinalApk -Force

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "✓ Build Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "APK Location: $FinalApk"
$apkSize = (Get-Item $FinalApk).Length / 1MB
Write-Host "Size: $([Math]::Round($apkSize, 2)) MB"
Write-Host ""
Write-Host "To install on device:" -ForegroundColor Cyan
Write-Host "  adb install $FinalApk"
Write-Host ""
Write-Host "To sign for release:" -ForegroundColor Cyan
Write-Host "  jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore my-release-key.jks $FinalApk alias_name"
Write-Host ""
