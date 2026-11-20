import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-12 text-xs text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-800 text-sm">Blockchain-Based Medical Record Verification System</span>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <Lock className="w-3.5 h-3.5" />
          <span>Academic Project Demonstration • 100% Off-Chain Privacy</span>
        </div>

        <div>
          <span>Solidity • Hardhat • Ethers.js v6 • React</span>
        </div>

      </div>
    </footer>
  );
}
