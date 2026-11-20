# Blockchain Smart Contracts & Hardhat Environment

This directory contains the Solidity smart contract, Hardhat configuration, automated tests, and deployment scripts for the **Medical Record Verification System**.

---

## 📂 Directory Structure

```text
blockchain/
├── contracts/
│   └── MedicalRecordVerification.sol
├── scripts/
│   └── deploy.js
├── test/
│   ├── MedicalRecordVerification.test.js
│   ├── FileHashing.test.js
│   └── fixtures/
├── deployments/
│   ├── localhost.json
│   └── sepolia.json
├── hardhat.config.js
├── package.json
└── README.md
```

---

## ⚙️ Compilation & Testing

```bash
# Compile contracts
npx hardhat compile

# Run all 17 automated tests
npx hardhat test
```

---

## 🚀 Deployment Commands

```bash
# Deploy to local node
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 🔒 Security & Git Rules
- Do NOT commit `.env` or private keys.
- Deployment scripts generate non-secret public metadata in `deployments/*.json`.
