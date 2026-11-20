import crypto from "node:crypto";

/**
 * Calculates the SHA-256 hash of a file, buffer, or string content.
 * Accepts: Buffer, ArrayBuffer, Uint8Array, Blob, File, or string.
 * @param {Buffer|ArrayBuffer|Uint8Array|Blob|File|string} fileData - The file content to hash.
 * @returns {Promise<string>} 64-character lowercase hexadecimal SHA-256 hash string.
 */
export async function calculateFileHash(fileData) {
  if (fileData === null || fileData === undefined) {
    throw new Error("Invalid input: file data must be provided");
  }

  let arrayBuffer;

  if (typeof Blob !== "undefined" && fileData instanceof Blob) {
    arrayBuffer = await fileData.arrayBuffer();
  } else if (fileData instanceof ArrayBuffer) {
    arrayBuffer = fileData;
  } else if (ArrayBuffer.isView(fileData)) {
    arrayBuffer = fileData.buffer.slice(
      fileData.byteOffset,
      fileData.byteOffset + fileData.byteLength
    );
  } else if (typeof fileData === "string") {
    arrayBuffer = new TextEncoder().encode(fileData).buffer;
  } else {
    throw new Error("Unsupported file data type for SHA-256 hashing");
  }

  // Use standard Web Crypto API (supported natively in modern browsers & Node.js 15+)
  const subtleCrypto =
    typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle
      ? globalThis.crypto.subtle
      : crypto.subtle;

  const hashBuffer = await subtleCrypto.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hexHash;
}

/**
 * Converts a 64-character SHA-256 hex string to a 0x-prefixed bytes32 string for Solidity compatibility.
 * @param {string} hexHash - 64-character hexadecimal string
 * @returns {string} 0x-prefixed 66-character string compatible with Solidity bytes32
 */
export function formatHashAsBytes32(hexHash) {
  if (!hexHash || typeof hexHash !== "string") {
    throw new Error("Invalid hex hash string");
  }

  const cleanHex = hexHash.startsWith("0x") ? hexHash.slice(2) : hexHash;

  if (cleanHex.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(cleanHex)) {
    throw new Error("Invalid SHA-256 hash format: must be 64 hexadecimal characters");
  }

  return "0x" + cleanHex.toLowerCase();
}
