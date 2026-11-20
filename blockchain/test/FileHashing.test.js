import { expect } from "chai";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import hre from "hardhat";
import { calculateFileHash, formatHashAsBytes32 } from "../utils/hashUtils.js";

const { ethers } = hre;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, "fixtures");

describe("Phase 2 — SHA-256 File Integrity Hashing Tests", function () {
  let originalFileBuffer;
  let modifiedFileBuffer;
  let copyABuffer;
  let copyBBuffer;
  let emptyFileBuffer;

  before(function () {
    originalFileBuffer = fs.readFileSync(path.join(fixturesDir, "medical-report-original.txt"));
    modifiedFileBuffer = fs.readFileSync(path.join(fixturesDir, "medical-report-modified.txt"));
    copyABuffer = fs.readFileSync(path.join(fixturesDir, "report-copy-a.txt"));
    copyBBuffer = fs.readFileSync(path.join(fixturesDir, "report-copy-b.txt"));
    emptyFileBuffer = fs.readFileSync(path.join(fixturesDir, "empty-file.txt"));
  });

  describe("Test 1 — Same File Hashing Consistency", function () {
    it("Should produce identical SHA-256 hashes when hashing the exact same file twice", async function () {
      const hash1 = await calculateFileHash(originalFileBuffer);
      const hash2 = await calculateFileHash(originalFileBuffer);

      expect(hash1).to.be.a("string").with.lengthOf(64);
      expect(hash1).to.equal(hash2);
    });
  });

  describe("Test 2 — Different Files Produce Different Hashes", function () {
    it("Should produce different SHA-256 hashes for completely different files", async function () {
      const hashOriginal = await calculateFileHash(originalFileBuffer);
      const hashModified = await calculateFileHash(modifiedFileBuffer);

      expect(hashOriginal).to.not.equal(hashModified);
    });
  });

  describe("Test 3 — Tamper Detection (Modified File Content)", function () {
    it("Should detect content modification (Normal -> Abnormal) resulting in different hashes", async function () {
      const originalHash = await calculateFileHash(originalFileBuffer);
      const modifiedHash = await calculateFileHash(modifiedFileBuffer);

      expect(originalHash).to.not.equal(modifiedHash);
      console.log("   [Tamper Verification]");
      console.log("   Original Hash: %s", originalHash);
      console.log("   Modified Hash: %s", modifiedHash);
    });
  });

  describe("Test 4 — Filename Independence", function () {
    it("Should produce identical hashes for files with identical contents but different filenames", async function () {
      const hashA = await calculateFileHash(copyABuffer);
      const hashB = await calculateFileHash(copyBBuffer);

      expect(hashA).to.equal(hashB);
      console.log("   [Filename Independence Verification]");
      console.log("   Hash(report-copy-a.txt): %s", hashA);
      console.log("   Hash(report-copy-b.txt): %s", hashB);
    });
  });

  describe("Test 5 — Empty File Hashing", function () {
    it("Should return standard SHA-256 hash for an empty file without crashing", async function () {
      const emptyHash = await calculateFileHash(emptyFileBuffer);

      // SHA-256 of empty content is e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
      const expectedEmptyHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

      expect(emptyHash).to.be.a("string").with.lengthOf(64);
      expect(emptyHash).to.equal(expectedEmptyHash);
    });
  });

  describe("Test 6 — Blockchain Compatibility (Solidity bytes32 Conversion)", function () {
    it("Should correctly format 64-char hex hash into ethers.js / Solidity bytes32 format (0x + 64 hex)", async function () {
      const rawHexHash = await calculateFileHash(originalFileBuffer);
      const bytes32Hash = formatHashAsBytes32(rawHexHash);

      expect(bytes32Hash).to.be.a("string").with.lengthOf(66);
      expect(bytes32Hash.startsWith("0x")).to.be.true;

      // Verify compatibility with ethers.js bytes32 validation
      expect(ethers.isBytesLike(bytes32Hash)).to.be.true;
      expect(ethers.dataLength(bytes32Hash)).to.equal(32);

      console.log("   [Solidity bytes32 Conversion]");
      console.log("   Raw SHA-256 Hex: %s", rawHexHash);
      console.log("   Solidity bytes32: %s", bytes32Hash);
    });
  });
});
