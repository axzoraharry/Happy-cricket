import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative cricket-field min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <div className="text-6xl md:text-8xl mb-4 animate-bounce-slow">🏏</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-happy-400 to-happy-600 bg-clip-text text-transparent">
              Welcome to Happy Cricket
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              India's Premier Cricket Betting & Gaming Platform
            </p>
            <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
              Experience the thrill of cricket like never before with live betting, 
              real-time match updates, and our revolutionary Happy Coin system. 
              Plus, meet Mr. Happy - your personal AI betting assistant!
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-primary text-lg px-8 py-4"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary text-lg px-8 py-4"
                >
                  Start Playing Now 🚀
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Features Preview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-6 rounded-lg text-center card-hover">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2 text-happy-400">Live Betting</h3>
              <p className="text-gray-300">
                Bet on live cricket matches with real-time odds and instant settlements
              </p>
            </div>
            
            <div className="glass p-6 rounded-lg text-center card-hover">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2 text-happy-400">Happy Coin</h3>
              <p className="text-gray-300">
                Our unique cryptocurrency system for seamless gaming and rewards
              </p>
            </div>
            
            <div className="glass p-6 rounded-lg text-center card-hover">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2 text-happy-400">Mr. Happy AI</h3>
              <p className="text-gray-300">
                Your personal AI assistant for betting tips, balance checks, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Matches Preview */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Live Cricket Action</h2>
            <p className="text-xl text-gray-400">
              Follow live matches and place bets in real-time
            </p>
          </div>

          {/* Mock Live Match Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((match) => (
              <div key={match} className="bg-gray-900 rounded-lg p-6 border border-gray-700 card-hover">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">LIVE</span>
                  <span className="text-xs text-gray-400">T20 World Cup</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">IND</div>
                      <span className="font-semibold">India</span>
                    </div>
                    <span className="text-happy-400 font-bold">185/3 (18.2)</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">AUS</div>
                      <span className="font-semibold">Australia</span>
                    </div>
                    <span className="text-gray-400">Yet to bat</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Win Odds</span>
                    <div className="space-x-2">
                      <span className="text-green-400">1.85</span>
                      <span className="text-red-400">1.95</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              to={isAuthenticated ? "/live-matches" : "/register"}
              className="btn-primary"
            >
              View All Live Matches
            </Link>
          </div>
        </div>
      </section>

      {/* Happy Coin Section */}
      <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Introducing <span className="text-happy-400">Happy Coin</span>
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Our revolutionary cryptocurrency designed specifically for cricket gaming. 
                Seamless transactions, instant settlements, and exclusive rewards.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300">1 Happy Coin = ₹1,000 INR</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Instant deposits & withdrawals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Referral bonuses & rewards</span>
                </div>
              </div>
              
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Get Free Happy Coins
                </Link>
              )}
            </div>
            
            <div className="text-center">
              <div className="relative">
                <div className="w-64 h-64 mx-auto bg-gradient-to-r from-happy-400 to-happy-600 rounded-full flex items-center justify-center neon-yellow">
                  <div className="text-6xl font-bold text-white">HC</div>
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white font-bold">₹</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;