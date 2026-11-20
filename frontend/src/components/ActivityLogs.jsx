import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, UserPlus, UserMinus, FileUp, RefreshCw, 
  ExternalLink, Copy, Check, Clock, Cpu 
} from 'lucide-react';
import { fetchAllActivityLogs } from '../blockchain/events';

export default function ActivityLogs({ contractAddress }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedTx, setCopiedTx] = useState('');

  const loadActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const logs = await fetchAllActivityLogs(contractAddress);
      setActivities(logs);
    } catch (err) {
      console.error('Error loading activity logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const copyTx = (txHash) => {
    navigator.clipboard.writeText(txHash);
    setCopiedTx(txHash);
    setTimeout(() => setCopiedTx(''), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blockchain Activity Audit Log</h1>
              <p className="text-sm text-gray-500">
                Real-time stream of all smart contract events emitted on the local Hardhat blockchain network.
              </p>
            </div>
          </div>

          <button
            onClick={loadActivities}
            disabled={isLoading}
            className="p-2.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
            title="Refresh Activity Log"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Activity Timeline / Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {activities.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            No blockchain activity logs detected yet on this deployment.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100/70 transition-colors flex flex-wrap justify-between items-center gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.type === 'PROVIDER_ADDED' && (
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <UserPlus className="w-5 h-5" />
                      </div>
                    )}
                    {item.type === 'PROVIDER_REMOVED' && (
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                        <UserMinus className="w-5 h-5" />
                      </div>
                    )}
                    {item.type === 'RECORD_REGISTERED' && (
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                        <FileUp className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <span className="font-bold text-gray-900 text-sm block">{item.title}</span>
                    <span className="text-gray-600 font-mono">{item.detail}</span>
                    {item.timestamp && (
                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(item.timestamp * 1000).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-1 font-mono text-[11px]">
                  <span className="text-gray-400 block">Block #{item.blockNumber}</span>
                  <div className="flex items-center justify-end gap-1 text-gray-600">
                    <span>Tx: {item.transactionHash.substring(0, 12)}...</span>
                    <button
                      onClick={() => copyTx(item.transactionHash)}
                      className="text-gray-400 hover:text-gray-700 cursor-pointer"
                      title="Copy Tx Hash"
                    >
                      {copiedTx === item.transactionHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
