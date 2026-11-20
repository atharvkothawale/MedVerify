# Blockchain-Based Medical Record Verification System

A privacy-preserving medical record integrity verification system built with **Solidity**, **Hardhat**, **ethers.js v6**, **React**, **Vite**, **Tailwind CSS**, and **MetaMask**.

---

## 📌 1. Project Overview

In traditional healthcare IT infrastructure, electronic medical reports, laboratory diagnostic results, and medical certificates transmitted via email or web portals can be altered or forged after issuance.

This project solves medical document authenticity verification by using the Ethereum blockchain as an immutable cryptographic anchor. Rather than uploading confidential patient records to a public ledger, the system calculates a **SHA-256 cryptographic hash** locally inside the browser. Only the 32-byte hash fingerprint is stored on-chain alongside provider metadata.

> **Important Verification Disclaimer:** The system verifies **file integrity and authenticity against a previously registered cryptographic hash**. It does **not** verify the medical correctness or clinical accuracy of the document contents.

---

## 🌐 2. Definitive Network Configuration

| Network | Chain ID | Contract Address | Purpose |
| :--- | :---: | :--- | :--- |
| **Hardhat Localhost** | `31337` | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Development & Local Testing |
| **Ethereum Sepolia** | `11155111` | `0x0984E3715678afecb367f032d93F642f64180aa3` | Live College Demonstration |

---

## 🏗️ 3. System Architecture

```text
                 ┌──────────────────────┐
                 │     User / Patient   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   React Frontend     │
                 └──────────┬───────────┘
                            │
                 ┌──────────┴───────────┐
                 │                      │
                 ▼                      ▼
        ┌─────────────────┐     ┌─────────────────┐
        │ SHA-256 Hashing │     │    MetaMask     │
        │  File Contents  │     │ Wallet Provider │
        └────────┬────────┘     └────────┬────────┘
                 │                       │
                 └──────────┬────────────┘
                            ▼
                 ┌──────────────────────┐
                 │   ethers.js / Web3   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Solidity Smart       │
                 │ Contract             │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Ethereum Sepolia /   │
                 │ Hardhat Localhost    │
                 └──────────────────────┘
```

---

## 🔄 4. How SHA-256 Verification Works

### Registration Workflow:
```text
Medical Report File (PDF/TXT)
          ↓
Local Browser SHA-256 Hashing (Web Crypto API)
          ↓
64-Character Hex Hash -> 0x Bytes32 Format
          ↓
MetaMask Transaction (Signed by Authorized Provider)
          ↓
Solidity Smart Contract (`registerRecord`)
          ↓
On-Chain Immutable Storage (Hash + Provider + Timestamp)
```

### Verification Workflow:
```text
Uploaded Local File + Record ID
          ↓
Local Browser SHA-256 Hashing
          ↓
Smart Contract Query (`getRecord`)
          ↓
Hash Comparison: Local Hash === On-Chain Hash
          ↓
Result:  [✓ VERIFIED]  or  [✕ MODIFIED / INVALID]
```

---

## 👥 5. User Roles & Permissions

| Role | Access Level | Permissions |
|---|---|---|
| **Admin** | Contract Owner | Can authorize (`addProvider`) or revoke (`removeProvider`) provider wallet addresses. |
| **Healthcare Provider** | Authorized Wallet | Can compute document hashes and anchor them on-chain (`registerRecord`). |
| **Patient / Public** | Any Wallet / No Wallet | Can search Record IDs and verify local document integrity (`getRecord`). |

---

## 🛠️ 6. Technology Stack

- **Smart Contracts:** Solidity `0.8.24`, Hardhat `^2.22.0`, `@nomicfoundation/hardhat-toolbox@hh2`
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Blockchain Client:** `ethers` v6, Web3 EIP-1193 MetaMask Integration
- **Networks:** Hardhat Localhost (`Chain ID 31337`), Ethereum Sepolia Testnet (`Chain ID 11155111`)
- **Hashing:** Native Web Crypto API (`crypto.subtle.digest`)

---

## 🚀 7. Local Setup & Execution

### Install Dependencies
```bash
# Install root dependencies
npm install

# Install blockchain dependencies
cd blockchain && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Run Automated Test Suite (17 Tests)
```bash
cd blockchain
npx hardhat test
```

### Run Local Development Server
```bash
# Terminal 1 — Local Node
cd blockchain
npx hardhat node

# Terminal 2 — Deploy Contract Locally
cd blockchain
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3 — Launch React Frontend
cd frontend
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 🌐 8. Ethereum Sepolia Testnet Deployment

### Environment Configuration (.env)
Create a `.env` file in root or `blockchain/`:
```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_sepolia_testnet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Deploy to Sepolia
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network sepolia
```

### Verify Contract on Etherscan
```bash
cd blockchain
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
```

---

## 📚 9. Documentation & Evaluation Resources

- **Viva Voce Q&A Guide:** [docs/VIVA_QA.md](file:///d:/BlockChain/docs/VIVA_QA.md)
- **Project Academic Summary:** [docs/PROJECT_SUMMARY.md](file:///d:/BlockChain/docs/PROJECT_SUMMARY.md)
- **Final Test Report:** [docs/FINAL_TEST_REPORT.md](file:///d:/BlockChain/docs/FINAL_TEST_REPORT.md)
- **Security & Privacy Policy:** [docs/SECURITY.md](file:///d:/BlockChain/docs/SECURITY.md)
- **Live Demo Checklist:** [docs/FINAL_DEMO_CHECKLIST.md](file:///d:/BlockChain/docs/FINAL_DEMO_CHECKLIST.md)

---

## 🔒 10. Security & Limitations Disclaimer

1. **Zero Document Uploads:** Medical files never leave the browser.
2. **Zero PII On-Chain:** Patient names, ages, and medical details are never recorded on-chain.
3. **Secret Protection:** Private keys and `.env` files are strictly excluded via `.gitignore`.
4. **Audit Disclaimer:** This project is an academic demonstration and has **not been professionally audited**.

---

## 🔮 11. Future Scope

- **Decentralized Off-Chain Storage (IPFS):** Encrypted off-chain storage for confidential document sharing.
- **FHIR & Hospital EHR Integration:** Standardized API connectors for HL7/FHIR hospital management systems.
- **QR Code Verification:** Instant mobile verification by scanning QR codes printed on physical lab reports.
