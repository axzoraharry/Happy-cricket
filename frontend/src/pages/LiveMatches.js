import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      // Mock data since EntitySport API might not be working
      const mockMatches = [
        {
          match_id: '1',
          title: 'India vs Australia',
          status: 'live',
          format: 'T20',
          competition: 'ICC T20 World Cup',
          teama: { 
            name: 'India', 
            short_name: 'IND', 
            score: '185/3', 
            overs: '18.2',
            flag: '🇮🇳'
          },
          teamb: { 
            name: 'Australia', 
            short_name: 'AUS', 
            score: 'Yet to bat', 
            overs: '',
            flag: '🇦🇺'
          },
          venue: 'Mumbai Cricket Stadium',
          odds: {
            teama_win: 1.85,
            teamb_win: 1.95,
            draw: 25.0
          }
        },
        {
          match_id: '2',
          title: 'England vs Pakistan', 
          status: 'live',
          format: 'ODI',
          competition: 'ICC Cricket World Cup',
          teama: { 
            name: 'England', 
            short_name: 'ENG', 
            score: '254/7', 
            overs: '45.3',
            flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
          },
          teamb: { 
            name: 'Pakistan', 
            short_name: 'PAK', 
            score: '201/4', 
            overs: '38.0',
            flag: '🇵🇰'
          },
          venue: 'Lord\'s Cricket Ground',
          odds: {
            teama_win: 1.75,
            teamb_win: 2.10,
            draw: 15.0
          }
        },
        {
          match_id: '3',
          title: 'South Africa vs New Zealand',
          status: 'upcoming', 
          format: 'Test',
          competition: 'Test Championship',
          teama: { 
            name: 'South Africa', 
            short_name: 'SA', 
            score: '', 
            overs: '',
            flag: '🇿🇦'
          },
          teamb: { 
            name: 'New Zealand', 
            short_name: 'NZ', 
            score: '', 
            overs: '',
            flag: '🇳🇿'
          },
          venue: 'Cape Town',
          start_time: '2024-01-15 10:00',
          odds: {
            teama_win: 2.20,
            teamb_win: 1.80,
            draw: 3.50
          }
        }
      ];
      
      setMatches(mockMatches);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (activeFilter === 'all') return true;
    return match.status === activeFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">LIVE</span>;
      case 'upcoming':
        return <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">UPCOMING</span>;
      case 'completed':
        return <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded-full">COMPLETED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔴 Live Cricket Matches</h1>
          <p className="text-gray-400">Watch live cricket and place your bets</p>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: 'all', label: 'All Matches', count: matches.length },
            { id: 'live', label: 'Live', count: matches.filter(m => m.status === 'live').length },
            { id: 'upcoming', label: 'Upcoming', count: matches.filter(m => m.status === 'upcoming').length },
            { id: 'completed', label: 'Completed', count: matches.filter(m => m.status === 'completed').length }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeFilter === filter.id
                  ? 'bg-happy-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{filter.label}</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full">
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Loading cricket matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏏</div>
            <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
            <p className="text-gray-400">
              {activeFilter === 'all' 
                ? 'No cricket matches available at the moment'
                : `No ${activeFilter} matches found`
              }
            </p>
          </div>
        ) : (
          /* Matches Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMatches.map((match) => (
              <div key={match.match_id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden card-hover">
                {/* Match Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    {getStatusBadge(match.status)}
                    <span className="text-xs text-gray-400">{match.format} • {match.competition}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{match.title}</h3>
                  <p className="text-sm text-gray-400">📍 {match.venue}</p>
                  {match.start_time && (
                    <p className="text-sm text-gray-400">🕐 {new Date(match.start_time).toLocaleString()}</p>
                  )}
                </div>

                {/* Team Scores */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{match.teama.flag}</span>
                      <div>
                        <p className="font-semibold text-white">{match.teama.name}</p>
                        <p className="text-xs text-gray-400">{match.teama.short_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-happy-400">
                        {match.teama.score || 'Yet to bat'}
                      </p>
                      {match.teama.overs && (
                        <p className="text-xs text-gray-400">({match.teama.overs} overs)</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{match.teamb.flag}</span>
                      <div>
                        <p className="font-semibold text-white">{match.teamb.name}</p>
                        <p className="text-xs text-gray-400">{match.teamb.short_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {match.teamb.score || 'Yet to bat'}
                      </p>
                      {match.teamb.overs && (
                        <p className="text-xs text-gray-400">({match.teamb.overs} overs)</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Betting Odds */}
                <div className="p-4 bg-gray-900 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Win Odds</span>
                    <Link 
                      to="/betting"
                      className="text-happy-400 hover:text-happy-300 text-sm font-medium"
                    >
                      Place Bet →
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors">
                      {match.teama.short_name}: {match.odds.teama_win}
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors">
                      {match.teamb.short_name}: {match.odds.teamb_win}
                    </button>
                  </div>
                  
                  {match.format !== 'T20' && (
                    <button className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors">
                      Draw: {match.odds.draw}
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    {match.status === 'live' ? (
                      <>
                        <button className="btn-primary text-sm py-2">
                          📺 Watch Live
                        </button>
                        <button className="btn-secondary text-sm py-2">
                          📊 Live Stats
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn-primary text-sm py-2">
                          🎯 Pre-bet
                        </button>
                        <button className="btn-secondary text-sm py-2">
                          📈 Analysis
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMatches;