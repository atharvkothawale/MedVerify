// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MedicalRecordVerification
 * @dev Smart contract for managing authorized healthcare providers and verifying medical record hashes.
 * Medical records/files are NOT stored on-chain. Only SHA-256 cryptographic hashes and metadata are stored.
 */
contract MedicalRecordVerification {
    address public owner;

    struct MedicalRecord {
        bytes32 recordHash;
        address provider;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from Record ID to Medical Record data
    mapping(string => MedicalRecord) private records;

    // Mapping of authorized healthcare providers
    mapping(address => bool) public authorizedProviders;

    // Events
    event ProviderAdded(address provider);
    event ProviderRemoved(address provider);
    event RecordRegistered(
        string recordId,
        bytes32 recordHash,
        address provider,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAuthorizedProvider() {
        require(authorizedProviders[msg.sender], "Only authorized providers can register records");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Authorize a healthcare provider wallet address.
     * @param provider Address of the provider to authorize.
     */
    function addProvider(address provider) external onlyOwner {
        require(provider != address(0), "Invalid provider address");
        require(!authorizedProviders[provider], "Provider already authorized");
        authorizedProviders[provider] = true;
        emit ProviderAdded(provider);
    }

    /**
     * @dev Revoke authorization for a healthcare provider wallet address.
     * @param provider Address of the provider to remove.
     */
    function removeProvider(address provider) external onlyOwner {
        require(authorizedProviders[provider], "Provider is not authorized");
        authorizedProviders[provider] = false;
        emit ProviderRemoved(provider);
    }

    /**
     * @dev Check if an address is an authorized provider.
     * @param provider Address to check.
     */
    function isAuthorizedProvider(address provider) external view returns (bool) {
        return authorizedProviders[provider];
    }

    /**
     * @dev Register a new medical record hash on-chain.
     * @param recordId Unique identifier for the medical record.
     * @param recordHash Cryptographic SHA-256 (or keccak256/bytes32) hash of the medical document.
     */
    function registerRecord(string memory recordId, bytes32 recordHash) external onlyAuthorizedProvider {
        require(bytes(recordId).length > 0, "Record ID cannot be empty");
        require(recordHash != bytes32(0), "Record hash cannot be empty");
        require(!records[recordId].exists, "Record ID already registered");

        records[recordId] = MedicalRecord({
            recordHash: recordHash,
            provider: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit RecordRegistered(recordId, recordHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Retrieve the full record details for a given Record ID.
     * @param recordId Unique identifier for the medical record.
     */
    function getRecord(string memory recordId) external view returns (
        bytes32 recordHash,
        address provider,
        uint256 timestamp,
        bool exists
    ) {
        MedicalRecord memory rec = records[recordId];
        return (rec.recordHash, rec.provider, rec.timestamp, rec.exists);
    }

    /**
     * @dev Retrieve only the record hash for a given Record ID.
     * @param recordId Unique identifier for the medical record.
     */
    function getRecordHash(string memory recordId) external view returns (bytes32) {
        require(records[recordId].exists, "Record does not exist");
        return records[recordId].recordHash;
    }
}
