/**
 * Browser-compatible SHA-256 File Hashing Utility
 * Reads raw file content as an ArrayBuffer and computes SHA-256 using the native Web Crypto API.
 */

/**
 * Calculates the SHA-256 hash of a browser File, Blob, or ArrayBuffer object.
 * @param {File|Blob|ArrayBuffer|Uint8Array} fileData - The file object or buffer.
 * @returns {Promise<string>} 64-character lowercase hexadecimal hash string.
 */
export async function calculateFileHash(fileData) {
  if (!fileData) {
    throw new Error("No file or buffer provided for hashing");
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
  } else {
    throw new Error("Unsupported file data type for SHA-256 hashing");
  }

  const subtleCrypto = window.crypto?.subtle || globalThis.crypto?.subtle;
  if (!subtleCrypto) {
    throw new Error("Web Crypto API is not supported in this environment");
  }

  const hashBuffer = await subtleCrypto.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hexHash;
}

/**
 * Formats a 64-character SHA-256 hex string into a 0x-prefixed bytes32 string for Solidity compatibility.
 * @param {string} hexHash - 64-character hexadecimal string
 * @returns {string} 0x-prefixed 66-character bytes32 string
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
