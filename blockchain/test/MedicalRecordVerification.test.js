import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("MedicalRecordVerification", function () {
  let contract;
  let owner;
  let provider1;
  let provider2;
  let user;

  const sampleHashA = ethers.keccak256(ethers.toUtf8Bytes("Medical Record PDF Content Version 1"));
  const sampleHashB = ethers.keccak256(ethers.toUtf8Bytes("Medical Record PDF Content Version 2 (Tampered)"));
  const zeroHash = ethers.ZeroHash;

  beforeEach(async function () {
    [owner, provider1, provider2, user] = await ethers.getSigners();

    const MedicalRecordVerification = await ethers.getContractFactory("MedicalRecordVerification");
    contract = await MedicalRecordVerification.deploy();
    await contract.waitForDeployment();
  });

  describe("Test 1 — Deployment", function () {
    it("Should deploy successfully and set the deployer as owner", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe("Test 2 — Add Provider", function () {
    it("Should allow owner to add a provider, update status, and emit ProviderAdded event", async function () {
      await expect(contract.addProvider(provider1.address))
        .to.emit(contract, "ProviderAdded")
        .withArgs(provider1.address);

      expect(await contract.isAuthorizedProvider(provider1.address)).to.be.true;
      expect(await contract.authorizedProviders(provider1.address)).to.be.true;
    });
  });

  describe("Test 3 — Remove Provider", function () {
    it("Should allow owner to remove a provider and emit ProviderRemoved event", async function () {
      await contract.addProvider(provider1.address);
      expect(await contract.isAuthorizedProvider(provider1.address)).to.be.true;

      await expect(contract.removeProvider(provider1.address))
        .to.emit(contract, "ProviderRemoved")
        .withArgs(provider1.address);

      expect(await contract.isAuthorizedProvider(provider1.address)).to.be.false;
    });
  });

  describe("Test 4 — Unauthorized Provider", function () {
    it("Should reject record registration attempt from unauthorized wallet", async function () {
      await expect(
        contract.connect(provider1).registerRecord("MR001", sampleHashA)
      ).to.be.revertedWith("Only authorized providers can register records");
    });
  });

  describe("Test 5 — Authorized Provider Registration", function () {
    it("Should allow authorized provider to register record and emit RecordRegistered event", async function () {
      await contract.addProvider(provider1.address);

      const tx = await contract.connect(provider1).registerRecord("MR001", sampleHashA);
      const receipt = await tx.wait();

      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(contract, "RecordRegistered")
        .withArgs("MR001", sampleHashA, provider1.address, block.timestamp);

      const record = await contract.getRecord("MR001");
      expect(record.recordHash).to.equal(sampleHashA);
      expect(record.provider).to.equal(provider1.address);
      expect(record.timestamp).to.equal(block.timestamp);
      expect(record.exists).to.be.true;
    });
  });

  describe("Test 6 — Retrieve Record", function () {
    it("Should accurately retrieve registered record info and hash", async function () {
      await contract.addProvider(provider1.address);
      await contract.connect(provider1).registerRecord("MR001", sampleHashA);

      const record = await contract.getRecord("MR001");
      expect(record.recordHash).to.equal(sampleHashA);
      expect(record.provider).to.equal(provider1.address);
      expect(record.timestamp).to.be.gt(0);
      expect(record.exists).to.be.true;

      const recordHash = await contract.getRecordHash("MR001");
      expect(recordHash).to.equal(sampleHashA);
    });
  });

  describe("Test 7 — Duplicate Record", function () {
    it("Should reject duplicate registration of the same Record ID", async function () {
      await contract.addProvider(provider1.address);
      await contract.connect(provider1).registerRecord("MR001", sampleHashA);

      await expect(
        contract.connect(provider1).registerRecord("MR001", sampleHashA)
      ).to.be.revertedWith("Record ID already registered");
    });
  });

  describe("Test 8 — Empty Record ID / Zero Hash", function () {
    it("Should reject registration with empty record ID", async function () {
      await contract.addProvider(provider1.address);
      await expect(
        contract.connect(provider1).registerRecord("", sampleHashA)
      ).to.be.revertedWith("Record ID cannot be empty");
    });

    it("Should reject registration with zero hash", async function () {
      await contract.addProvider(provider1.address);
      await expect(
        contract.connect(provider1).registerRecord("MR002", zeroHash)
      ).to.be.revertedWith("Record hash cannot be empty");
    });
  });

  describe("Test 9 — Unauthorized Admin Action", function () {
    it("Should reject non-owner attempts to add or remove provider", async function () {
      await expect(
        contract.connect(user).addProvider(provider1.address)
      ).to.be.revertedWith("Only owner can perform this action");

      await contract.addProvider(provider1.address);

      await expect(
        contract.connect(user).removeProvider(provider1.address)
      ).to.be.revertedWith("Only owner can perform this action");
    });
  });

  describe("Test 10 — Different Hashes (Tamper Detection Concept)", function () {
    it("Should return Hash A for MR001 and demonstrate that Hash A != Hash B detects modified files", async function () {
      await contract.addProvider(provider1.address);
      await contract.connect(provider1).registerRecord("MR001", sampleHashA);

      const storedHash = await contract.getRecordHash("MR001");
      expect(storedHash).to.equal(sampleHashA);

      // Demonstrate Hash A != Hash B
      expect(sampleHashA).to.not.equal(sampleHashB);
    });
  });
});
