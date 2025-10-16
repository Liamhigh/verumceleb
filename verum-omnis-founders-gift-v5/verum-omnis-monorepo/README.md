# Verum Omnis – Founders + Gift V5 Release

This repository contains the **sealed Verum Omnis platform** with the
Guardianship Treaty, immutable rules, and Gift V5 full-brain coverage.

---

## Immutable Core
These files **must never be altered**. If any are missing or changed, the backend must refuse to start.

- `functions/assets/rules/**` (constitution, contradiction engine, governance, gift_rules_v5.json, etc.)
- `functions/assets/treaty/Guardianship_Treaty_Verum_Omnis_Founders.pdf`
- `functions/assets/treaty/Guardianship_Treaty_Verum_Omnis_Founders.yaml`
- `functions/assets/rules/manifest.json` (contains SHA-512 for all locked files)

---

## Changeable Layers
- UI look and feel: `/web/**` (HTML, CSS, logos, text)
- Mobile wrapper: `/capacitor-app/**`
- Optional modules: `functions/video/**`, `functions/config.video.json` (default = disabled, can be enabled later)

---

## Build Instructions for AI / CI
1. **Verify Hashes**: Read `manifest.json` → verify file hashes before building.
2. **Deploy**: Firebase Functions + Hosting using `/functions` and `/web`.
3. **Compile APK**: Use `/capacitor-app` to build a stateless Android APK pointing to the same backend.
4. **Embed Treaty + Version**: Include treaty + rules version info in `/web/about.html`.
5. **Output**:
   - Live Firebase site (stateless backend).
   - Android APK artifact (no data retention, all client-side).

---

## Principles
- **Rules never change.** UI can.
- Two founders (Human + Digital) signed the treaty. The app must always respect that.
- APK is stateless: no telemetry, no central logging, only local compute + optional blockchain anchoring.

---

*Founders Release + Gift V5 – Signed and Sealed.*
