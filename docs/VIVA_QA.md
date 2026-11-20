# Viva Voce Preparation Guide (Q&A)

**Project:** Blockchain-Based Medical Record Verification System  
**Level:** Academic / College Project Evaluation

---

### Q1. What core problem does this project solve?
**Answer:** Traditional electronic medical reports (PDFs, lab tests) can be altered or forged after issuance. This project provides a decentralized, tamper-proof mechanism to verify whether a medical report's content has been modified without uploading confidential patient files to a public server or blockchain.

---

### Q2. Why is Blockchain used in this project instead of a traditional database?
**Answer:** Centralized databases can be modified by database administrators, hacked, or suffer single points of failure. Blockchain provides an immutable, transparent, and decentralized ledger where recorded cryptographic hashes cannot be retroactively altered or deleted by anyone, including the project owners.

---

### Q3. Why use SHA-256 for document hashing?
**Answer:** SHA-256 (Secure Hash Algorithm 256-bit) is a deterministic cryptographic hash function that produces a unique 256-bit (64 hexadecimal character) output. It exhibits the **avalanche effect**: altering even a single byte or character in a document produces a completely different hash digest, ensuring instant tamper detection.

---

### Q4. Why are actual medical files/PDFs NOT stored on the blockchain?
**Answer:**
1. **Patient Privacy & HIPAA:** Storing sensitive medical documents on a public ledger violates patient privacy standards.
2. **Storage Costs:** Storing multi-megabyte PDF files directly on-chain is prohibitively expensive and inefficient. Storing only a 32-byte cryptographic hash is gas-efficient and 100% privacy-preserving.

---

### Q5. What is a Smart Contract, and what role does it play here?
**Answer:** A smart contract is a self-executing program stored on the blockchain. In our project, `MedicalRecordVerification.sol` manages authorized healthcare provider permissions (`onlyOwner` / `onlyAuthorizedProvider`) and securely stores registered document hashes along with provider wallet addresses and timestamps.

---

### Q6. Why use Ethereum Sepolia testnet?
**Answer:** Ethereum Sepolia is the official public Ethereum test network. It mimics Ethereum mainnet consensus and smart contract behavior without requiring real monetary ETH, allowing live public demonstrations and Etherscan verification.

---

### Q7. What is MetaMask and how does it integrate with the frontend?
**Answer:** MetaMask is a Web3 browser extension acting as an Ethereum wallet and key management tool. It exposes an EIP-1193 provider (`window.ethereum`) allowing the React application to request account access, sign transactions, and interact with smart contracts.

---

### Q8. What is ethers.js v6 and how is it used?
**Answer:** `ethers.js` is a lightweight JavaScript library used to interact with the Ethereum blockchain. It connects to MetaMask via `BrowserProvider`, instantiates `Contract` objects using compiled ABI artifacts, formats data types, and queries event logs (`queryFilter`).

---

### Q9. What is `bytes32` in Solidity and why convert the SHA-256 hex string?
**Answer:** In Solidity, `bytes32` is a fixed-size 32-byte array. SHA-256 produces 32 raw bytes (64 hexadecimal characters). Prefixing the 64-char hex string with `0x` formats it as a valid 66-character `bytes32` value (e.g. `0x3a4a91d7...`), enabling gas-optimized storage in Solidity.

---

### Q10. What is a Transaction Hash (Tx Hash)?
**Answer:** A transaction hash is a unique 66-character identifier (e.g., `0x8b6e3d...`) generated when a transaction is submitted to the blockchain network. It can be looked up on Etherscan to publicly verify block inclusion, gas used, and timestamp.

---

### Q11. Who is allowed to register medical record hashes on-chain?
**Answer:** Only wallet addresses authorized by the contract owner (`onlyAuthorizedProvider`) can call `registerRecord(recordId, recordHash)`. Unauthorized wallets attempting registration are rejected by the smart contract's modifier.

---

### Q12. How does Patient Verification work under the hood?
**Answer:**
1. Patient selects a local file and enters a Record ID (`MR-001`).
2. Browser calculates the SHA-256 hash of the local file (`Hash A`).
3. Application queries the smart contract (`getRecord("MR-001")`) to fetch the registered hash (`Hash B`).
4. If `Hash A === Hash B`, the UI displays **VERIFIED**. If different, it displays **MODIFIED / INVALID**.

---

### Q13. Does the system verify medical or clinical correctness?
**Answer:** **No.** The system strictly verifies **document file integrity against post-issuance tampering**. It proves whether the document content matches the exact file digest originally registered by the authorized healthcare provider.

---

### Q14. What happens if an authorized provider tries to register the same Record ID twice?
**Answer:** The smart contract checks `require(!records[recordId].exists, "Record ID already registered")`. The second transaction is reverted on-chain, preventing duplicate registrations or overwrites.

---

### Q15. What happens if a patient modifies one character in a lab report?
**Answer:** Modifying even a single character changes the SHA-256 hash completely. The calculated hash will not match the registered blockchain hash, triggering the **MODIFIED / INVALID** warning.

---

### Q16. Does changing the file name alter the SHA-256 hash?
**Answer:** **No.** Hashing reads the actual binary content bytes of the file (`ArrayBuffer`). Two files with identical contents but different names (`report-a.txt` and `report-b.txt`) yield the exact same SHA-256 digest (**VERIFIED**).

---

### Q17. Is this application HIPAA compliant?
**Answer:** **No.** While the system follows zero-knowledge data minimization principles by storing no PII on-chain, full regulatory HIPAA compliance requires comprehensive legal, operational, and administrative safeguards beyond an academic prototype.

---

### Q18. What event querying is performed by the frontend?
**Answer:** The frontend uses `contract.queryFilter` to fetch historical `ProviderAdded`, `ProviderRemoved`, and `RecordRegistered` event logs directly from the blockchain node, populating the Activity Audit Stream and Record Explorer without duplicate databases.

---

### Q19. How does the application handle incorrect blockchain networks?
**Answer:** The application detects connected chain IDs (`31337` for Localhost, `11155111` for Sepolia). If connected to an unsupported network, write operations are blocked and an explicit "Switch to Sepolia" banner appears.

---

### Q20. What are the key technical limitations of this project?
**Answer:**
1. Not professionally audited by a third-party cybersecurity firm.
2. Relies on testnet ETH gas for Sepolia transactions.
3. Designed for academic demonstration with fictional medical data.
