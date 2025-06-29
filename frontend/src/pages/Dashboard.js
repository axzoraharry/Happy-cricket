import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const { wallet, loading: walletLoading } = useWallet();
  const [liveMatches, setLiveMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchLiveMatches();
  }, []);

  const fetchLiveMatches = async () => {
    try {
      // Since EntitySport API might not be working, use mock data
      setLiveMatches([
        {
          match_id: '1',
          title: 'India vs Australia',
          status: 'Live',
          format: 'T20',
          teama: { name: 'India', short_name: 'IND', score: '185/3', overs: '18.2' },
          teamb: { name: 'Australia', short_name: 'AUS', score: 'Yet to bat', overs: '' },
          venue: 'Mumbai'
        },
        {
          match_id: '2', 
          title: 'England vs Pakistan',
          status: 'Live',
          format: 'ODI',
          teama: { name: 'England', short_name: 'ENG', score: '254/7', overs: '45.3' },
          teamb: { name: 'Pakistan', short_name: 'PAK', score: '201/4', overs: '38.0' },
          venue: 'London'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch live matches:', error);
    } finally {
      setLoadingMatches(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-happy-500 to-happy-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome back, {user?.full_name || user?.username}! 👋
                </h1>
                <p className="text-happy-100">
                  Ready to win big on cricket? Let's get started!
                </p>
              </div>
              <div className="text-4xl">🏏</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Wallet Balance */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Happy Coin Balance</p>
                <p className="text-2xl font-bold text-happy-400">
                  {walletLoading ? '...' : wallet?.happy_coin_balance?.toFixed(2) || '0.00'} HC
                </p>
                <p className="text-gray-500 text-xs">
                  ≈ ₹{walletLoading ? '...' : ((wallet?.happy_coin_balance || 0) * 1000).toLocaleString()}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
            <Link to="/wallet" className="inline-block mt-4 text-happy-400 hover:text-happy-300 text-sm">
              Manage Wallet →
            </Link>
          </div>

          {/* Total Bets */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Bets</p>
                <p className="text-2xl font-bold text-blue-400">
                  {wallet?.total_bet_amount?.toFixed(2) || '0.00'} HC
                </p>
                <p className="text-gray-500 text-xs">This month</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
            <Link to="/betting" className="inline-block mt-4 text-blue-400 hover:text-blue-300 text-sm">
              View Betting History →
            </Link>
          </div>

          {/* Total Winnings */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Winnings</p>
                <p className="text-2xl font-bold text-green-400">
                  {wallet?.total_winnings?.toFixed(2) || '0.00'} HC
                </p>
                <p className="text-gray-500 text-xs">All time</p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/live-matches"
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors border border-gray-700 card-hover"
          >
            <div className="text-2xl mb-2">🔴</div>
            <p className="text-white font-medium">Live Matches</p>
            <p className="text-gray-400 text-xs">Watch & Bet</p>
          </Link>

          <Link
            to="/betting"
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors border border-gray-700 card-hover"
          >
            <div className="text-2xl mb-2">🎲</div>
            <p className="text-white font-medium">Place Bets</p>
            <p className="text-gray-400 text-xs">Win Big</p>
          </Link>

          <Link
            to="/wallet"
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors border border-gray-700 card-hover"
          >
            <div className="text-2xl mb-2">💳</div>
            <p className="text-white font-medium">Add Money</p>
            <p className="text-gray-400 text-xs">Deposit</p>
          </Link>

          <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors border border-gray-700 card-hover cursor-pointer">
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-white font-medium">Mr. Happy</p>
            <p className="text-gray-400 text-xs">AI Assistant</p>
          </div>
        </div>

        {/* Live Matches Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Live Cricket Matches</h2>
            <Link to="/live-matches" className="text-happy-400 hover:text-happy-300 text-sm">
              View All →
            </Link>
          </div>

          {loadingMatches ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-400">Loading live matches...</p>
            </div>
          ) : liveMatches.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏏</div>
              <p className="text-gray-400">No live matches at the moment</p>
              <p className="text-gray-500 text-sm">Check back later for live cricket action!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((match) => (
                <div key={match.match_id} className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">LIVE</span>
                    <span className="text-xs text-gray-400">{match.format} • {match.venue}</span>
                  </div>
                  
                  <h3 className="text-white font-semibold mb-3">{match.title}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {match.teama.short_name}
                        </div>
                        <span className="text-white">{match.teama.name}</span>
                      </div>
                      <span className="text-happy-400 font-medium">
                        {match.teama.score} {match.teama.overs && `(${match.teama.overs})`}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {match.teamb.short_name}
                        </div>
                        <span className="text-white">{match.teamb.name}</span>
                      </div>
                      <span className="text-gray-300 font-medium">
                        {match.teamb.score} {match.teamb.overs && `(${match.teamb.overs})`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Quick Bet</span>
                      <div className="space-x-2">
                        <button className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">
                          1.85
                        </button>
                        <button className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">
                          1.95
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">+</span>
                </div>
                <div>
                  <p className="text-white font-medium">Welcome Bonus</p>
                  <p className="text-gray-400 text-sm">Account created successfully</p>
                </div>
              </div>
              <span className="text-green-400 font-medium">+1.00 HC</span>
            </div>
            
            {wallet?.total_deposited > 0 && (
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">💳</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Deposit</p>
                    <p className="text-gray-400 text-sm">Money added to wallet</p>
                  </div>
                </div>
                <span className="text-blue-400 font-medium">+{wallet.total_deposited.toFixed(2)} INR</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;