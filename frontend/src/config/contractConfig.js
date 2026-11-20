export const DEFAULT_LOCAL_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const DEFAULT_SEPOLIA_CONTRACT_ADDRESS = import.meta.env?.VITE_SEPOLIA_CONTRACT_ADDRESS || "0x0984E3715678afecb367f032d93F642f64180aa3";
export const DEFAULT_CONTRACT_ADDRESS = DEFAULT_LOCAL_CONTRACT_ADDRESS;

export const CONTRACTS = {
  31337: {
    chainId: 31337,
    hexChainId: "0x7a69",
    name: "Hardhat Localhost",
    address: DEFAULT_LOCAL_CONTRACT_ADDRESS,
    rpcUrl: "http://127.0.0.1:8545",
    explorerUrl: null,
    purpose: "Development / Testing",
  },
  11155111: {
    chainId: 11155111,
    hexChainId: "0xaa36a7",
    name: "Ethereum Sepolia",
    address: DEFAULT_SEPOLIA_CONTRACT_ADDRESS,
    rpcUrl: import.meta.env?.VITE_SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
    explorerUrl: "https://sepolia.etherscan.io",
    purpose: "Live College Demonstration",
  },
};

export const SUPPORTED_NETWORKS = {
  LOCAL_HARDHAT: CONTRACTS[31337],
  SEPOLIA: CONTRACTS[11155111],
};

/**
 * Returns the distinct contract address based on the connected network chain ID.
 * Distinct local and Sepolia addresses are maintained independently.
 */
export function getContractAddressForChain(chainId) {
  const numericChainId = Number(chainId);
  if (numericChainId === CONTRACTS[11155111].chainId) {
    return CONTRACTS[11155111].address;
  }
  return CONTRACTS[31337].address;
}

/**
 * Returns an Etherscan URL for an address if on Sepolia.
 */
export function getEtherscanAddressUrl(address, chainId) {
  if (!address) return "#";
  const numericChainId = Number(chainId);
  if (numericChainId === CONTRACTS[11155111].chainId) {
    return `https://sepolia.etherscan.io/address/${address}`;
  }
  return "#";
}

/**
 * Returns an Etherscan URL for a transaction hash if on Sepolia.
 */
export function getEtherscanTxUrl(txHash, chainId) {
  if (!txHash) return "#";
  const numericChainId = Number(chainId);
  if (numericChainId === CONTRACTS[11155111].chainId) {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
  return "#";
}

export const MEDICAL_RECORD_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "provider",
        "type": "address"
      }
    ],
    "name": "ProviderAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "provider",
        "type": "address"
      }
    ],
    "name": "ProviderRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "recordId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "recordHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "provider",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "RecordRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "provider",
        "type": "address"
      }
    ],
    "name": "addProvider",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "authorizedProviders",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "recordId",
        "type": "string"
      }
    ],
    "name": "getRecord",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "recordHash",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "provider",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "recordId",
        "type": "string"
      }
    ],
    "name": "getRecordHash",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "provider",
        "type": "address"
      }
    ],
    "name": "isAuthorizedProvider",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "recordId",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "recordHash",
        "type": "bytes32"
      }
    ],
    "name": "registerRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "provider",
        "type": "address"
      }
    ],
    "name": "removeProvider",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
