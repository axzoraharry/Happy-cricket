import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversionRate, setConversionRate] = useState(1000); // 1 HC = 1000 INR

  const { isAuthenticated } = useAuth();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Fetch wallet balance
  const fetchWallet = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/wallet/balance`);
      setWallet(response.data);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      toast.error('Failed to load wallet balance');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction history
  const fetchTransactions = async (skip = 0, limit = 50) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await axios.get(`${backendUrl}/api/wallet/transactions`, {
        params: { skip, limit }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transaction history');
    }
  };

  // Fetch conversion rate
  const fetchConversionRate = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/wallet/conversion-rate`);
      setConversionRate(response.data.conversion_rate);
    } catch (error) {
      console.error('Failed to fetch conversion rate:', error);
    }
  };

  // Deposit funds
  const deposit = async (amount, paymentMethod = 'stripe') => {
    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/wallet/deposit`, {
        amount,
        payment_method: paymentMethod,
        currency: 'INR'
      });
      
      toast.success('Deposit successful!');
      await fetchWallet(); // Refresh wallet balance
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Deposit failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Withdraw funds
  const withdraw = async (amount, bankDetails = {}) => {
    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/wallet/withdraw`, {
        amount,
        currency: 'INR',
        ...bankDetails
      });
      
      toast.success('Withdrawal request submitted!');
      await fetchWallet(); // Refresh wallet balance
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Withdrawal failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Convert currency
  const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/wallet/convert`, {
        amount,
        from_currency: fromCurrency,
        to_currency: toCurrency
      });
      
      toast.success('Currency conversion successful!');
      await fetchWallet(); // Refresh wallet balance
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Conversion failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Initialize wallet data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWallet();
      fetchTransactions();
      fetchConversionRate();
    } else {
      setWallet(null);
      setTransactions([]);
    }
  }, [isAuthenticated]);

  const value = {
    wallet,
    transactions,
    loading,
    conversionRate,
    fetchWallet,
    fetchTransactions,
    deposit,
    withdraw,
    convertCurrency,
    refreshWallet: fetchWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};