# Academic Project Summary & Report Material

**Project Title:** Blockchain-Based Medical Record Verification System  
**Core Technologies:** Solidity, Hardhat, Ethers.js v6, React, Vite, Web Crypto API (SHA-256), MetaMask, Ethereum Sepolia Testnet  
**Target Evaluation:** College Final Project / Viva Voce Submission

---

## 📝 Abstract

In modern healthcare informatics, electronic medical reports and laboratory diagnostic documents transmitted over unencrypted or centralized networks face significant risks of unauthorized alteration, forgery, or administrative tampering. This project presents a privacy-preserving, decentralized document integrity verification architecture. By combining client-side **SHA-256 cryptographic hashing** via the browser's Web Crypto API with a **Solidity smart contract** deployed on the Ethereum blockchain (Sepolia testnet & local Hardhat), the system anchors 32-byte document fingerprints on-chain. Sensitive patient data and actual medical report files remain 100% off-chain, ensuring complete zero-knowledge privacy. Patient or third-party verifiers can calculate local file hashes and compare them against immutable blockchain anchors to instantly detect document tampering with 100% mathematical precision.

---

## 🎯 Problem Statement

Electronic medical reports (PDFs, lab results, discharge summaries) are frequently shared with insurance providers, specialists, and patients via email or web portals. Centralized storage systems suffer from critical vulnerabilities:
1. **Malicious or Accidental Modification:** Centralized database administrators or attackers can alter diagnostic results (e.g. changing "Normal" to "Abnormal" or altering blood pressure/glucose figures).
2. **Lack of Verifiable Provenance:** Patients and third-party insurers have no independent cryptographic method to verify if a report was modified after official issuance by an authorized hospital.
3. **Privacy Concerns with Public Blockchains:** Uploading raw patient medical records to a public blockchain violates privacy laws (HIPAA/GDPR) and incurs extreme gas costs.

---

## 💡 Proposed Solution

Our system addresses these challenges through a **hybrid off-chain hashing & on-chain anchoring architecture**:
- **Zero Document Uploads:** Medical files are processed locally inside the browser. The actual binary document bytes never leave the user's device.
- **On-Chain Cryptographic Anchoring:** Only the 32-byte SHA-256 digest (`bytes32`), registering provider address, and block timestamp are recorded on the Ethereum blockchain.
- **Multi-Role Access Control:** Admin ownership controls healthcare provider authorizations (`onlyOwner`). Only verified provider wallets (`onlyAuthorizedProvider`) can register record hashes.
- **Deterministic Verification:** Any user can upload a report to recalculate its SHA-256 digest and compare it against the registered blockchain hash to instantly verify document authenticity.

---

## ⚙️ Methodology & Technical Workflow

```text
1. File Selection & Hashing
   User selects local medical report file (PDF, TXT, CSV)
          ↓
   Web Crypto API (crypto.subtle.digest("SHA-256", arrayBuffer))
          ↓
   Output: 64-character hexadecimal SHA-256 string

2. Smart Contract Registration
   Convert 64-char hex -> 0x-prefixed bytes32 format
          ↓
   Call MedicalRecordVerification.registerRecord(recordId, recordHash)
          ↓
   MetaMask signs & broadcasts transaction to Ethereum Sepolia / Localhost

3. Verification Process
   Patient uploads local document copy & enters Record ID
          ↓
   Browser re-computes SHA-256 digest
          ↓
   Contract view query getRecord(recordId) fetches stored hash
          ↓
   Hash Comparison: Local Hash === On-Chain Hash
          ↓
   Result: [✓ VERIFIED] (Green) or [✕ MODIFIED / INVALID] (Red)
```

---

## 📊 Results & Experimental Evaluation

The system was evaluated across 28 comprehensive automated and manual test scenarios:
- **Smart Contract Test Suite (Solidity 0.8.24):** 11/11 tests passed covering contract deployment, provider authorization, provider revocation, record registration, duplicate ID rejection, zero-hash rejection, and non-owner access rejection.
- **SHA-256 File Hashing Suite:** 6/6 tests passed verifying hashing consistency, tamper detection, empty file handling, filename independence, and `bytes32` conversion.
- **Production Build Performance:** Vite production build completed in 1.64 seconds with 0 errors.

---

## ⚠️ Project Limitations

1. **Third-Party Security Audit:** The smart contract has not been professionally audited by a commercial cybersecurity firm.
2. **Scope of Integrity:** The blockchain anchors document hash integrity against post-issuance tampering; it does not validate the clinical or medical accuracy of the diagnosis itself.
3. **Testnet Gas Dependency:** Sepolia transactions require testnet Sepolia ETH.

---

## 🚀 Future Roadmap

- **Decentralized Off-Chain Storage (IPFS):** Integrating encrypted IPFS storage for optional confidential file sharing.
- **FHIR & Hospital EHR Integration:** Standardized API connectors for HL7/FHIR hospital management systems.
- **Mobile QR Code Verification:** Embedding verification QR codes on physical printed medical reports.
