import React from 'react';
import { 
  ShieldCheck, Wallet, RefreshCw, Settings, CheckCircle2, 
  AlertCircle, KeyRound, SearchCheck, Stethoscope, FileText, Activity 
} from 'lucide-react';

export default function Navbar({
  account,
  networkName,
  isAuthorized,
  isAdmin,
  isConnecting,
  onConnectWallet,
  onOpenSettings,
  activeTab,
  setActiveTab
}) {
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Project Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg leading-tight block">MedVerify</span>
              <span className="text-xs text-teal-700 font-medium hidden sm:block">Medical Record Integrity</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'landing' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('patient')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'patient' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Verify Record
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'provider' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Provider Portal
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'records' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Record History
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'activity' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Audit Activity
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'admin' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin Dashboard
            </button>
          </nav>

          {/* Right Section: Contract Address, Role Badge, Wallet Button */}
          <div className="flex items-center gap-3">
            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Contract Configuration"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Wallet & Role Badge */}
            {account ? (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5 pl-3">
                <div className="text-right text-xs">
                  <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                    {formatAddress(account)}
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">
                        <KeyRound className="w-3 h-3 text-amber-700" /> ADMIN
                      </span>
                    ) : isAuthorized ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PROVIDER
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full font-medium">
                        USER
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500 text-[10px]">{networkName || 'Hardhat Localhost'}</div>
                </div>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Connect MetaMask
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50 p-2 flex overflow-x-auto gap-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('landing')}
          className={`py-1.5 px-3 rounded-lg flex-shrink-0 ${activeTab === 'landing' ? 'bg-teal-600 text-white font-bold' : 'text-gray-600'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('patient')}
          className={`py-1.5 px-3 rounded-lg flex-shrink-0 ${activeTab === 'patient' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600'}`}
        >
          Verify
        </button>
        <button
          onClick={() => setActiveTab('provider')}
          className={`py-1.5 px-3 rounded-lg flex-shrink-0 ${activeTab === 'provider' ? 'bg-teal-600 text-white font-bold' : 'text-gray-600'}`}
        >
          Provider
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`py-1.5 px-3 rounded-lg flex-shrink-0 ${activeTab === 'records' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600'}`}
        >
          Records
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`py-1.5 px-3 rounded-lg flex-shrink-0 ${activeTab === 'admin' ? 'bg-amber-600 text-white font-bold' : 'text-gray-600'}`}
        >
          Admin
        </button>
      </div>
    </header>
  );
}
