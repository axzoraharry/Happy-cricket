import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

const Wallet = () => {
  const { wallet, loading, transactions, deposit, withdraw, convertCurrency, conversionRate } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [convertAmount, setConvertAmount] = useState('');
  const [convertFrom, setConvertFrom] = useState('INR');
  
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < 100) {
      alert('Minimum deposit is ₹100');
      return;
    }
    
    const result = await deposit(parseFloat(depositAmount));
    if (result.success) {
      setDepositAmount('');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 500) {
      alert('Minimum withdrawal is ₹500');
      return;
    }
    
    const result = await withdraw(parseFloat(withdrawAmount));
    if (result.success) {
      setWithdrawAmount('');
    }
  };

  const handleConvert = async () => {
    if (!convertAmount || parseFloat(convertAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const toCurrency = convertFrom === 'INR' ? 'HC' : 'INR';
    const result = await convertCurrency(parseFloat(convertAmount), convertFrom, toCurrency);
    if (result.success) {
      setConvertAmount('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">💰 Happy Wallet</h1>
          <p className="text-gray-400">Manage your funds and Happy Coins</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-happy-500 to-happy-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-happy-100 text-sm">Happy Coin Balance</p>
                <p className="text-3xl font-bold">
                  {loading ? '...' : wallet?.happy_coin_balance?.toFixed(2) || '0.00'} HC
                </p>
                <p className="text-happy-200 text-xs">
                  ≈ ₹{loading ? '...' : ((wallet?.happy_coin_balance || 0) * conversionRate).toLocaleString()}
                </p>
              </div>
              <div className="text-4xl">🪙</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">INR Balance</p>
                <p className="text-3xl font-bold">
                  ₹{loading ? '...' : wallet?.inr_balance?.toLocaleString() || '0'}
                </p>
                <p className="text-green-200 text-xs">
                  ≈ {loading ? '...' : ((wallet?.inr_balance || 0) / conversionRate).toFixed(4)} HC
                </p>
              </div>
              <div className="text-4xl">💵</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'deposit', label: 'Deposit', icon: '💳' },
                { id: 'withdraw', label: 'Withdraw', icon: '🏦' },
                { id: 'convert', label: 'Convert', icon: '🔄' },
                { id: 'history', label: 'History', icon: '📋' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-happy-500 text-happy-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <p className="text-gray-400 text-sm">Total Deposited</p>
                    <p className="text-xl font-bold text-blue-400">
                      ₹{wallet?.total_deposited?.toLocaleString() || '0'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <p className="text-gray-400 text-sm">Total Withdrawn</p>
                    <p className="text-xl font-bold text-red-400">
                      ₹{wallet?.total_withdrawn?.toLocaleString() || '0'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <p className="text-gray-400 text-sm">Net Balance</p>
                    <p className="text-xl font-bold text-green-400">
                      ₹{((wallet?.total_deposited || 0) - (wallet?.total_withdrawn || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h3 className="text-white font-semibold mb-4">💱 Conversion Rate</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">1 Happy Coin =</span>
                    <span className="text-happy-400 font-bold">₹{conversionRate.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Deposit Tab */}
            {activeTab === 'deposit' && (
              <div className="max-w-md">
                <h3 className="text-white font-semibold mb-4">💳 Add Money</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Amount (INR)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Minimum ₹100"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
                    <p className="text-gray-400 text-xs">
                      💡 Your money will be added to INR balance. Convert to Happy Coins for betting.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleDeposit}
                    disabled={loading || !depositAmount}
                    className="w-full btn-primary py-3 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Deposit Money'}
                  </button>
                </div>
              </div>
            )}

            {/* Withdraw Tab */}
            {activeTab === 'withdraw' && (
              <div className="max-w-md">
                <h3 className="text-white font-semibold mb-4">🏦 Withdraw Money</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Amount (INR)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Minimum ₹500"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
                    <p className="text-gray-400 text-xs">
                      Available: ₹{wallet?.inr_balance?.toLocaleString() || '0'}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleWithdraw}
                    disabled={loading || !withdrawAmount}
                    className="w-full btn-primary py-3 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Withdraw Money'}
                  </button>
                </div>
              </div>
            )}

            {/* Convert Tab */}
            {activeTab === 'convert' && (
              <div className="max-w-md">
                <h3 className="text-white font-semibold mb-4">🔄 Convert Currency</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">From</label>
                    <select
                      value={convertFrom}
                      onChange={(e) => setConvertFrom(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="HC">Happy Coin (HC)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Amount</label>
                    <input
                      type="number"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      placeholder={`Enter ${convertFrom} amount`}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  
                  {convertAmount && (
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
                      <p className="text-gray-400 text-xs">
                        You will receive: {convertFrom === 'INR' 
                          ? `${(parseFloat(convertAmount) / conversionRate).toFixed(4)} HC`
                          : `₹${(parseFloat(convertAmount) * conversionRate).toLocaleString()}`
                        }
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleConvert}
                    disabled={loading || !convertAmount}
                    className="w-full btn-primary py-3 disabled:opacity-50"
                  >
                    {loading ? 'Converting...' : `Convert ${convertFrom} to ${convertFrom === 'INR' ? 'HC' : 'INR'}`}
                  </button>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-white font-semibold mb-4">📋 Transaction History</h3>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-gray-400">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.transaction_id} className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              <span className="text-white text-xs">
                                {transaction.amount > 0 ? '+' : '-'}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{transaction.description}</p>
                              <p className="text-gray-400 text-sm">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount} {transaction.currency}
                            </p>
                            <p className="text-gray-400 text-xs">{transaction.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;