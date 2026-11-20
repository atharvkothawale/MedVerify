import React from 'react';
import { RefreshCw, CheckCircle2, XCircle, Clock, ExternalLink, ShieldCheck } from 'lucide-react';

/**
 * Reusable Transaction Status Banner / Modal Component
 * Displays real-time transaction state:
 * - PREPARING
 * - WAITING_SIGNATURE
 * - SUBMITTED
 * - CONFIRMING
 * - CONFIRMED
 * - FAILED
 */
export default function TransactionStatus({ status, txHash, blockNumber, errorMessage, onClose }) {
  if (!status) return null;

  const steps = [
    { key: 'PREPARING', label: 'Preparing Request' },
    { key: 'WAITING_SIGNATURE', label: 'Waiting for MetaMask Confirmation' },
    { key: 'SUBMITTED', label: 'Transaction Submitted' },
    { key: 'CONFIRMED', label: 'Transaction Confirmed on Blockchain' },
  ];

  const getStepState = (stepKey) => {
    const order = ['PREPARING', 'WAITING_SIGNATURE', 'SUBMITTED', 'CONFIRMED'];
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(stepKey);

    if (status === 'FAILED') return 'failed';
    if (currentIndex > stepIndex) return 'done';
    if (currentIndex === stepIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
      
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {status === 'CONFIRMED' ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          ) : status === 'FAILED' ? (
            <XCircle className="w-6 h-6 text-red-600" />
          ) : (
            <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
          )}
          <h4 className="font-bold text-gray-900 text-base">
            {status === 'CONFIRMED'
              ? 'Transaction Confirmed!'
              : status === 'FAILED'
              ? 'Transaction Failed'
              : 'Processing Blockchain Transaction...'}
          </h4>
        </div>
        {onClose && (status === 'CONFIRMED' || status === 'FAILED') && (
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline cursor-pointer"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {steps.map((step) => {
          const state = getStepState(step.key);
          return (
            <div
              key={step.key}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col justify-between transition-all ${
                state === 'done'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : state === 'current'
                  ? 'bg-teal-50 border-teal-300 text-teal-900 ring-2 ring-teal-200'
                  : state === 'failed'
                  ? 'bg-red-50 border-red-200 text-red-800 opacity-60'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Step</span>
                {state === 'done' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : state === 'current' ? (
                  <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-gray-300" />
                )}
              </div>
              <span className="leading-tight">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Details Box */}
      {txHash && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Transaction Hash</span>
            {blockNumber && <span className="font-semibold text-gray-700">Block #{blockNumber}</span>}
          </div>
          <div className="font-mono font-bold text-gray-900 break-all text-[11px]">
            {txHash}
          </div>
        </div>
      )}

      {/* Error Output */}
      {status === 'FAILED' && errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs space-y-1">
          <strong className="block font-bold">Transaction Reverted:</strong>
          <p>{errorMessage}</p>
        </div>
      )}

    </div>
  );
}
