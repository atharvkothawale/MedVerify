import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Search, RefreshCw, Copy, Check, ShieldCheck, 
  User, Clock, Hash, AlertTriangle, ExternalLink, Filter 
} from 'lucide-react';
import { fetchRecordFromChain } from '../blockchain/contract';
import { fetchRecordRegisteredEvents } from '../blockchain/events';

export default function RecordHistory({ contractAddress, connectedAccount }) {
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [allRecords, setAllRecords] = useState([]);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'mine'
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  const [copiedText, setCopiedText] = useState('');

  const loadAllRecordEvents = useCallback(async () => {
    setIsLoadingRecords(true);
    try {
      const records = await fetchRecordRegisteredEvents(contractAddress);
      setAllRecords(records);
    } catch (err) {
      console.error('Error fetching record events:', err);
    } finally {
      setIsLoadingRecords(false);
    }
  }, [contractAddress]);

  useEffect(() => {
    loadAllRecordEvents();
  }, [loadAllRecordEvents]);

  const handleSearchRecord = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);

    if (!searchId.trim()) {
      setSearchError('Please enter a Record ID to query.');
      return;
    }

    try {
      setIsSearching(true);
      const record = await fetchRecordFromChain(searchId.trim(), contractAddress);

      if (!record.exists) {
        setSearchResult({
          exists: false,
          recordId: searchId.trim(),
        });
        return;
      }

      setSearchResult({
        exists: true,
        recordId: searchId.trim(),
        recordHash: record.recordHash,
        provider: record.provider,
        timestamp: new Date(record.timestamp * 1000).toLocaleString(),
      });
    } catch (err) {
      console.error('Search error:', err);
      setSearchError(err.reason || err.message || 'Failed to query record from blockchain.');
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const filteredRecords = filterMode === 'mine' && connectedAccount
    ? allRecords.filter(r => r.provider.toLowerCase() === connectedAccount.toLowerCase())
    : allRecords;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blockchain Record Explorer</h1>
            <p className="text-sm text-gray-500">
              Query on-chain medical record hashes and inspect historical registration logs.
            </p>
          </div>
        </div>
      </div>

      {/* Record ID Search Box */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Direct Record ID Query
          </h2>
          <p className="text-xs text-gray-500">
            Read specific record data directly from smart contract mapping storage using <code>getRecord(recordId)</code>.
          </p>
        </div>

        <form onSubmit={handleSearchRecord} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Record ID (e.g., MR-001)"
              disabled={isSearching}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isSearching || !searchId.trim()}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Query Record
            </button>
          </div>

          {searchError && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </form>

        {/* Search Result Display Card */}
        {searchResult && (
          <div className="pt-4 border-t border-gray-100">
            {searchResult.exists ? (
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 space-y-4 text-xs animate-fadeIn">
                <div className="flex justify-between items-center pb-3 border-b border-blue-100">
                  <div className="flex items-center gap-2 font-bold text-blue-950 text-sm">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    Record Found: <code>{searchResult.recordId}</code>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    REGISTERED
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">On-Chain SHA-256 Hash (bytes32)</span>
                    <button
                      onClick={() => copyToClipboard(searchResult.recordHash)}
                      className="text-blue-700 hover:text-blue-900 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === searchResult.recordHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedText === searchResult.recordHash ? 'Copied!' : 'Copy Hash'}
                    </button>
                  </div>
                  <div className="font-mono text-gray-900 bg-white p-2.5 rounded-lg border border-blue-200 text-[11px] break-all">
                    {searchResult.recordHash}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-gray-500 block font-medium">Registering Provider</span>
                    <span className="font-mono font-bold text-gray-900 text-[11px] break-all">{searchResult.provider}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium">Registration Timestamp</span>
                    <span className="font-semibold text-gray-900">{searchResult.timestamp}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Record Not Found:</strong> No registered record found on blockchain for Record ID <code>"{searchResult.recordId}"</code>.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Historical Record Logs Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Historical Registered Records</h3>
            <p className="text-xs text-gray-500">Events emitted by the smart contract during record registrations.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterMode === 'all' ? 'bg-white text-gray-900 font-bold shadow-2xs' : 'text-gray-600'}`}
              >
                All Records ({allRecords.length})
              </button>
              {connectedAccount && (
                <button
                  onClick={() => setFilterMode('mine')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterMode === 'mine' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-gray-600'}`}
                >
                  My Registered Records
                </button>
              )}
            </div>

            <button
              onClick={loadAllRecordEvents}
              disabled={isLoadingRecords}
              className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Refresh Event Logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingRecords ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            {filterMode === 'mine' ? 'No records registered by your connected wallet yet.' : 'No record registration events found on this local blockchain deployment.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">SHA-256 Hash (bytes32)</th>
                  <th className="py-3 px-4">Provider Address</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((rec) => (
                  <tr key={`${rec.recordId}-${rec.transactionHash}`} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {rec.recordId}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-800 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-xs">{rec.recordHash}</span>
                        <button
                          onClick={() => copyToClipboard(rec.recordHash)}
                          className="text-gray-400 hover:text-gray-700 cursor-pointer"
                          title="Copy Full Hash"
                        >
                          {copiedText === rec.recordHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-600 text-[11px]">
                      {rec.provider.substring(0, 6)}...{rec.provider.substring(rec.provider.length - 4)}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      {new Date(rec.timestamp * 1000).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-gray-500">
                      {rec.transactionHash ? `${rec.transactionHash.substring(0, 10)}...` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
