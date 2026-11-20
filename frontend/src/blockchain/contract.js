import { ethers } from "ethers";
import { 
  DEFAULT_LOCAL_CONTRACT_ADDRESS, 
  DEFAULT_SEPOLIA_CONTRACT_ADDRESS,
  SUPPORTED_NETWORKS, 
  getContractAddressForChain, 
  MEDICAL_RECORD_ABI 
} from "../config/contractConfig";

/**
 * Checks if MetaMask (or any EIP-1193 window.ethereum provider) is present.
 */
export function isMetaMaskInstalled() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

/**
 * Translates raw Ethereum / Ethers.js technical error messages into user-friendly UI strings.
 */
export function parseWeb3Error(err) {
  if (!err) return "An unexpected error occurred.";
  const msg = err.reason || err.message || String(err);

  if (msg.includes("user rejected") || msg.includes("ACTION_REJECTED") || err.code === 4001) {
    return "Transaction signature was cancelled in MetaMask.";
  }
  if (msg.includes("Record ID already registered") || msg.includes("Record ID already exists")) {
    return "Record ID already exists on the blockchain. Duplicate Record IDs are rejected.";
  }
  if (msg.includes("Only owner can perform this action")) {
    return "Access Denied: Only the contract deployer owner can perform this admin action.";
  }
  if (msg.includes("Only authorized providers can register records")) {
    return "Access Denied: Your wallet address is not authorized as a healthcare provider.";
  }
  if (msg.includes("insufficient funds") || msg.includes("INSUFFICIENT_FUNDS")) {
    return "Insufficient Sepolia ETH balance in your wallet to cover blockchain transaction gas fees.";
  }
  if (msg.includes("Record ID cannot be empty")) {
    return "Record ID cannot be empty.";
  }
  if (msg.includes("Record hash cannot be empty")) {
    return "Record hash cannot be zero or empty.";
  }
  if (msg.includes("Record does not exist")) {
    return "Record ID does not exist on the blockchain.";
  }
  return msg;
}

/**
 * Returns an ethers Provider.
 * If MetaMask is available, uses BrowserProvider.
 * Otherwise, falls back to RPC for read-only calls.
 */
export async function getEthersProvider(targetChainId = null) {
  if (isMetaMaskInstalled()) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  
  if (targetChainId === SUPPORTED_NETWORKS.SEPOLIA.chainId) {
    return new ethers.JsonRpcProvider(SUPPORTED_NETWORKS.SEPOLIA.rpcUrl);
  }
  return new ethers.JsonRpcProvider(SUPPORTED_NETWORKS.LOCAL_HARDHAT.rpcUrl);
}

/**
 * Gets a Contract instance.
 */
export function getContractInstance(runner, contractAddress = null) {
  const address = contractAddress || DEFAULT_LOCAL_CONTRACT_ADDRESS;
  return new ethers.Contract(address, MEDICAL_RECORD_ABI, runner);
}

/**
 * Connects to MetaMask and requests account access.
 * Returns account, chainId, networkName, signer, and contract instance.
 */
export async function connectMetaMaskWallet(customAddress = null) {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is required to interact with the blockchain. Please install the MetaMask browser extension.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found in MetaMask.");
  }

  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
  const numericChainId = Number(network.chainId);

  let networkName = "Unsupported Network";
  if (numericChainId === SUPPORTED_NETWORKS.SEPOLIA.chainId) {
    networkName = "Ethereum Sepolia";
  } else if (numericChainId === SUPPORTED_NETWORKS.LOCAL_HARDHAT.chainId) {
    networkName = "Hardhat Localhost";
  } else {
    networkName = `Network (${numericChainId})`;
  }

  const targetContractAddress = customAddress || getContractAddressForChain(numericChainId);
  const contract = getContractInstance(signer, targetContractAddress);

  return {
    account: accounts[0],
    networkName,
    chainId: numericChainId,
    signer,
    provider,
    contract,
    contractAddress: targetContractAddress,
  };
}

/**
 * Requests MetaMask to switch network to Ethereum Sepolia (Chain ID 11155111 / 0xaa36a7).
 */
export async function switchToSepoliaNetwork() {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SUPPORTED_NETWORKS.SEPOLIA.hexChainId }],
    });
    return true;
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SUPPORTED_NETWORKS.SEPOLIA.hexChainId,
              chainName: SUPPORTED_NETWORKS.SEPOLIA.name,
              nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: [SUPPORTED_NETWORKS.SEPOLIA.rpcUrl],
              blockExplorerUrls: [SUPPORTED_NETWORKS.SEPOLIA.explorerUrl],
            },
          ],
        });
        return true;
      } catch (addError) {
        throw new Error("Failed to add Ethereum Sepolia network to MetaMask.");
      }
    } else if (switchError.code === 4001) {
      throw new Error("Network switch was cancelled by user.");
    }
    throw switchError;
  }
}

/**
 * Requests MetaMask to switch network to Hardhat Localhost (Chain ID 31337 / 0x7a69).
 */
export async function switchToLocalhostNetwork() {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SUPPORTED_NETWORKS.LOCAL_HARDHAT.hexChainId }],
    });
    return true;
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SUPPORTED_NETWORKS.LOCAL_HARDHAT.hexChainId,
              chainName: SUPPORTED_NETWORKS.LOCAL_HARDHAT.name,
              nativeCurrency: { name: "Test ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: [SUPPORTED_NETWORKS.LOCAL_HARDHAT.rpcUrl],
            },
          ],
        });
        return true;
      } catch (addError) {
        throw new Error("Failed to add Localhost network to MetaMask.");
      }
    }
    throw switchError;
  }
}

/**
 * Read-only check to see if an address is an authorized healthcare provider.
 */
export async function isProviderAuthorized(walletAddress, contractAddress = DEFAULT_LOCAL_CONTRACT_ADDRESS) {
  try {
    const provider = await getEthersProvider();
    const contract = getContractInstance(provider, contractAddress);
    return await contract.isAuthorizedProvider(walletAddress);
  } catch (error) {
    console.error("Error checking provider authorization:", error);
    return false;
  }
}

/**
 * Registers a medical record hash on-chain (requires authorized provider signer).
 */
export async function registerRecordOnChain({
  recordId,
  recordHashBytes32,
  signer,
  contractAddress = DEFAULT_LOCAL_CONTRACT_ADDRESS
}) {
  if (!signer) {
    throw new Error("Wallet signer required to send registration transaction");
  }

  const contract = getContractInstance(signer, contractAddress);
  const tx = await contract.registerRecord(recordId, recordHashBytes32);
  const receipt = await tx.wait();

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    from: receipt.from,
    contractAddress: receipt.to,
  };
}

/**
 * Retrieves a medical record from the blockchain by record ID (read-only).
 */
export async function fetchRecordFromChain(recordId, contractAddress = DEFAULT_LOCAL_CONTRACT_ADDRESS) {
  const provider = await getEthersProvider();
  const contract = getContractInstance(provider, contractAddress);
  
  const [recordHash, providerAddress, timestamp, exists] = await contract.getRecord(recordId);

  return {
    recordHash,
    provider: providerAddress,
    timestamp: Number(timestamp),
    exists,
  };
}
