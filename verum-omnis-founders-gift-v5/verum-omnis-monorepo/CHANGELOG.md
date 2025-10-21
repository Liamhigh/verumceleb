# Changelog

## [Unreleased]

### Added
- Clickable action buttons (🔍 View Hash, 📜 Seal It, 🔗 Anchor It) to PDF text extraction failure responses in assistant.html
- SHA-512 hash pre-calculation before displaying action buttons for failed PDF text extractions

### Improved
- User experience when PDF text extraction fails - users now see clear, actionable buttons instead of just text suggestions
- Response formatting with better structure using strong tags for labels and visual dividers
- Consistency between initial file upload response and "READ IT" command response for failed extractions

### Fixed
- Missing action buttons in the "READ IT" command response when PDF text extraction fails
- Both conditional branches (scanned PDF check and general failure) now include the same action buttons

## Technical Changes

### File: `web/assistant.html`
**Lines 669-720**: Enhanced `handleTextMessage` function's PDF text extraction failure handling

**Before:**
- Text-only suggestions to "say 'seal it'"
- No immediate actionable UI elements
- Inconsistent with initial upload response which had buttons

**After:**
- Three clickable buttons for immediate action
- SHA-512 hash calculated on-demand
- Consistent user experience across different interaction flows
- Better visual hierarchy with dividers and formatted text

**Security:**
- Uses standard Web Crypto API (crypto.subtle.digest) for hash generation
- Same secure implementation used elsewhere in the application
- No new security vulnerabilities introduced
