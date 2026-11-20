import React from 'react';
import { ShieldCheck, Stethoscope, SearchCheck, Lock, Cpu, FileCheck2, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="space-y-12 py-6">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-teal-900 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <ShieldCheck className="w-96 h-96 text-white" />
        </div>
        
        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/40 text-teal-300 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> Decentralized Security & Privacy
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Blockchain-Based Medical Record Verification System
          </h1>

          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
            Medical files remain <strong>100% off-chain</strong>. Only their cryptographic <strong>SHA-256 hash</strong> is recorded on the Ethereum blockchain for tamper-proof integrity verification.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => onNavigate('provider')}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-teal-500/25 cursor-pointer"
            >
              <Stethoscope className="w-5 h-5" />
              Healthcare Provider Portal
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('patient')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 cursor-pointer"
            >
              <SearchCheck className="w-5 h-5" />
              Patient Verification Portal
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Actions Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Provider Card */}
        <div className="bg-white border border-teal-100 rounded-2xl p-8 hover:shadow-xl transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Healthcare Provider Portal</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Authorized hospitals and medical professionals can compute document hashes locally and anchor them to the Solidity smart contract via MetaMask.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Authorized Wallet Verification
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Client-Side SHA-256 Hashing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Instant On-Chain Hash Registration
              </li>
            </ul>
          </div>
          <button
            onClick={() => onNavigate('provider')}
            className="mt-6 w-full py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            Access Provider Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Patient Verification Card */}
        <div className="bg-white border border-blue-100 rounded-2xl p-8 hover:shadow-xl transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <SearchCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Patient Verification Portal</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Patients, insurers, or third parties can select a local report PDF/file to verify whether its contents match the registered blockchain fingerprint.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Zero Wallet / Gas Fee Required
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Instant Tamper & Modification Detection
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Full Audit Trail & Timestamp Check
              </li>
            </ul>
          </div>
          <button
            onClick={() => onNavigate('patient')}
            className="mt-6 w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            Verify a Medical Record
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Architecture & Workflow Explanation */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xs">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">How Integrity Verification Works</h3>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center mx-auto">1</div>
            <h4 className="font-bold text-gray-900 text-sm">Medical PDF / File</h4>
            <p className="text-xs text-gray-500">Document generated locally by authorized hospital.</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center mx-auto">2</div>
            <h4 className="font-bold text-gray-900 text-sm">SHA-256 Digest</h4>
            <p className="text-xs text-gray-500">Local browser calculates 64-character hex hash.</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center mx-auto">3</div>
            <h4 className="font-bold text-gray-900 text-sm">Blockchain Anchor</h4>
            <p className="text-xs text-gray-500">Hash is registered in Solidity smart contract.</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mx-auto">4</div>
            <h4 className="font-bold text-gray-900 text-sm">Patient Verification</h4>
            <p className="text-xs text-gray-500">File hash re-calculated & compared against chain.</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Privacy & Security Guarantee:</strong> The medical report content itself is never transmitted across the network or stored on the blockchain ledger. Only the 256-bit cryptographic digest is recorded, ensuring complete privacy compliance.
          </div>
        </div>
      </div>

    </div>
  );
}
