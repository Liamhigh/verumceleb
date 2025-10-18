

# Verum Omnis — Product Specification

**Tagline:** *The World’s First Legal AI — Your law firm in your pocket.*

---

## 1. Overview

Verum Omnis is a **stateless forensic AI firewall**. It lets any citizen upload a file (PDF, image, audio, video, email, doc), receive an on-device sealed output (PDF 1.7 with logo, watermark, QR, SHA-512), and optionally anchor that receipt to a blockchain.  

- **Free for citizens**  
- **Paid for institutions & businesses** (20% fraud recovery model or licensing fees)  
- **No telemetry, no data stored**  

---

## 2. Brand Principles

- **Truth belongs to the people** — justice free for citizens.  
- **Stateless** — no personal data leaves the device.  
- **Tamper-proof outputs** — SHA-512, QR, logo, watermark.  
- **Universal jurisdiction** — sealed docs are globally admissible.  

---

## 3. Information Architecture

### Landing Page Sections
1. **Hero**  
   - Title: *Verum Omnis: The World’s First Legal AI*  
   - Subtitle: *Your law firm in your pocket.*  
   - CTAs:  
     - **Open Chat** → `/assistant`  
     - **Download Firewall (APK)**  

2. **Why Verum Omnis?**  
   - World’s First Legal AI  
   - 100% Free for Citizens  
   - Contradiction Engine  

3. **For Institutions & Businesses**  
   - Fraud prevention, admissible reports  
   - Paid after trial (20% recovery / licensing fees)  

4. **Features Grid**  
   - Contradiction Detection  
   - Blockchain-Anchored Proofs  
   - Forensic Analysis  
   - Global Jurisdiction  

5. **How It Works (3 steps)**  
   1. Open Chat  
   2. Verify & Seal (PDF, QR, SHA-512)  
   3. Anchor (optional)  

6. **FAQ**  
   - Is it free?  
   - Does it work in my country?  
   - How is this different from other AI?  
   - What about privacy?  

7. **Mission Quote**  
   > “Truth can be verified. Fraud can be exposed. Justice can be democratized.”  

8. **Demo Video** (2:30 explainer)  

9. **Footer**  
   - © Verum Omnis Foundation  
   - Motto: *Truth belongs to the people*  

---

## 4. App Architecture

### On-Device (APK / iOS)
- File intake (docs, PDFs, media)  
- Local SHA-512 hashing  
- Contradiction Engine (rule-based + bundled model)  
- PDF Sealer (PDF 1.7, logo, watermark, QR + truncated SHA-512)  
- Offline mode supported  

### Stateless API (Optional)
Single endpoint:

POST /assistant

**Payload:**
```json
{
  "mode": "anchor|policy|receipt|verify|notice",
  "hash": "sha512-hex"
}

Modes:

anchor: returns signed blockchain anchor request

policy: returns latest signed constitution.json + manifest

receipt: returns signed JSON receipt (timestamp, txid)

verify: echoes expected model/rule hashes

notice: returns current licensing text


All responses JSON. No PII.


---

5. Outputs

PDF 1.7 (forensic locked):

Logo top-center

Watermark logo centered under text

Bottom-right: ✔ Patent Pending Verum Omnis + QR + truncated SHA-512


JSON Receipt: hash, timestamp, anchor id

Optional Blockchain Anchor: Ethereum/Polygon txid



---

6. User Flows

Citizen

1. Opens app → chooses “Private Citizen”


2. Uploads doc/media → gets sealed PDF & receipt


3. Can optionally anchor (if online)



Institution

1. Opens app → chooses “Institution”


2. Uploads doc → receives sealed PDF & receipt


3. Notice displayed: Free trial, licensing fees apply


4. Anchors to blockchain for audit trail




---

7. Technical Contracts

File size: up to 100MB per upload

Hash: SHA-512 (hex)

PDF Standard: PDF 1.7, compression disabled

Fonts: DejaVuSans (cross-platform stable)

QR: encodes receipt JSON (hash + metadata)

Storage: none — outputs only returned to user



---

8. Definition of Done (DoD)

[ ] Landing page deployed with working CTAs

[ ] PRODUCT_SPEC.md in repo root (this file)

[ ] Sample sealed PDF in /samples

[ ] /assistant endpoint live with all modes

[ ] /api/notice returns licensing text

[ ] APK/AAB downloadable with checksum posted

[ ] Lighthouse mobile ≥ 90 (performance & accessibility)



---

9. Licensing Notice

Citizens: Free forever.

Institutions/Businesses: Paid — either 20% of fraud recovery or licensing contract.



---

10. Motto

Truth belongs to the people.




