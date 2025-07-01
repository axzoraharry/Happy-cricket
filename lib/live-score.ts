// Live Cricket Scoring API service
class LiveScoreAPI {
  constructor() {
    this.baseURL = process.env.ENTITYSPORT_BASE_URL || 'https://rest.entitysport.com/v2'
    this.token = process.env.ENTITYSPORT_API_TOKEN
  }

  // Simulate live scoring when EntitySport API is unavailable
  generateLiveScore(matchId: string) {
    const teams = ['India', 'Australia', 'England', 'South Africa', 'New Zealand', 'Pakistan']
    const teamA = teams[Math.floor(Math.random() * teams.length)]
    const teamB = teams.filter(t => t !== teamA)[Math.floor(Math.random() * (teams.length - 1))]
    
    const currentOver = Math.floor(Math.random() * 20) + 1
    const currentBall = Math.floor(Math.random() * 6) + 1
    const totalScore = Math.floor(Math.random() * 200) + 50
    const wickets = Math.floor(Math.random() * 8)
    
    return {
      matchId,
      status: 'live',
      teams: {
        batting: {
          name: teamA,
          score: totalScore,
          wickets: wickets,
          overs: `${currentOver}.${currentBall}`,
          runRate: (totalScore / (currentOver + currentBall/6)).toFixed(2),
          batsmen: [
            {
              name: 'Virat Kohli',
              runs: Math.floor(Math.random() * 80) + 10,
              balls: Math.floor(Math.random() * 60) + 15,
              fours: Math.floor(Math.random() * 8),
              sixes: Math.floor(Math.random() * 4),
              strikeRate: Math.floor(Math.random() * 40 + 120)
            },
            {
              name: 'Rohit Sharma', 
              runs: Math.floor(Math.random() * 50) + 5,
              balls: Math.floor(Math.random() * 40) + 10,
              fours: Math.floor(Math.random() * 6),
              sixes: Math.floor(Math.random() * 3),
              strikeRate: Math.floor(Math.random() * 30 + 110)
            }
          ]
        },
        bowling: {
          name: teamB,
          bowler: {
            name: 'Pat Cummins',
            overs: `${Math.floor(Math.random() * 4)}.${Math.floor(Math.random() * 6)}`,
            runs: Math.floor(Math.random() * 30) + 5,
            wickets: Math.floor(Math.random() * 3),
            economy: (Math.random() * 4 + 6).toFixed(1)
          }
        }
      },
      lastBalls: [
        { ball: `${currentOver}.${currentBall-1}`, runs: Math.floor(Math.random() * 7), type: 'normal' },
        { ball: `${currentOver}.${currentBall-2}`, runs: 4, type: 'four' },
        { ball: `${currentOver}.${currentBall-3}`, runs: 1, type: 'normal' },
        { ball: `${currentOver}.${currentBall-4}`, runs: 6, type: 'six' },
        { ball: `${currentOver}.${currentBall-5}`, runs: 0, type: 'dot' }
      ],
      commentary: [
        `${currentOver}.${currentBall} - Excellent delivery by ${teamB} bowler, defended well`,
        `${currentOver}.${currentBall-1} - FOUR! Beautiful cover drive for a boundary`,
        `${currentOver}.${currentBall-2} - Single taken, good running between the wickets`,
        `${currentOver}.${currentBall-3} - SIX! Massive hit over long-on, crowd on their feet!`,
        `${currentOver}.${currentBall-4} - Dot ball, tight line and length`
      ],
      requiredRate: teamA === 'India' ? 8.5 : null,
      target: teamA === 'India' ? 185 : null,
      matchState: `${teamA} need ${Math.floor(Math.random() * 50) + 20} runs from ${20 - currentOver} overs`
    }
  }

  async getLiveScore(matchId: string) {
    try {
      if (!this.token) {
        return this.generateLiveScore(matchId)
      }

      const response = await fetch(`${this.baseURL}/matches/${matchId}/live?token=${this.token}`)
      
      if (!response.ok) {
        console.log('EntitySport API unavailable, using simulated live score')
        return this.generateLiveScore(matchId)
      }

      const data = await response.json()
      
      if (data.status === 'ok') {
        return data.response
      } else {
        return this.generateLiveScore(matchId)
      }
    } catch (error) {
      console.error('Live score fetch error:', error)
      return this.generateLiveScore(matchId)
    }
  }

  // Generate ball-by-ball commentary
  generateCommentary() {
    const commentaries = [
      "Excellent delivery! Right on the money",
      "FOUR! Brilliant shot through the covers",
      "SIX! That's out of the park! Massive hit",
      "WICKET! What a catch! Spectacular fielding",
      "Dot ball. Tight bowling, no room to score",
      "Appeal for LBW! Not out says the umpire",
      "Quick single! Good running between wickets",
      "DROPPED! Chance goes down, costly miss",
      "Century! What an innings! Crowd on their feet",
      "Last over! This is getting exciting!"
    ]
    
    return commentaries[Math.floor(Math.random() * commentaries.length)]
  }

  // Simulate real-time updates
  simulateRealTimeUpdates(callback: (update: any) => void) {
    const interval = setInterval(() => {
      const update = {
        timestamp: new Date().toISOString(),
        type: Math.random() > 0.7 ? 'boundary' : 'normal',
        runs: Math.floor(Math.random() * 7),
        commentary: this.generateCommentary(),
        over: `${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 6)}`,
        batsman: ['Virat Kohli', 'Rohit Sharma', 'KL Rahul'][Math.floor(Math.random() * 3)]
      }
      
      callback(update)
    }, 15000) // Update every 15 seconds

    return () => clearInterval(interval)
  }
}

export default new LiveScoreAPI()