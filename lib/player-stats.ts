// Advanced Player Statistics API
class PlayerStatsAPI {
  
  // Generate comprehensive player statistics
  generatePlayerStats(playerId: string, playerName: string) {
    const recentMatches = this.generateRecentMatches()
    const seasonStats = this.generateSeasonStats()
    const careerStats = this.generateCareerStats()
    
    return {
      playerId,
      name: playerName,
      recentForm: this.calculateForm(recentMatches),
      recentMatches,
      seasonStats,
      careerStats,
      performanceAnalysis: this.generatePerformanceAnalysis(),
      fantasyInsights: this.generateFantasyInsights(),
      upcomingFixtures: this.generateUpcomingFixtures(),
      headToHead: this.generateHeadToHeadStats()
    }
  }

  generateRecentMatches() {
    const matches = []
    const opponents = ['Australia', 'England', 'Pakistan', 'South Africa', 'New Zealand', 'West Indies']
    const venues = ['MCG', 'Lords', 'Eden Gardens', 'Oval', 'SCG', 'Wankhede']
    
    for (let i = 0; i < 10; i++) {
      const matchDate = new Date()
      matchDate.setDate(matchDate.getDate() - (i * 7))
      
      const runs = Math.floor(Math.random() * 120)
      const balls = Math.floor(Math.random() * 80) + 20
      
      matches.push({
        matchId: `match_${i}`,
        date: matchDate.toISOString(),
        opponent: opponents[Math.floor(Math.random() * opponents.length)],
        venue: venues[Math.floor(Math.random() * venues.length)],
        format: ['T20', 'ODI', 'Test'][Math.floor(Math.random() * 3)],
        runs: runs,
        balls: balls,
        fours: Math.floor(Math.random() * 12),
        sixes: Math.floor(Math.random() * 6),
        strikeRate: ((runs / balls) * 100).toFixed(1),
        dismissed: Math.random() > 0.3,
        wickets: Math.floor(Math.random() * 4), // if bowler
        conceded: Math.floor(Math.random() * 50), // if bowler
        fantasyPoints: Math.floor(Math.random() * 100) + 20
      })
    }
    
    return matches
  }

  generateSeasonStats() {
    const matches = Math.floor(Math.random() * 20) + 15
    const totalRuns = Math.floor(Math.random() * 1200) + 500
    
    return {
      format: 'T20',
      matches,
      innings: matches - Math.floor(Math.random() * 3),
      runs: totalRuns,
      average: (totalRuns / (matches - Math.floor(Math.random() * 5))).toFixed(1),
      strikeRate: (Math.random() * 30 + 120).toFixed(1),
      centuries: Math.floor(Math.random() * 3),
      halfCenturies: Math.floor(Math.random() * 8) + 2,
      highestScore: Math.floor(Math.random() * 60) + 80,
      ballsFaced: Math.floor(totalRuns * 0.8),
      fours: Math.floor(Math.random() * 80) + 30,
      sixes: Math.floor(Math.random() * 25) + 10,
      // Bowling stats
      wickets: Math.floor(Math.random() * 15) + 5,
      economy: (Math.random() * 3 + 6).toFixed(1),
      bowlingAverage: (Math.random() * 10 + 20).toFixed(1),
      bestFigures: `${Math.floor(Math.random() * 4) + 2}/${Math.floor(Math.random() * 20) + 15}`
    }
  }

  generateCareerStats() {
    const totalMatches = Math.floor(Math.random() * 200) + 100
    const totalRuns = Math.floor(Math.random() * 8000) + 3000
    
    return {
      debut: '2018-03-15',
      totalMatches,
      totalInnings: totalMatches - Math.floor(Math.random() * 20),
      totalRuns,
      average: (totalRuns / (totalMatches * 0.8)).toFixed(1),
      strikeRate: (Math.random() * 25 + 125).toFixed(1),
      centuries: Math.floor(Math.random() * 12) + 3,
      halfCenturies: Math.floor(Math.random() * 35) + 15,
      highestScore: Math.floor(Math.random() * 80) + 120,
      totalBoundaries: Math.floor(Math.random() * 500) + 200,
      totalSixes: Math.floor(Math.random() * 150) + 50,
      // Bowling career
      totalWickets: Math.floor(Math.random() * 80) + 30,
      bowlingAverage: (Math.random() * 8 + 22).toFixed(1),
      economyRate: (Math.random() * 2 + 6.5).toFixed(1),
      bestBowling: `${Math.floor(Math.random() * 3) + 3}/${Math.floor(Math.random() * 15) + 12}`
    }
  }

  calculateForm(recentMatches: any[]) {
    const last5Matches = recentMatches.slice(0, 5)
    const avgScore = last5Matches.reduce((sum, match) => sum + match.runs, 0) / 5
    const avgFantasyPoints = last5Matches.reduce((sum, match) => sum + match.fantasyPoints, 0) / 5
    
    let formRating = 'Average'
    if (avgFantasyPoints > 70) formRating = 'Excellent'
    else if (avgFantasyPoints > 50) formRating = 'Good'
    else if (avgFantasyPoints < 30) formRating = 'Poor'
    
    return {
      rating: formRating,
      avgScore: avgScore.toFixed(1),
      avgFantasyPoints: avgFantasyPoints.toFixed(1),
      consistency: this.calculateConsistency(last5Matches),
      trend: Math.random() > 0.5 ? 'improving' : 'declining'
    }
  }

  calculateConsistency(matches: any[]) {
    const scores = matches.map(m => m.fantasyPoints)
    const mean = scores.reduce((a, b) => a + b) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)
    
    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 100 - (standardDeviation * 2))
    return consistencyScore.toFixed(0)
  }

  generatePerformanceAnalysis() {
    return {
      strengths: [
        'Excellent strike rate in powerplay',
        'Strong finish in death overs',
        'Consistent performer under pressure',
        'Good record against pace bowling'
      ],
      weaknesses: [
        'Struggles against left-arm spin',
        'Lower average in overseas conditions',
        'Tendency to get out early in big matches'
      ],
      recommendations: [
        'Ideal for powerplay specialist role',
        'Captain/Vice-captain potential in home matches',
        'Avoid in matches with quality spin attack'
      ],
      pitchAnalysis: {
        batting: {
          'Flat Pitch': 85,
          'Green Pitch': 65,
          'Turning Pitch': 45,
          'Bouncy Pitch': 75
        },
        performance: {
          'Home': 78,
          'Away': 62,
          'Neutral': 70
        }
      }
    }
  }

  generateFantasyInsights() {
    return {
      price: Math.floor(Math.random() * 8) + 8, // 8-15 credits
      ownership: Math.floor(Math.random() * 60) + 20, // 20-80%
      projectedPoints: Math.floor(Math.random() * 30) + 45, // 45-75 points
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      captainPotential: Math.floor(Math.random() * 40) + 60, // 60-100%
      differentialPick: Math.random() > 0.7,
      valueForMoney: Math.floor(Math.random() * 30) + 70,
      recentPerformance: {
        last5Avg: (Math.random() * 30 + 40).toFixed(1),
        trend: ['↗️ Improving', '↘️ Declining', '→ Stable'][Math.floor(Math.random() * 3)]
      }
    }
  }

  generateUpcomingFixtures() {
    const fixtures = []
    const opponents = ['Australia', 'England', 'Pakistan', 'South Africa']
    
    for (let i = 0; i < 5; i++) {
      const matchDate = new Date()
      matchDate.setDate(matchDate.getDate() + (i * 7) + 1)
      
      fixtures.push({
        date: matchDate.toISOString(),
        opponent: opponents[Math.floor(Math.random() * opponents.length)],
        venue: 'Home',
        format: 'T20',
        difficulty: Math.floor(Math.random() * 5) + 1, // 1-5 scale
        fantasyProjection: Math.floor(Math.random() * 30) + 50
      })
    }
    
    return fixtures
  }

  generateHeadToHeadStats() {
    const opponents = ['Australia', 'England', 'Pakistan', 'South Africa']
    const stats: Record<string, any> = {}
    
    opponents.forEach(opponent => {
      stats[opponent] = {
        matches: Math.floor(Math.random() * 15) + 5,
        runs: Math.floor(Math.random() * 800) + 200,
        average: (Math.random() * 30 + 35).toFixed(1),
        highestScore: Math.floor(Math.random() * 60) + 40,
        centuries: Math.floor(Math.random() * 3),
        strikeRate: (Math.random() * 25 + 120).toFixed(1),
        fantasyAvg: (Math.random() * 25 + 45).toFixed(1)
      }
    })
    
    return stats
  }

  async getPlayerStats(playerId: string, playerName: string) {
    try {
      // In real implementation, this would call EntitySport API
      // For now, return generated comprehensive stats
      return this.generatePlayerStats(playerId, playerName)
    } catch (error) {
      console.error('Error fetching player stats:', error)
      return this.generatePlayerStats(playerId, playerName)
    }
  }
}

export default new PlayerStatsAPI()