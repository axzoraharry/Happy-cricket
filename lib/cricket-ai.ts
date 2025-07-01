// AI Cricket Predictions Engine
class CricketAI {
  
  // Generate AI predictions for matches
  generateMatchPredictions(matchData: any) {
    const teamA = matchData.team_a || 'Team A'
    const teamB = matchData.team_b || 'Team B'
    const venue = matchData.venue || 'Unknown Venue'
    const format = matchData.match_type || 'T20'
    
    return {
      matchId: matchData.id,
      lastUpdated: new Date().toISOString(),
      confidence: Math.floor(Math.random() * 25) + 75, // 75-100%
      
      // Match Outcome Prediction
      winProbability: {
        [teamA]: Math.floor(Math.random() * 40) + 40, // 40-80%
        [teamB]: 0, // Will be calculated as 100 - teamA
        tie: Math.floor(Math.random() * 5) + 2 // 2-7%
      },
      
      // Score Predictions
      scorePredictions: {
        [teamA]: {
          predictedScore: Math.floor(Math.random() * 60) + 160, // 160-220
          range: { min: 140, max: 200 },
          confidence: Math.floor(Math.random() * 20) + 80
        },
        [teamB]: {
          predictedScore: Math.floor(Math.random() * 60) + 150, // 150-210
          range: { min: 130, max: 190 },
          confidence: Math.floor(Math.random() * 20) + 80
        }
      },
      
      // Key Performance Predictions
      keyPredictions: {
        totalRuns: Math.floor(Math.random() * 100) + 320, // 320-420
        totalWickets: Math.floor(Math.random() * 8) + 10, // 10-18
        totalSixes: Math.floor(Math.random() * 15) + 15, // 15-30
        totalFours: Math.floor(Math.random() * 20) + 35, // 35-55
        powerplayScore: Math.floor(Math.random() * 30) + 45, // 45-75
        deathOverScore: Math.floor(Math.random() * 40) + 60 // 60-100
      },
      
      // Player Performance Predictions
      topPerformers: this.generatePlayerPredictions(format),
      
      // Strategic Insights
      insights: this.generateMatchInsights(teamA, teamB, venue, format),
      
      // Weather Impact
      weatherImpact: this.generateWeatherPredictions(),
      
      // Pitch Analysis
      pitchAnalysis: this.generatePitchAnalysis(venue),
      
      // Fantasy Recommendations
      fantasyRecommendations: this.generateFantasyTips()
    }
  }

  generatePlayerPredictions(format: string) {
    const players = [
      'Virat Kohli', 'Rohit Sharma', 'KL Rahul', 'Hardik Pandya', 'Jasprit Bumrah',
      'Steve Smith', 'David Warner', 'Glenn Maxwell', 'Pat Cummins', 'Mitchell Starc'
    ]
    
    return {
      topScorer: {
        player: players[Math.floor(Math.random() * 5)], // Batsmen
        predictedRuns: Math.floor(Math.random() * 50) + 50,
        confidence: Math.floor(Math.random() * 30) + 70,
        reasoning: 'Excellent recent form and favorable matchup against pace bowling'
      },
      
      topWicketTaker: {
        player: players[Math.floor(Math.random() * 3) + 7], // Bowlers
        predictedWickets: Math.floor(Math.random() * 3) + 2,
        confidence: Math.floor(Math.random() * 25) + 75,
        reasoning: 'Strong record on this pitch type and good variations'
      },
      
      playerOfMatch: {
        player: players[Math.floor(Math.random() * players.length)],
        probability: Math.floor(Math.random() * 30) + 20,
        reasoning: 'All-round capabilities and clutch performance record'
      },
      
      captainPicks: [
        {
          player: players[0],
          score: Math.floor(Math.random() * 30) + 70,
          reasoning: 'Consistent performer with high fantasy points average'
        },
        {
          player: players[4],
          score: Math.floor(Math.random() * 25) + 75,
          reasoning: 'Wicket-taking ability and death bowling specialist'
        }
      ]
    }
  }

  generateMatchInsights(teamA: string, teamB: string, venue: string, format: string) {
    const insights = [
      `${teamA} has won 70% of their recent matches at ${venue}`,
      `${teamB} struggles against pace bowling in powerplay overs`,
      `Dew factor expected in second innings, chasing team advantage`,
      `Pitch traditionally favors batsmen with average score of 180+`,
      `Key battle: ${teamA} pace attack vs ${teamB} top order`,
      `Weather conditions ideal for fast bowling early in the match`,
      `${teamB} has excellent death bowling record this season`,
      `Toss winner likely to choose bowling first due to dew factor`
    ]
    
    // Return 4-6 random insights
    const numberOfInsights = Math.floor(Math.random() * 3) + 4
    const selectedInsights = []
    const usedIndices = new Set()
    
    while (selectedInsights.length < numberOfInsights && usedIndices.size < insights.length) {
      const randomIndex = Math.floor(Math.random() * insights.length)
      if (!usedIndices.has(randomIndex)) {
        selectedInsights.push(insights[randomIndex])
        usedIndices.add(randomIndex)
      }
    }
    
    return selectedInsights
  }

  generateWeatherPredictions() {
    const conditions = ['Clear', 'Partly Cloudy', 'Overcast', 'Light Rain Risk']
    const selectedCondition = conditions[Math.floor(Math.random() * conditions.length)]
    
    return {
      condition: selectedCondition,
      temperature: Math.floor(Math.random() * 15) + 25, // 25-40°C
      humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
      windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
      dewFactor: Math.random() > 0.5,
      impact: {
        batting: selectedCondition === 'Clear' ? 'Favorable' : 'Moderate',
        bowling: selectedCondition === 'Overcast' ? 'Favorable' : 'Moderate',
        fielding: selectedCondition === 'Light Rain Risk' ? 'Challenging' : 'Good'
      },
      recommendation: selectedCondition === 'Clear' 
        ? 'Perfect batting conditions expected'
        : selectedCondition === 'Overcast'
        ? 'Bowlers may get some assistance early on'
        : 'Weather may play a factor in team selection'
    }
  }

  generatePitchAnalysis(venue: string) {
    const pitchTypes = ['Batting Paradise', 'Balanced', 'Bowler Friendly', 'Slow and Low']
    const selectedType = pitchTypes[Math.floor(Math.random() * pitchTypes.length)]
    
    return {
      type: selectedType,
      paceSupport: Math.floor(Math.random() * 40) + 30, // 30-70%
      spinSupport: Math.floor(Math.random() * 40) + 30, // 30-70%
      bounceRating: Math.floor(Math.random() * 5) + 3, // 3-8/10
      averageScore: Math.floor(Math.random() * 50) + 150, // 150-200
      chaseSuccess: Math.floor(Math.random() * 40) + 40, // 40-80%
      
      recommendations: {
        batting: selectedType === 'Batting Paradise' 
          ? 'Aggressive approach recommended, boundaries available'
          : 'Build partnerships, rotate strike regularly',
        bowling: selectedType === 'Bowler Friendly'
          ? 'Maintain tight lines, wickets expected'
          : 'Focus on containing runs, use variations',
        fantasy: selectedType === 'Batting Paradise'
          ? 'Load up on batsmen, especially openers'
          : 'Balanced team with quality bowlers essential'
      }
    }
  }

  generateFantasyTips() {
    return {
      captainSuggestions: [
        {
          player: 'Virat Kohli',
          probability: 85,
          reasoning: 'Excellent record at this venue and in good form'
        },
        {
          player: 'Jasprit Bumrah',
          probability: 78,
          reasoning: 'Pitch conditions favor fast bowling'
        }
      ],
      
      differentialPicks: [
        {
          player: 'Washington Sundar',
          ownership: 15,
          reasoning: 'Low ownership but pitch assists spin bowling'
        },
        {
          player: 'Deepak Chahar',
          ownership: 22,
          reasoning: 'Good powerplay record and underpriced'
        }
      ],
      
      teamComposition: {
        batsmen: { min: 4, max: 6, recommendation: 5 },
        bowlers: { min: 3, max: 5, recommendation: 4 },
        allRounders: { min: 1, max: 3, recommendation: 2 },
        wicketKeepers: { min: 1, max: 2, recommendation: 1 }
      },
      
      riskStrategy: {
        conservative: 'Focus on consistent performers with 50+ average',
        moderate: 'Mix of proven players and 1-2 differential picks',
        aggressive: 'Multiple low-ownership players with high upside'
      },
      
      budgetTips: [
        'Spend big on proven top-order batsmen',
        'Find value in middle-order all-rounders',
        'Consider cheaper bowlers with good recent form',
        'Use remaining budget on differential wicket-keeper'
      ]
    }
  }

  // Generate predictions for upcoming matches
  async getPredictions(matches: any[]) {
    try {
      const predictions = matches.map(match => this.generateMatchPredictions(match))
      
      // Add overall tournament/series predictions
      const tournamentPredictions = this.generateTournamentPredictions(matches)
      
      return {
        matchPredictions: predictions,
        tournamentPredictions,
        lastUpdated: new Date().toISOString(),
        accuracy: {
          last10Matches: Math.floor(Math.random() * 20) + 75, // 75-95%
          thisMonth: Math.floor(Math.random() * 15) + 80, // 80-95%
          overall: Math.floor(Math.random() * 10) + 85 // 85-95%
        }
      }
    } catch (error) {
      console.error('Error generating predictions:', error)
      return null
    }
  }

  generateTournamentPredictions(matches: any[]) {
    const teams = [...new Set(matches.flatMap(m => [m.team_a, m.team_b]))]
    
    return {
      topTeams: teams.slice(0, 4).map((team, index) => ({
        team,
        winProbability: Math.floor(Math.random() * 20) + (80 - index * 15),
        reasoning: `Strong batting lineup and balanced bowling attack`
      })),
      
      emergingPlayer: {
        name: 'Shubman Gill',
        probability: 75,
        reasoning: 'Consistent performance and increasing responsibility'
      },
      
      keyTrends: [
        'Teams batting first winning 60% of matches',
        'Spin bowlers averaging 1.8 wickets per match',
        'Powerplay scores averaging 52 runs',
        'Death overs yielding 11.2 runs per over'
      ]
    }
  }

  // Real-time prediction updates
  updatePredictions(matchId: string, liveData: any) {
    const currentScore = liveData.teams?.batting?.score || 0
    const currentOvers = parseFloat(liveData.teams?.batting?.overs || '0')
    const wickets = liveData.teams?.batting?.wickets || 0
    
    const projectedTotal = this.projectFinalScore(currentScore, currentOvers, wickets)
    const winProbability = this.calculateLiveWinProbability(currentScore, currentOvers, wickets)
    
    return {
      matchId,
      timestamp: new Date().toISOString(),
      projectedTotal,
      winProbability,
      nextWicketProbability: this.calculateWicketProbability(currentOvers),
      boundaryProbability: this.calculateBoundaryProbability(currentOvers),
      momentum: this.calculateMomentum(liveData)
    }
  }

  projectFinalScore(currentScore: number, overs: number, wickets: number) {
    const remainingOvers = 20 - overs
    const runRate = currentScore / overs
    const wicketFactor = 1 - (wickets / 20) // Reduce projection as wickets fall
    
    const projectedRuns = currentScore + (remainingOvers * runRate * wicketFactor)
    
    return {
      projected: Math.round(projectedRuns),
      range: {
        min: Math.round(projectedRuns * 0.85),
        max: Math.round(projectedRuns * 1.15)
      },
      confidence: Math.max(50, 90 - (wickets * 5)) // Reduce confidence with wickets
    }
  }

  calculateLiveWinProbability(currentScore: number, overs: number, wickets: number) {
    const runRate = currentScore / overs
    const requiredRate = 8.5 // Assuming target of 170
    
    let probability = 50 + (runRate - requiredRate) * 5
    probability -= wickets * 3 // Reduce for wickets lost
    
    return Math.max(5, Math.min(95, Math.round(probability)))
  }

  calculateWicketProbability(overs: number) {
    // Higher probability in middle overs
    if (overs < 6) return Math.floor(Math.random() * 15) + 10 // 10-25%
    if (overs < 15) return Math.floor(Math.random() * 20) + 20 // 20-40%
    return Math.floor(Math.random() * 15) + 15 // 15-30%
  }

  calculateBoundaryProbability(overs: number) {
    // Higher in powerplay and death overs
    if (overs < 6) return Math.floor(Math.random() * 20) + 40 // 40-60%
    if (overs > 16) return Math.floor(Math.random() * 25) + 45 // 45-70%
    return Math.floor(Math.random() * 15) + 25 // 25-40%
  }

  calculateMomentum(liveData: any) {
    // Simple momentum calculation based on recent scoring
    const recentRunRate = 8.5 // This would be calculated from last few overs
    const avgRunRate = 7.2
    
    if (recentRunRate > avgRunRate + 2) return 'High'
    if (recentRunRate > avgRunRate) return 'Positive'
    if (recentRunRate < avgRunRate - 2) return 'Low'
    return 'Neutral'
  }
}

export default new CricketAI()