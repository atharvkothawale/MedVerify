import React, { useState } from 'react';
import { 
  SearchCheck, FileCheck, ShieldCheck, ShieldAlert, AlertTriangle, 
  CheckCircle2, RefreshCw, FileSearch, Lock, Copy, Check, Info 
} from 'lucide-react';
import { calculateFileHash, formatHashAsBytes32 } from '../utils/hashUtils';
import { fetchRecordFromChain } from '../blockchain/contract';

export default function PatientVerification({ contractAddress }) {
  const [recordId, setRecordId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleVerifyRecord = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setVerificationResult(null);

    if (!recordId.trim()) {
      setErrorMsg('Please enter the Record ID to verify (e.g. MR-001).');
      return;
    }

    if (!selectedFile) {
      setErrorMsg('Please select a local medical record file to compare.');
      return;
    }

    try {
      setIsVerifying(true);

      // 1. Calculate SHA-256 of local file
      const calculatedRawHash = await calculateFileHash(selectedFile);
      const calculatedBytes32 = formatHashAsBytes32(calculatedRawHash);

      // 2. Fetch record from blockchain
      const onChainRecord = await fetchRecordFromChain(recordId.trim(), contractAddress);

      if (!onChainRecord.exists) {
        setVerificationResult({
          status: 'NOT_FOUND',
          recordId: recordId.trim(),
          fileName: selectedFile.name,
          calculatedHash: calculatedBytes32,
          message: `No record matching Record ID "${recordId.trim()}" exists on the blockchain.`
        });
        return;
      }

      // 3. Compare calculated hash with on-chain record hash
      const onChainHashLower = onChainRecord.recordHash.toLowerCase();
      const calculatedHashLower = calculatedBytes32.toLowerCase();
      const isVerified = onChainHashLower === calculatedHashLower;

      const formattedTimestamp = new Date(onChainRecord.timestamp * 1000).toLocaleString();

      setVerificationResult({
        status: isVerified ? 'VERIFIED' : 'MODIFIED',
        recordId: recordId.trim(),
        fileName: selectedFile.name,
        calculatedHash: calculatedBytes32,
        blockchainHash: onChainRecord.recordHash,
        provider: onChainRecord.provider,
        timestamp: formattedTimestamp,
        isVerified,
      });

    } catch (err) {
      console.error('Verification Error:', err);
      setErrorMsg(err.reason || err.message || 'Failed to verify record against blockchain RPC node.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Header Banner */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <SearchCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Verification Portal</h1>
            <p className="text-sm text-gray-500">
              Verify any medical document against its immutable blockchain fingerprint. No wallet or gas fee required.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-blue-600" />
            Verify Medical Record Integrity
          </h2>
          <p className="text-xs text-gray-500">
            Upload your local copy of the report and enter the Record ID to confirm document authenticity.
          </p>
        </div>

        <form onSubmit={handleVerifyRecord} className="space-y-6">
          
          {/* Record ID Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Record ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              placeholder="e.g. MR-001"
              disabled={isVerifying}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Medical Record Document <span className="text-red-500">*</span>
            </label>
            
            <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                disabled={isVerifying}
                className="hidden"
                id="patient-file-upload"
              />
              <label htmlFor="patient-file-upload" className="cursor-pointer block space-y-2">
                <FileCheck className="w-10 h-10 text-blue-600 mx-auto" />
                <div className="text-sm font-semibold text-gray-800">
                  {selectedFile ? (
                    <span className="text-blue-700 font-bold">{selectedFile.name}</span>
                  ) : (
                    'Select document file to verify'
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'PDF, TXT, CSV, DOCX formats supported'}
                </div>
              </label>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Error:</strong> {errorMsg}
              </div>
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isVerifying || !recordId.trim() || !selectedFile}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Against Blockchain...
              </>
            ) : (
              <>
                <SearchCheck className="w-5 h-5" /> Verify Record Integrity
              </>
            )}
          </button>

        </form>
      </div>

      {/* Verification Result Display */}
      {verificationResult && (
        <div className="space-y-6">
          
          {/* VERIFIED Result Card */}
          {verificationResult.status === 'VERIFIED' && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 sm:p-8 space-y-6 animate-fadeIn shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="inline-block bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                    VERIFIED
                  </span>
                  <h3 className="text-2xl font-extrabold text-emerald-950">Record Content Match</h3>
                  <p className="text-sm text-emerald-800">
                    The uploaded file matches the hash recorded on the blockchain. The document has not been tampered with.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-emerald-200 rounded-xl p-5 space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-emerald-100">
                  <div>
                    <span className="text-gray-500 block font-medium">Record ID</span>
                    <span className="font-bold text-gray-900 text-sm">{verificationResult.recordId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium">Registration Date & Time</span>
                    <span className="font-semibold text-gray-900">{verificationResult.timestamp}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-500 font-medium">Calculated Local File SHA-256 (bytes32)</span>
                  <div className="font-mono text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-[11px] break-all font-semibold">
                    {verificationResult.calculatedHash}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-500 font-medium">On-Chain Registered SHA-256 (bytes32)</span>
                  <div className="font-mono text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-[11px] break-all font-semibold">
                    {verificationResult.blockchainHash}
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-100">
                  <span className="text-gray-500 block font-medium">Authorized Provider Address</span>
                  <span className="font-mono text-gray-900 font-medium text-[11px] break-all">{verificationResult.provider}</span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-100/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> Blockchain verification confirms that the file binary contents match the exact hash registered by the authorized healthcare provider. It verifies document integrity against tampering.
                </span>
              </div>
            </div>
          )}

          {/* MODIFIED / INVALID Result Card */}
          {verificationResult.status === 'MODIFIED' && (
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 sm:p-8 space-y-6 animate-fadeIn shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <span className="inline-block bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                    MODIFIED / INVALID
                  </span>
                  <h3 className="text-2xl font-extrabold text-red-950">Integrity Check Failed!</h3>
                  <p className="text-sm text-red-800">
                    The uploaded file does NOT match the hash recorded on the blockchain. The file contents differ from the original registered record.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-red-200 rounded-xl p-5 space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-red-100">
                  <div>
                    <span className="text-gray-500 block font-medium">Record ID</span>
                    <span className="font-bold text-gray-900 text-sm">{verificationResult.recordId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium">Original Registration Date</span>
                    <span className="font-semibold text-gray-900">{verificationResult.timestamp}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-red-700 font-bold block">Calculated Hash (Current Uploaded File)</span>
                  <div className="font-mono text-red-900 bg-red-100/70 p-2.5 rounded-lg border border-red-300 text-[11px] break-all font-semibold">
                    {verificationResult.calculatedHash}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-teal-700 font-bold block">Registered Blockchain Hash (Original File)</span>
                  <div className="font-mono text-teal-900 bg-teal-50 p-2.5 rounded-lg border border-teal-200 text-[11px] break-all font-semibold">
                    {verificationResult.blockchainHash}
                  </div>
                </div>

                <div className="pt-3 border-t border-red-100">
                  <span className="text-gray-500 block font-medium">Original Registering Provider Address</span>
                  <span className="font-mono text-gray-900 font-medium text-[11px] break-all">{verificationResult.provider}</span>
                </div>
              </div>

              <div className="p-3.5 bg-red-100/70 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Tamper Warning:</strong> The SHA-256 digest of your file does not match the blockchain anchor. Even altering a single character or byte in a document changes its SHA-256 fingerprint.
                </span>
              </div>
            </div>
          )}

          {/* NOT FOUND Result Card */}
          {verificationResult.status === 'NOT_FOUND' && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 sm:p-8 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
                <div>
                  <h3 className="text-xl font-bold text-amber-950">Record Not Found</h3>
                  <p className="text-xs text-amber-800">
                    No medical record hash has been registered under Record ID <code>"{verificationResult.recordId}"</code>.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-amber-200 rounded-xl p-4 text-xs space-y-2 text-gray-700">
                <p><strong>Troubleshooting:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Verify that the Record ID was typed correctly (e.g. <code>MR-001</code>).</li>
                  <li>Ensure the authorized provider has successfully completed the registration transaction.</li>
                </ul>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
