import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ProviderDashboard from './components/ProviderDashboard';
import PatientVerification from './components/PatientVerification';
import AdminDashboard from './components/AdminDashboard';
import RecordHistory from './components/RecordHistory';
import ActivityLogs from './components/ActivityLogs';
import ContractConfigModal from './components/ContractConfigModal';
import Toast from './components/Toast';
import Footer from './components/Footer';

import { AlertTriangle, Globe, RefreshCw } from 'lucide-react';
import { 
  connectMetaMaskWallet, 
  isProviderAuthorized, 
  isMetaMaskInstalled,
  switchToSepoliaNetwork,
  switchToLocalhostNetwork 
} from './blockchain/contract';
import { fetchContractOwner } from './blockchain/events';
import { 
  SUPPORTED_NETWORKS, 
  getContractAddressForChain, 
  DEFAULT_LOCAL_CONTRACT_ADDRESS 
} from './config/contractConfig';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [account, setAccount] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [chainId, setChainId] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [contractAddress, setContractAddress] = useState(DEFAULT_LOCAL_CONTRACT_ADDRESS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  // Toast System State
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title = '', message = '', duration = 4500 }) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check user role: provider authorization & admin contract ownership
  const checkRoleStatus = useCallback(async (walletAddr, contractAddr) => {
    if (!walletAddr) {
      setIsAuthorized(false);
      setIsAdmin(false);
      return;
    }
    try {
      const [authorized, ownerAddr] = await Promise.all([
        isProviderAuthorized(walletAddr, contractAddr),
        fetchContractOwner(contractAddr)
      ]);

      setIsAuthorized(authorized);
      const isOwner = ownerAddr && walletAddr.toLowerCase() === ownerAddr.toLowerCase();
      setIsAdmin(Boolean(isOwner));
    } catch (err) {
      console.error('Failed to check role status:', err);
      setIsAuthorized(false);
      setIsAdmin(false);
    }
  }, []);

  // Connect MetaMask Wallet
  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      const walletData = await connectMetaMaskWallet();
      setAccount(walletData.account);
      setNetworkName(walletData.networkName);
      setChainId(walletData.chainId);

      const targetAddress = walletData.contractAddress;
      setContractAddress(targetAddress);

      await checkRoleStatus(walletData.account, targetAddress);
      
      addToast({
        type: 'success',
        title: 'Wallet Connected',
        message: `Connected to ${walletData.networkName} as ${walletData.account.substring(0, 6)}...`
      });
    } catch (err) {
      console.error('Wallet connection error:', err);
      addToast({
        type: 'error',
        title: 'Connection Failed',
        message: err.message || 'Failed to connect MetaMask.'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchToSepolia = async () => {
    try {
      setIsSwitchingNetwork(true);
      await switchToSepoliaNetwork();
      addToast({ type: 'info', title: 'Network Switched', message: 'Switched MetaMask to Ethereum Sepolia' });
    } catch (err) {
      console.error('Switch network error:', err);
      addToast({ type: 'warning', title: 'Switch Cancelled', message: err.message || 'Network switch was cancelled.' });
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const handleSwitchToLocalhost = async () => {
    try {
      setIsSwitchingNetwork(true);
      await switchToLocalhostNetwork();
      addToast({ type: 'info', title: 'Network Switched', message: 'Switched MetaMask to Hardhat Localhost' });
    } catch (err) {
      console.error('Switch network error:', err);
      addToast({ type: 'warning', title: 'Switch Cancelled', message: err.message || 'Network switch was cancelled.' });
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  // Listen to MetaMask account/chain changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await checkRoleStatus(accounts[0], contractAddress);
        } else {
          setAccount('');
          setIsAuthorized(false);
          setIsAdmin(false);
        }
      };

      const handleChainChanged = (newHexChainId) => {
        const numeric = parseInt(newHexChainId, 16);
        setChainId(numeric);
        const autoAddr = getContractAddressForChain(numeric);
        setContractAddress(autoAddr);
        if (account) {
          checkRoleStatus(account, autoAddr);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [account, checkRoleStatus, contractAddress]);

  const isUnsupportedNetwork = account && chainId && (chainId !== SUPPORTED_NETWORKS.SEPOLIA.chainId && chainId !== SUPPORTED_NETWORKS.LOCAL_HARDHAT.chainId);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#2D3436]">
      {/* Navbar */}
      <Navbar
        account={account}
        networkName={networkName}
        isAuthorized={isAuthorized}
        isAdmin={isAdmin}
        isConnecting={isConnecting}
        onConnectWallet={handleConnectWallet}
        contractAddress={contractAddress}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Network Switch Warning Bar if on wrong network */}
      {isUnsupportedNetwork && (
        <div className="bg-amber-600 text-white px-4 py-3 text-xs font-semibold shadow-inner flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-200 flex-shrink-0" />
            <span>
              <strong>Unsupported Network:</strong> MetaMask is connected to an un-configured network (Chain ID: {chainId}). Please switch to Ethereum Sepolia or Local Hardhat.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwitchToSepolia}
              disabled={isSwitchingNetwork}
              className="bg-white text-amber-900 font-bold px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {isSwitchingNetwork ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              Switch to Sepolia
            </button>
            <button
              onClick={handleSwitchToLocalhost}
              disabled={isSwitchingNetwork}
              className="bg-amber-800 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-amber-900 transition-colors cursor-pointer"
            >
              Switch to Localhost
            </button>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'landing' && (
          <LandingPage onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'patient' && (
          <PatientVerification contractAddress={contractAddress} />
        )}

        {activeTab === 'provider' && (
          <ProviderDashboard
            account={account}
            isAuthorized={isAuthorized}
            networkName={networkName}
            onConnectWallet={handleConnectWallet}
            contractAddress={contractAddress}
            onRefreshAuthorization={() => checkRoleStatus(account, contractAddress)}
            addToast={addToast}
          />
        )}

        {activeTab === 'records' && (
          <RecordHistory
            contractAddress={contractAddress}
            connectedAccount={account}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityLogs contractAddress={contractAddress} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            account={account}
            isAdmin={isAdmin}
            contractAddress={contractAddress}
            networkName={networkName}
            onConnectWallet={handleConnectWallet}
            addToast={addToast}
          />
        )}
      </main>

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <Footer />

      {/* Contract Settings Modal */}
      <ContractConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentAddress={contractAddress}
        onSaveAddress={(newAddr) => {
          setContractAddress(newAddr);
          if (account) {
            checkRoleStatus(account, newAddr);
          }
          addToast({
            type: 'info',
            title: 'Contract Address Updated',
            message: `Target contract set to ${newAddr.substring(0, 10)}...`
          });
        }}
      />
    </div>
  );
}
