# Security & Privacy Policy

**Project:** Blockchain-Based Medical Record Verification System  
**Audit Status:** Academic & Demonstration System (Not Professionally Audited)

---

## 🔒 Threat Model & Data Minimization

The primary security objective of this system is **document integrity verification** without sacrificing **patient privacy** or violating healthcare privacy standards (such as HIPAA).

### 1. What IS Stored On-Chain:
- **`recordHash`**: 32-byte cryptographic SHA-256 digest (`bytes32`).
- **`provider`**: Public Ethereum wallet address of the authorized healthcare provider (`msg.sender`).
- **`timestamp`**: Block timestamp of registration.
- **`exists`**: Boolean existence flag.

### 2. What IS NOT Stored On-Chain:
- **Medical PDF/DOCX files or raw document contents are NEVER uploaded to or stored on the blockchain.**
- **No patient names, ages, diagnoses, or personally identifiable information (PII) are stored on-chain.**
- Hashing occurs 100% locally inside the user's web browser using the native Web Crypto API (`crypto.subtle.digest`).

---

## 🛡️ Security Mechanisms

### 1. Smart Contract Access Control
- **Owner Privileges (`onlyOwner`):** Admin rights (`addProvider` and `removeProvider`) are strictly restricted to the contract deployer address (`owner`).
- **Provider Rights (`onlyAuthorizedProvider`):** Only addresses explicitly authorized by the owner can register medical record hashes (`registerRecord`).
- **Duplicate & Empty ID Guards:** Prevents registering empty record IDs, zero hashes, or duplicate record IDs.

### 2. Cryptographic Hash Integrity
- **Algorithm:** SHA-256 (256-bit / 32 bytes).
- **Determinism:** Identical file contents always produce the exact same 64-character hexadecimal hash, regardless of file name or file path.
- **Avalanche Effect:** Altering even a single character or byte in a document produces a completely different hash, guaranteeing instant tamper detection.

### 3. Wallet & Secret Management
- **Zero Private Key Exposure:** Private keys and seed phrases are **never** stored in frontend source code, `.env` files, browser localStorage, or version control.
- **Git Protection:** `.gitignore` excludes all `.env`, `*.env`, and `private_key*` files.

---

## ⚠️ Limitations & Disclaimers

1. **Audit Disclaimer:** This application has **not been professionally audited by a third-party cybersecurity firm**. It is intended strictly for academic demonstration and research purposes.
2. **Clinical Disclaimer:** Blockchain verification proves **document hash integrity against tampering**, not the clinical accuracy or validity of the medical diagnoses contained within the report.
3. **Data Disclaimer:** Only fictional/synthetic medical test data should be used during demonstration.
