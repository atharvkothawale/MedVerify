import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, UserPlus, UserMinus, CheckCircle2, AlertTriangle, 
  RefreshCw, Copy, Check, Lock, Cpu, Building2, KeyRound, ExternalLink 
} from 'lucide-react';
import { ethers } from 'ethers';
import { fetchProviderEvents, fetchRecordRegisteredEvents, fetchContractOwner } from '../blockchain/events';
import { getEthersProvider, getContractInstance } from '../blockchain/contract';
import { getEtherscanAddressUrl, getEtherscanTxUrl, SUPPORTED_NETWORKS } from '../config/contractConfig';

export default function AdminDashboard({
  account,
  isAdmin,
  contractAddress,
  networkName,
  onConnectWallet,
  addToast
}) {
  const [contractOwner, setContractOwner] = useState('');
  const [providerInput, setProviderInput] = useState('');
  const [providerList, setProviderList] = useState([]);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTxPending, setIsTxPending] = useState(false);
  const [txStep, setTxStep] = useState('');
  const [currentChainId, setCurrentChainId] = useState(31337);

  // Confirmation modal state for removal
  const [removeConfirmTarget, setRemoveConfirmTarget] = useState(null);
  const [copiedAddr, setCopiedAddr] = useState('');

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const provider = await getEthersProvider();
      const network = await provider.getNetwork();
      setCurrentChainId(Number(network.chainId));

      const ownerAddr = await fetchContractOwner(contractAddress);
      setContractOwner(ownerAddr);

      const providers = await fetchProviderEvents(contractAddress);
      setProviderList(providers);

      const records = await fetchRecordRegisteredEvents(contractAddress);
      setTotalRecordCount(records.length);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Handle Add Provider
  const handleAddProvider = async (targetAddress) => {
    const addr = targetAddress || providerInput;

    if (!account) {
      addToast({ type: 'warning', title: 'Wallet Required', message: 'Please connect your admin MetaMask wallet.' });
      return;
    }

    if (!isAdmin) {
      addToast({ type: 'error', title: 'Unauthorized', message: 'Only the contract owner can add healthcare providers.' });
      return;
    }

    if (!addr || !ethers.isAddress(addr)) {
      addToast({ type: 'error', title: 'Invalid Address', message: 'Please enter a valid 40-character hexadecimal Ethereum address.' });
      return;
    }

    if (addr === ethers.ZeroAddress) {
      addToast({ type: 'error', title: 'Invalid Address', message: 'Zero address (0x000...000) cannot be authorized.' });
      return;
    }

    try {
      setIsTxPending(true);
      setTxStep('Prompting MetaMask for addProvider transaction...');

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const contract = getContractInstance(signer, contractAddress);

      // Check if already authorized
      const alreadyAuth = await contract.isAuthorizedProvider(addr);
      if (alreadyAuth) {
        addToast({ type: 'warning', title: 'Already Authorized', message: `Provider ${addr.substring(0, 8)}... is already authorized.` });
        setIsTxPending(false);
        return;
      }

      const tx = await contract.addProvider(addr);
      setTxStep('Submitting transaction to blockchain...');
      const receipt = await tx.wait();

      addToast({
        type: 'success',
        title: 'Provider Authorized!',
        message: `Successfully authorized provider ${addr.substring(0, 6)}...`
      });

      setProviderInput('');
      await loadAdminData();
    } catch (err) {
      console.error('Add provider error:', err);
      let msg = err.reason || err.message || 'Transaction failed.';
      if (msg.includes('user rejected')) msg = 'MetaMask transaction signature was rejected by user.';
      addToast({ type: 'error', title: 'Transaction Failed', message: msg });
    } finally {
      setIsTxPending(false);
      setTxStep('');
    }
  };

  // Handle Remove Provider
  const handleRemoveProvider = async (addr) => {
    if (!account || !isAdmin) {
      addToast({ type: 'error', title: 'Unauthorized', message: 'Only the contract owner can remove providers.' });
      return;
    }

    try {
      setIsTxPending(true);
      setTxStep(`Prompting MetaMask to remove provider ${addr.substring(0, 6)}...`);

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const contract = getContractInstance(signer, contractAddress);

      const tx = await contract.removeProvider(addr);
      setTxStep('Waiting for block confirmation...');
      await tx.wait();

      addToast({
        type: 'success',
        title: 'Provider Revoked',
        message: `Authorization revoked for provider ${addr.substring(0, 6)}...`
      });

      setRemoveConfirmTarget(null);
      await loadAdminData();
    } catch (err) {
      console.error('Remove provider error:', err);
      let msg = err.reason || err.message || 'Failed to remove provider.';
      if (msg.includes('user rejected')) msg = 'MetaMask transaction signature rejected.';
      addToast({ type: 'error', title: 'Transaction Failed', message: msg });
    } finally {
      setIsTxPending(false);
      setTxStep('');
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAddr(text);
    setTimeout(() => setCopiedAddr(''), 2000);
  };

  const activeAuthorizedCount = providerList.filter(p => p.isAuthorized).length;
  const etherscanContractUrl = getEtherscanAddressUrl(contractAddress, currentChainId);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      
      {/* Admin Header */}
      <div className="bg-white border border-teal-100 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Control Dashboard</h1>
              <p className="text-sm text-gray-500">Manage authorized healthcare provider wallets and system permissions.</p>
            </div>
          </div>

          <div>
            {account ? (
              isAdmin ? (
                <div className="inline-flex items-center gap-2 bg-teal-100 border border-teal-300 text-teal-900 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs">
                  <KeyRound className="w-4 h-4 text-teal-700" />
                  Contract Owner / Admin
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Non-Admin Wallet
                </div>
              )
            ) : (
              <button
                onClick={onConnectWallet}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Connect Admin Wallet
              </button>
            )}
          </div>
        </div>

        {/* Access Warning Banner */}
        {account && !isAdmin && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold">Admin Privileges Required</strong>
              Your connected wallet (<code>{account}</code>) is not the contract deployer owner address (<code>{contractOwner}</code>). Admin operations require connecting the contract owner wallet.
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Contract Status</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-emerald-600">Active</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span className="truncate">{contractAddress.substring(0, 10)}...</span>
            {currentChainId === SUPPORTED_NETWORKS.SEPOLIA.chainId && (
              <a
                href={etherscanContractUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-0.5 font-bold"
              >
                Etherscan <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Network</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">{networkName || 'Localhost'}</span>
            <Cpu className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-[11px] text-gray-500 block">Chain ID: {currentChainId}</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Authorized Providers</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-teal-600">{activeAuthorizedCount}</span>
            <Building2 className="w-5 h-5 text-teal-600" />
          </div>
          <span className="text-[11px] text-gray-500 block">Verified Healthcare Wallets</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Registered Records</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-blue-600">{totalRecordCount}</span>
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-[11px] text-gray-500 block">On-Chain Record Hashes</span>
        </div>

      </div>

      {/* Healthcare Provider Management Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-600" />
            Healthcare Provider Management
          </h2>
          <p className="text-xs text-gray-500">
            Authorize new hospital or doctor wallet addresses to register medical record hashes.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddProvider();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Provider Wallet Address <span className="text-red-500">*</span>
            </label>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={providerInput}
                onChange={(e) => setProviderInput(e.target.value)}
                placeholder="0x1234567890123456789012345678901234567890"
                disabled={!account || !isAdmin || isTxPending}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!account || !isAdmin || isTxPending || !providerInput.trim()}
                className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isTxPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Authorize Provider
                  </>
                )}
              </button>
            </div>
          </div>

          {isTxPending && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600 flex-shrink-0" />
              <span>{txStep}</span>
            </div>
          )}
        </form>
      </div>

      {/* Provider List Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Healthcare Provider Registry</h3>
            <p className="text-xs text-gray-500">Historical authorization log queried from blockchain events.</p>
          </div>
          <button
            onClick={loadAdminData}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
            title="Refresh Provider List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {providerList.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            No provider authorization events recorded yet on this network deployment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Provider Wallet Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Activity Tx</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {providerList.map((item) => {
                  const txUrl = getEtherscanTxUrl(item.transactionHash, currentChainId);
                  return (
                    <tr key={item.address} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{item.address}</span>
                          <button
                            onClick={() => copyText(item.address)}
                            className="text-gray-400 hover:text-gray-700 cursor-pointer"
                            title="Copy Address"
                          >
                            {copiedAddr === item.address ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {item.isAuthorized ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Authorized
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                            Revoked
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">
                        {item.transactionHash ? (
                          currentChainId === SUPPORTED_NETWORKS.SEPOLIA.chainId ? (
                            <a href={txUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                              {item.transactionHash.substring(0, 8)}... <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            `${item.transactionHash.substring(0, 10)}...`
                          )
                        ) : (
                          'N/A'
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {item.isAuthorized ? (
                          <button
                            onClick={() => setRemoveConfirmTarget(item.address)}
                            disabled={!isAdmin || isTxPending}
                            className="text-red-600 hover:text-red-800 font-bold hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddProvider(item.address)}
                            disabled={!isAdmin || isTxPending}
                            className="text-teal-600 hover:text-teal-800 font-bold hover:bg-teal-50 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            Re-authorize
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {removeConfirmTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100">
            <div className="flex items-center gap-3 text-red-600">
              <UserMinus className="w-8 h-8 bg-red-100 p-1.5 rounded-xl" />
              <h3 className="font-bold text-gray-900 text-lg">Revoke Provider Authorization</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to revoke healthcare provider authorization for:
            </p>
            <div className="p-3 bg-gray-100 rounded-xl font-mono text-xs font-bold text-gray-900 break-all">
              {removeConfirmTarget}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRemoveConfirmTarget(null)}
                disabled={isTxPending}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveProvider(removeConfirmTarget)}
                disabled={isTxPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                {isTxPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
