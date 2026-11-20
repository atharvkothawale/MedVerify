import React, { useState } from 'react';
import { Settings, X, Check, RefreshCw } from 'lucide-react';
import { DEFAULT_CONTRACT_ADDRESS } from '../config/contractConfig';

export default function ContractConfigModal({
  isOpen,
  onClose,
  currentAddress,
  onSaveAddress
}) {
  const [addressInput, setAddressInput] = useState(currentAddress || DEFAULT_CONTRACT_ADDRESS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!addressInput.trim()) return;
    onSaveAddress(addressInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetDefault = () => {
    setAddressInput(DEFAULT_CONTRACT_ADDRESS);
    onSaveAddress(DEFAULT_CONTRACT_ADDRESS);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-gray-100">
        
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-gray-900 text-lg">Smart Contract Config</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="block font-bold uppercase tracking-wider text-gray-700">
              Deployed Contract Address
            </label>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="0x..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            />
            <p className="text-[11px] text-gray-500">
              Default Hardhat local address: <code>{DEFAULT_CONTRACT_ADDRESS}</code>
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-600" /> Contract address updated!
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-gray-500 hover:text-gray-800 underline font-medium text-xs cursor-pointer"
            >
              Reset to Default
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Save Contract Address
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
