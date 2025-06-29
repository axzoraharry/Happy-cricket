import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

const Betting = () => {
  const { wallet } = useWallet();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [betSlip, setBetSlip] = useState([]);
  const [betAmount, setBetAmount] = useState('');

  // Mock betting markets
  const bettingMatches = [
    {
      match_id: '1',
      title: 'India vs Australia',
      status: 'live',
      teama: { name: 'India', short_name: 'IND' },
      teamb: { name: 'Australia', short_name: 'AUS' },
      markets: [
        {
          market_id: 'winner',
          name: 'Match Winner',
          selections: [
            { name: 'India', odds: 1.85 },
            { name: 'Australia', odds: 1.95 }
          ]
        },
        {
          market_id: 'total_runs',
          name: 'Total Runs',
          selections: [
            { name: 'Over 300.5', odds: 1.90 },
            { name: 'Under 300.5', odds: 1.90 }
          ]
        },
        {
          market_id: 'highest_scorer',
          name: 'Highest Individual Score',
          selections: [
            { name: 'Over 50.5', odds: 2.20 },
            { name: 'Under 50.5', odds: 1.65 }
          ]
        }
      ]
    }
  ];

  const addToBetSlip = (match, market, selection) => {
    const bet = {
      id: `${match.match_id}_${market.market_id}_${selection.name}`,
      matchTitle: match.title,
      marketName: market.name,
      selectionName: selection.name,
      odds: selection.odds,
      stake: 0
    };

    const existingBetIndex = betSlip.findIndex(b => b.id === bet.id);
    if (existingBetIndex >= 0) {
      // Remove if already exists
      setBetSlip(betSlip.filter(b => b.id !== bet.id));
    } else {
      // Add new bet
      setBetSlip([...betSlip, bet]);
    }
  };

  const updateBetStake = (betId, stake) => {
    setBetSlip(betSlip.map(bet => 
      bet.id === betId ? { ...bet, stake: parseFloat(stake) || 0 } : bet
    ));
  };

  const removeBet = (betId) => {
    setBetSlip(betSlip.filter(bet => bet.id !== betId));
  };

  const getTotalStake = () => {
    return betSlip.reduce((total, bet) => total + bet.stake, 0);
  };

  const getTotalPotentialWinnings = () => {
    return betSlip.reduce((total, bet) => total + (bet.stake * bet.odds), 0);
  };

  const placeBets = async () => {
    if (betSlip.length === 0) {
      alert('Please add bets to your slip');
      return;
    }

    const totalStake = getTotalStake();
    if (totalStake <= 0) {
      alert('Please enter stake amounts');
      return;
    }

    if (totalStake > (wallet?.happy_coin_balance || 0)) {
      alert('Insufficient Happy Coin balance');
      return;
    }

    // TODO: Implement actual bet placement
    alert('Bets placed successfully! (Demo mode)');
    setBetSlip([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎯 Betting Markets</h1>
          <p className="text-gray-400">Place your bets on live cricket matches</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {bettingMatches.map((match) => (
              <div key={match.match_id} className="bg-gray-800 rounded-lg border border-gray-700">
                {/* Match Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{match.title}</h3>
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">LIVE</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Available Markets: {match.markets.length}
                    </div>
                  </div>
                </div>

                {/* Markets */}
                <div className="p-4 space-y-6">
                  {match.markets.map((market) => (
                    <div key={market.market_id}>
                      <h4 className="text-white font-medium mb-3">{market.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {market.selections.map((selection) => {
                          const isSelected = betSlip.some(bet => 
                            bet.id === `${match.match_id}_${market.market_id}_${selection.name}`
                          );
                          
                          return (
                            <button
                              key={selection.name}
                              onClick={() => addToBetSlip(match, market, selection)}
                              className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-happy-500 border-happy-400 text-white'
                                  : 'bg-gray-900 border-gray-600 text-gray-300 hover:border-happy-500 hover:bg-gray-700'
                              }`}
                            >
                              <div className="text-center">
                                <div className="font-medium">{selection.name}</div>
                                <div className="text-lg font-bold">{selection.odds}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {bettingMatches.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Betting Markets Available</h3>
                <p className="text-gray-400">Check back later for live betting opportunities</p>
              </div>
            )}
          </div>

          {/* Bet Slip */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">🎲 Bet Slip</h3>
                  <p className="text-sm text-gray-400">
                    Balance: {wallet?.happy_coin_balance?.toFixed(2) || '0.00'} HC
                  </p>
                </div>

                <div className="p-4">
                  {betSlip.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📋</div>
                      <p className="text-gray-400 text-sm">
                        Click on odds to add bets to your slip
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {betSlip.map((bet) => (
                        <div key={bet.id} className="bg-gray-900 rounded-lg p-3 border border-gray-600">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">{bet.selectionName}</p>
                              <p className="text-gray-400 text-xs">{bet.marketName}</p>
                              <p className="text-gray-500 text-xs">{bet.matchTitle}</p>
                            </div>
                            <button
                              onClick={() => removeBet(bet.id)}
                              className="text-red-400 hover:text-red-300 text-xs ml-2"
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-happy-400 font-bold">{bet.odds}</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              placeholder="Stake (HC)"
                              value={bet.stake || ''}
                              onChange={(e) => updateBetStake(bet.id, e.target.value)}
                              className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                            />
                          </div>
                          
                          {bet.stake > 0 && (
                            <div className="text-xs text-gray-400">
                              Potential win: {(bet.stake * bet.odds).toFixed(2)} HC
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Totals */}
                      <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-sm">Total Stake:</span>
                          <span className="text-white font-medium">{getTotalStake().toFixed(2)} HC</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Potential Win:</span>
                          <span className="text-green-400 font-bold">{getTotalPotentialWinnings().toFixed(2)} HC</span>
                        </div>
                      </div>

                      {/* Place Bet Button */}
                      <button
                        onClick={placeBets}
                        disabled={getTotalStake() <= 0 || getTotalStake() > (wallet?.happy_coin_balance || 0)}
                        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Place Bets
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Betting;