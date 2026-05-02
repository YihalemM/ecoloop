import { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { ecoApi } from '../services/api';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    
    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request permissions to force the account selection modal
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const accounts = await provider.send("eth_requestAccounts", []);
      const connectedAddress = accounts[0];
      setAddress(connectedAddress);
      await fetchBalance(connectedAddress);
    } catch (err) {
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setBalance('0.00');
  };

  const fetchBalance = async (addr) => {
    try {
      const data = await ecoApi.getBalance(addr);
      setBalance(data.balance.toFixed(2));
    } catch (err) {
      console.error('Balance fetch error:', err);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          fetchBalance(accounts[0]);
        } else {
          setAddress(null);
          setBalance('0.00');
        }
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{ address, balance, isConnecting, connectWallet, disconnectWallet, fetchBalance }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
