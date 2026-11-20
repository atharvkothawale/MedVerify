import React, { useState, useEffect, useCallback } from 'react';
import { 
  Stethoscope, Wallet, CheckCircle2, AlertTriangle, ShieldCheck, 
  FileUp, Hash, ArrowRight, RefreshCw, Copy, Check, Lock, KeyRound, 
  FileText, Clock, ChevronRight, Eye 
} from 'lucide-react';
import { calculateFileHash, formatHashAsBytes32 } from '../utils/hashUtils';
import { registerRecordOnChain, getEthersProvider, getContractInstance, parseWeb3Error } from '../blockchain/contract';
import { fetchRecordRegisteredEvents } from '../blockchain/events';
import TransactionStatus from './TransactionStatus';
import { ethers } from 'ethers';

export default function ProviderDashboard({
  account,
  isAuthorized,
  networkName,
  onConnectWallet,
  contractAddress,
  onRefreshAuthorization,
  addToast
}) {
  const [activeSubTab, setActiveSubTab] = useState('register'); // 'register' | 'my-records'
  
  // Registration Wizard State
  const [wizardStep, setWizardStep] = useState(1); // 1: Select File, 2: SHA-256 Preview, 3: Confirm Tx, 4: Done
  const [recordId, setRecordId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [calculatedHashHex, setCalculatedHashHex] = useState('');
  const [calculatedBytes32, setCalculatedBytes32] = useState('');
  
  const [isHashing, setIsHashing] = useState(false);
  const [txStatus, setTxStatus] = useState(null); // 'PREPARING' | 'WAITING_SIGNATURE' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED'
  const [txHash, setTxHash] = useState('');
  const [blockNum, setBlockNum] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [txSuccessResult, setTxSuccessResult] = useState(null);

  // My Records state
  const [myRecords, setMyRecords] = useState([]);
  const [isLoadingMyRecords, setIsLoadingMyRecords] = useState(false);

  // Admin Quick Authorize Helper State
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminAuthorizing, setIsAdminAuthorizing] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');

  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  const loadMyRecords = useCallback(async () => {
    if (!account) return;
    setIsLoadingMyRecords(true);
    try {
      const records = await fetchRecordRegisteredEvents(contractAddress, account);
      setMyRecords(records);
    } catch (err) {
      console.error('Error fetching my records:', err);
    } finally {
      setIsLoadingMyRecords(false);
    }
  }, [account, contractAddress]);

  useEffect(() => {
    if (activeSubTab === 'my-records') {
      loadMyRecords();
    }
  }, [activeSubTab, loadMyRecords]);

  // Handle File Selection & Calculate Hash Preview
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage('');
      try {
        setIsHashing(true);
        const rawHex = await calculateFileHash(file);
        const b32 = formatHashAsBytes32(rawHex);
        setCalculatedHashHex(rawHex);
        setCalculatedBytes32(b32);
        setWizardStep(2);
      } catch (err) {
        console.error('File hashing error:', err);
        setErrorMessage('Failed to calculate SHA-256 hash from file.');
      } finally {
        setIsHashing(false);
      }
    }
  };

  // Submit Registration Transaction to Blockchain
  const handleConfirmAndRegister = async () => {
    setErrorMessage('');
    setTxSuccessResult(null);

    if (!account) {
      if (addToast) addToast({ type: 'warning', title: 'Wallet Required', message: 'Please connect your MetaMask wallet.' });
      return;
    }

    if (!isAuthorized) {
      if (addToast) addToast({ type: 'error', title: 'Not Authorized', message: 'Your wallet is not an authorized provider.' });
      return;
    }

    if (!recordId.trim()) {
      setErrorMessage('Please enter a valid Record ID (e.g. FINAL-MR-001).');
      return;
    }

    try {
      setWizardStep(3);
      setTxStatus('WAITING_SIGNATURE');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setTxStatus('SUBMITTED');
      const receipt = await registerRecordOnChain({
        recordId: recordId.trim(),
        recordHashBytes32: calculatedBytes32,
        signer,
        contractAddress
      });

      setTxHash(receipt.transactionHash);
      setBlockNum(receipt.blockNumber);
      setTxStatus('CONFIRMED');

      setTxSuccessResult({
        recordId: recordId.trim(),
        rawHash: calculatedHashHex,
        bytes32Hash: calculatedBytes32,
        fileName: selectedFile.name,
        fileSize: (selectedFile.size / 1024).toFixed(2) + ' KB',
        providerAddress: account,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toLocaleString(),
      });

      if (addToast) {
        addToast({
          type: 'success',
          title: 'Record Registered!',
          message: `Record ${recordId.trim()} hash anchored to block #${receipt.blockNumber}`
        });
      }

      setWizardStep(4);

    } catch (err) {
      console.error('Registration Error:', err);
      const cleanMessage = parseWeb3Error(err);
      setErrorMessage(cleanMessage);
      setTxStatus('FAILED');
      if (addToast) addToast({ type: 'error', title: 'Registration Failed', message: cleanMessage });
    }
  };

  const handleResetWizard = () => {
    setWizardStep(1);
    setRecordId('');
    setSelectedFile(null);
    setCalculatedHashHex('');
    setCalculatedBytes32('');
    setTxStatus(null);
    setTxHash('');
    setErrorMessage('');
    setTxSuccessResult(null);
  };

  const handleAdminAuthorizeCurrentWallet = async () => {
    try {
      setIsAdminAuthorizing(true);
      setAdminMsg('');

      if (!account) {
        setAdminMsg('Please connect your MetaMask wallet first.');
        return;
      }

      const hardhatProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
      const adminSigner = await hardhatProvider.getSigner(0);
      const contract = getContractInstance(adminSigner, contractAddress);

      const tx = await contract.addProvider(account);
      await tx.wait();

      setAdminMsg(`Wallet ${account.substring(0, 6)}... authorized successfully!`);
      if (onRefreshAuthorization) await onRefreshAuthorization();
      if (addToast) addToast({ type: 'success', title: 'Provider Authorized', message: `Authorized ${account}` });
    } catch (err) {
      console.error('Admin authorize error:', err);
      setAdminMsg(parseWeb3Error(err));
    } finally {
      setIsAdminAuthorizing(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'hash') {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Header Banner */}
      <div className="bg-white border border-teal-100 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Healthcare Provider Portal</h1>
              <p className="text-sm text-gray-500">Register new medical record hashes and view your registered history.</p>
            </div>
          </div>

          <div>
            {account ? (
              isAuthorized ? (
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  AUTHORIZED PROVIDER
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  NOT AUTHORIZED
                </div>
              )
            ) : (
              <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium">
                Wallet Disconnected
              </div>
            )}
          </div>
        </div>

        {/* Wallet Details Bar */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-wrap justify-between items-center gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-gray-500 block">Connected Wallet Address</span>
            <span className="font-mono font-bold text-gray-900 text-sm">
              {account ? account : 'No wallet connected'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!account ? (
              <button
                onClick={onConnectWallet}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Wallet className="w-4 h-4" /> Connect Wallet
              </button>
            ) : (
              <span className="text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-md font-medium">
                {networkName || 'Localhost'}
              </span>
            )}
          </div>
        </div>

        {/* Not Authorized Warning & Admin Helper Toggle */}
        {account && !isAuthorized && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold">Access Restricted</strong>
                Your wallet address (<code>{account}</code>) is not authorized as a healthcare provider on this contract.
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
              <span className="text-gray-600">Testing locally on Hardhat? Quick authorize:</span>
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="text-amber-900 underline font-bold hover:text-amber-950 text-xs flex items-center gap-1 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {showAdminPanel ? 'Hide Admin Helper' : 'Quick Admin Authorize'}
              </button>
            </div>

            {showAdminPanel && (
              <div className="bg-white border border-amber-300 rounded-lg p-3 space-y-2 mt-2">
                <p className="text-gray-700">
                  Sends an <code>addProvider({account})</code> transaction using Hardhat Account #0:
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAdminAuthorizeCurrentWallet}
                    disabled={isAdminAuthorizing}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isAdminAuthorizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    Authorize Connected Wallet
                  </button>
                  {adminMsg && <span className="text-xs font-semibold text-teal-800">{adminMsg}</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sub Navigation Tabs */}
        <div className="flex border-b border-gray-200 pt-2 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('register')}
            className={`pb-2.5 px-4 border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'register'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Register Medical Record Hash
          </button>
          <button
            onClick={() => setActiveSubTab('my-records')}
            className={`pb-2.5 px-4 border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'my-records'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            My Registered Records ({myRecords.length})
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Registration Wizard */}
      {activeSubTab === 'register' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Step Wizard Bar */}
          <div className="grid grid-cols-5 gap-2 text-xs font-semibold pb-4 border-b border-gray-100">
            <div className={`p-2 rounded-lg text-center ${wizardStep >= 1 ? 'bg-teal-100 text-teal-900 font-bold' : 'bg-gray-100 text-gray-400'}`}>
              1. Select File
            </div>
            <div className={`p-2 rounded-lg text-center ${wizardStep >= 2 ? 'bg-teal-100 text-teal-900 font-bold' : 'bg-gray-100 text-gray-400'}`}>
              2. SHA-256 Digest
            </div>
            <div className={`p-2 rounded-lg text-center ${wizardStep >= 3 ? 'bg-teal-100 text-teal-900 font-bold' : 'bg-gray-100 text-gray-400'}`}>
              3. Review Hash
            </div>
            <div className={`p-2 rounded-lg text-center ${wizardStep >= 3 ? 'bg-teal-100 text-teal-900 font-bold' : 'bg-gray-100 text-gray-400'}`}>
              4. MetaMask Tx
            </div>
            <div className={`p-2 rounded-lg text-center ${wizardStep >= 4 ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-gray-100 text-gray-400'}`}>
              5. Completed
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            
            {/* Record ID Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Record ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                placeholder="e.g. FINAL-MR-001, REC-2026-991"
                disabled={!account || !isAuthorized || wizardStep >= 3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all disabled:opacity-50"
              />
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Medical Record Document (PDF, TXT, CSV, DOCX) <span className="text-red-500">*</span>
              </label>
              
              <div className="border-2 border-dashed border-gray-300 hover:border-teal-400 bg-gray-50 hover:bg-teal-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  disabled={!account || !isAuthorized || wizardStep >= 3}
                  className="hidden"
                  id="provider-file-input"
                />
                <label htmlFor="provider-file-input" className="cursor-pointer block space-y-2">
                  <FileUp className="w-10 h-10 text-teal-600 mx-auto" />
                  <div className="text-sm font-semibold text-gray-800">
                    {selectedFile ? (
                      <span className="text-teal-700 font-bold">{selectedFile.name}</span>
                    ) : (
                      'Click to select file or drag & drop'
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'Local hashing ensures document bytes never leave your browser.'}
                  </div>
                </label>
              </div>
            </div>

            {/* Pre-Submit Hash Review Box */}
            {calculatedHashHex && wizardStep >= 2 && (
              <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-5 space-y-3 text-xs animate-fadeIn">
                <div className="flex justify-between items-center font-bold text-teal-950">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Hash className="w-4 h-4 text-teal-600" /> Pre-Registration Hash Review
                  </span>
                  <span className="text-[10px] bg-teal-200 text-teal-900 px-2 py-0.5 rounded-full uppercase">SHA-256 Digest Ready</span>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-500 font-medium">Calculated SHA-256 Digest (64 Hex)</span>
                  <div className="font-mono text-teal-900 bg-white p-2.5 rounded-lg border border-teal-200 text-[11px] break-all font-semibold">
                    {calculatedHashHex}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-500 font-medium">Solidity bytes32 Conversion</span>
                  <div className="font-mono text-gray-800 bg-gray-100 p-2 rounded-md border border-gray-200 text-[11px] break-all">
                    {calculatedBytes32}
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Status Component */}
            {txStatus && (
              <TransactionStatus
                status={txStatus}
                txHash={txHash}
                blockNumber={blockNum}
                errorMessage={errorMessage}
              />
            )}

            {/* Error Banner */}
            {errorMessage && !txStatus && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Registration Error:</strong> {errorMessage}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-2">
              {wizardStep >= 4 ? (
                <button
                  type="button"
                  onClick={handleResetWizard}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md cursor-pointer"
                >
                  Register Another Record
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmAndRegister}
                  disabled={!account || !isAuthorized || !recordId.trim() || !selectedFile || wizardStep === 3}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {wizardStep === 3 ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Confirming Transaction...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" /> Confirm & Register Hash on Blockchain
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Sub-Tab 2: My Registered Records */}
      {activeSubTab === 'my-records' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">My Registered Records</h3>
              <p className="text-xs text-gray-500">Medical record hashes registered on-chain by address <code>{account}</code>.</p>
            </div>
            <button
              onClick={loadMyRecords}
              disabled={isLoadingMyRecords}
              className="p-2 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
              title="Refresh My Records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingMyRecords ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {myRecords.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              No registered records found for your wallet address.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Record ID</th>
                    <th className="py-3 px-4">SHA-256 Hash (bytes32)</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Tx Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myRecords.map((r) => (
                    <tr key={`${r.recordId}-${r.transactionHash}`} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{r.recordId}</td>
                      <td className="py-3 px-4 font-mono text-gray-800 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-xs">{r.recordHash}</span>
                          <button
                            onClick={() => copyToClipboard(r.recordHash, 'hash')}
                            className="text-gray-400 hover:text-gray-700 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{new Date(r.timestamp * 1000).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-500 text-[11px]">
                        {r.transactionHash ? `${r.transactionHash.substring(0, 10)}...` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
