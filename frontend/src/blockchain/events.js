import { getEthersProvider, getContractInstance } from './contract';
import { DEFAULT_CONTRACT_ADDRESS } from '../config/contractConfig';

/**
 * Queries historical ProviderAdded and ProviderRemoved events to determine provider authorization history.
 * @param {string} [contractAddress]
 * @returns {Promise<Array<{address: string, isAuthorized: boolean, transactionHash: string, blockNumber: number}>>}
 */
export async function fetchProviderEvents(contractAddress = DEFAULT_CONTRACT_ADDRESS) {
  try {
    const provider = await getEthersProvider();
    const contract = getContractInstance(provider, contractAddress);

    const addedFilter = contract.filters.ProviderAdded();
    const removedFilter = contract.filters.ProviderRemoved();

    const [addedEvents, removedEvents] = await Promise.all([
      contract.queryFilter(addedFilter, 0, 'latest'),
      contract.queryFilter(removedFilter, 0, 'latest')
    ]);

    const providerMap = new Map();

    for (const event of addedEvents) {
      const providerAddr = event.args[0];
      providerMap.set(providerAddr.toLowerCase(), {
        address: providerAddr,
        isAuthorized: true,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        action: 'ADDED'
      });
    }

    for (const event of removedEvents) {
      const providerAddr = event.args[0];
      if (providerMap.has(providerAddr.toLowerCase())) {
        providerMap.set(providerAddr.toLowerCase(), {
          address: providerAddr,
          isAuthorized: false,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          action: 'REMOVED'
        });
      }
    }

    return Array.from(providerMap.values());
  } catch (err) {
    console.error('Error fetching provider events:', err);
    return [];
  }
}

/**
 * Queries all historical RecordRegistered events from the contract.
 * Optionally filters by provider address.
 * @param {string} [contractAddress]
 * @param {string|null} [providerAddress]
 * @returns {Promise<Array<{recordId: string, recordHash: string, provider: string, timestamp: number, transactionHash: string, blockNumber: number}>>}
 */
export async function fetchRecordRegisteredEvents(contractAddress = DEFAULT_CONTRACT_ADDRESS, providerAddress = null) {
  try {
    const provider = await getEthersProvider();
    const contract = getContractInstance(provider, contractAddress);

    const filter = contract.filters.RecordRegistered();
    const events = await contract.queryFilter(filter, 0, 'latest');

    const records = events.map(event => ({
      recordId: event.args[0],
      recordHash: event.args[1],
      provider: event.args[2],
      timestamp: Number(event.args[3]),
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
    }));

    if (providerAddress) {
      const target = providerAddress.toLowerCase();
      return records.filter(r => r.provider.toLowerCase() === target);
    }

    return records.reverse(); // Most recent first
  } catch (err) {
    console.error('Error fetching record events:', err);
    return [];
  }
}

/**
 * Fetches contract owner / admin address.
 * @param {string} [contractAddress]
 * @returns {Promise<string>}
 */
export async function fetchContractOwner(contractAddress = DEFAULT_CONTRACT_ADDRESS) {
  try {
    const provider = await getEthersProvider();
    const contract = getContractInstance(provider, contractAddress);
    return await contract.owner();
  } catch (err) {
    console.error('Error fetching contract owner:', err);
    return '';
  }
}

/**
 * Combines all blockchain events into a unified chronological audit trail.
 * @param {string} [contractAddress]
 * @returns {Promise<Array<Object>>}
 */
export async function fetchAllActivityLogs(contractAddress = DEFAULT_CONTRACT_ADDRESS) {
  try {
    const provider = await getEthersProvider();
    const contract = getContractInstance(provider, contractAddress);

    const [addedEvents, removedEvents, recordEvents] = await Promise.all([
      contract.queryFilter(contract.filters.ProviderAdded(), 0, 'latest'),
      contract.queryFilter(contract.filters.ProviderRemoved(), 0, 'latest'),
      contract.queryFilter(contract.filters.RecordRegistered(), 0, 'latest')
    ]);

    const activities = [];

    for (const event of addedEvents) {
      activities.push({
        id: `added-${event.transactionHash}`,
        type: 'PROVIDER_ADDED',
        title: 'Healthcare Provider Authorized',
        detail: event.args[0],
        provider: event.args[0],
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
      });
    }

    for (const event of removedEvents) {
      activities.push({
        id: `removed-${event.transactionHash}`,
        type: 'PROVIDER_REMOVED',
        title: 'Healthcare Provider Revoked',
        detail: event.args[0],
        provider: event.args[0],
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
      });
    }

    for (const event of recordEvents) {
      activities.push({
        id: `record-${event.args[0]}-${event.transactionHash}`,
        type: 'RECORD_REGISTERED',
        title: 'Medical Record Registered',
        detail: `Record ID: ${event.args[0]}`,
        recordId: event.args[0],
        recordHash: event.args[1],
        provider: event.args[2],
        timestamp: Number(event.args[3]),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
      });
    }

    // Sort descending by block number
    return activities.sort((a, b) => b.blockNumber - a.blockNumber);
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    return [];
  }
}
