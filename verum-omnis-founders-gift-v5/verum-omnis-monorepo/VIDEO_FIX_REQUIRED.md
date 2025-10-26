# Video Access Fix Required

## Problem
All three video URLs in `web/data/videos.json` return **HTTP 404** when accessed:
- Landing: `https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/assets%2Fvideo%20landing%20page.mp4?alt=media`
- Institutions1: `https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/assets%2Fbank%20promo%20long.mp4?alt=media`
- Institutions2: `https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/assets%2Fbank%20promo.mp4?alt=media`

## Root Cause
The videos exist in Firebase Storage project **verumdone**, but the **Storage Rules** are blocking public read access to the `/assets/**` path.

## Solution Required (Firebase Console - Project: verumdone)

### Option 1: Firebase Console (Manual - 2 minutes)
1. Go to: https://console.firebase.google.com/project/verumdone/storage
2. Click **Rules** tab
3. Replace with:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /assets/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```
4. Click **Publish**
5. Test: `curl -I "https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/assets%2Fvideo%20landing%20page.mp4?alt=media"` should return **HTTP 200**

### Option 2: Firebase CLI (if you have access)
```bash
# Switch to verumdone project
firebase use verumdone

# Deploy storage rules
firebase deploy --only storage

# Verify
curl -I "https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/assets%2Fvideo%20landing%20page.mp4?alt=media"
```

## What I Already Fixed in This Repo
- ✅ Created `storage.rules` with public read access for `/assets/**`
- ✅ Updated `firebase.json` to reference `storage.rules`
- ✅ Fixed corrupted `web/institutions.html` (videos now render when accessible)
- ✅ Added hero video to `web/index.html` (wired to `videos.json`)

## Verification After Fix
Once storage rules are deployed to **verumdone** project:
1. Open `https://yoursite.web.app/` (landing page) → hero video should autoplay
2. Open `https://yoursite.web.app/institutions.html` → two videos should be visible with controls

## Current State
- **Code/HTML**: ✅ Ready (videos wired correctly)
- **Firebase Storage Rules (verumdone project)**: ❌ Needs deployment (blocking access)
- **Video files**: ✅ Exist in bucket (confirmed by instructions.md)

---
**Action Required:** Deploy storage rules to the **verumdone** Firebase project (separate from gitverum).
