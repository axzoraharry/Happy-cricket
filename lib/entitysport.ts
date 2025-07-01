// EntitySport API service for cricket data

interface EntitySportMatch {
  match_id: string
  title: string
  short_title: string
  status: number
  venue: string
  date_start: string
  format: string
  competition: { title: string }
  teama: { name: string; short_name: string }
  teamb: { name: string; short_name: string }
}

interface EntitySportPlayer {
  pid: number
  title: string
  short_name: string
  playing_role: string
  nationality: string
}

class EntitySportAPI {
  private baseURL: string
  private token: string | undefined

  constructor() {
    this.baseURL = process.env.ENTITYSPORT_BASE_URL || 'https://rest.entitysport.com/v2'
    this.token = process.env.ENTITYSPORT_API_TOKEN
  }

  async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    if (!this.token) {
      throw new Error('EntitySport API token not configured')
    }

    const url = new URL(`${this.baseURL}${endpoint}`)
    url.searchParams.append('token', this.token)
    
    // Add additional parameters
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key])
    })

    console.log('EntitySport API Request:', url.toString().replace(this.token, '***TOKEN***'))

    try {
      const response = await fetch(url.toString())
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`EntitySport API Error Response:`, errorText)
        throw new Error(`EntitySport API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.status !== 'ok' && data.status !== 'success') {
        console.error(`EntitySport API Error Data:`, data)
        throw new Error(`EntitySport API error: ${data.message || data.response || 'Unknown error'}`)
      }

      return data
    } catch (error) {
      console.error('EntitySport API request failed:', error)
      throw error
    }
  }

  // Get live and upcoming matches
  async getMatches(status: string = 'live') {
    try {
      const endpoint = '/matches'
      const params = { status, per_page: '20' }
      
      const data = await this.makeRequest(endpoint, params)
      
      return {
        matches: data.response?.items || [],
        total: data.response?.total_items || 0
      }
    } catch (error) {
      console.error('Failed to fetch matches from EntitySport:', error)
      // Return fallback data
      return this.getFallbackMatches()
    }
  }

  // Get competitions/tournaments
  async getCompetitions() {
    try {
      const endpoint = '/competitions'
      const data = await this.makeRequest(endpoint)
      
      return data.response?.items || []
    } catch (error) {
      console.error('Failed to fetch competitions from EntitySport:', error)
      return []
    }
  }

  // Get teams
  async getTeams() {
    try {
      const endpoint = '/teams'
      const data = await this.makeRequest(endpoint)
      
      return data.response?.items || []
    } catch (error) {
      console.error('Failed to fetch teams from EntitySport:', error)
      return []
    }
  }

  // Get players
  async getPlayers() {
    try {
      const endpoint = '/players'
      const data = await this.makeRequest(endpoint)
      
      return data.response?.items || []
    } catch (error) {
      console.error('Failed to fetch players from EntitySport:', error)
      return this.getFallbackPlayers()
    }
  }

  // Get match details
  async getMatchDetails(matchId: string) {
    try {
      const endpoint = `/matches/${matchId}`
      const data = await this.makeRequest(endpoint)
      
      return data.response
    } catch (error) {
      console.error(`Failed to fetch match ${matchId} details:`, error)
      return null
    }
  }

  // Get live scores
  async getLiveScores(matchId: string) {
    try {
      const endpoint = `/matches/${matchId}/live`
      const data = await this.makeRequest(endpoint)
      
      return data.response
    } catch (error) {
      console.error(`Failed to fetch live scores for match ${matchId}:`, error)
      return null
    }
  }

  // Fallback data when API fails
  getFallbackMatches() {
    return {
      matches: [
        {
          match_id: 'fallback_1',
          title: 'India vs Australia',
          short_title: 'IND vs AUS',
          status: 2, // Upcoming
          venue: 'Melbourne Cricket Ground',
          date_start: new Date(Date.now() + 86400000).toISOString(),
          format: 'T20',
          competition: { title: 'T20 International' },
          teama: { name: 'India', short_name: 'IND' },
          teamb: { name: 'Australia', short_name: 'AUS' }
        },
        {
          match_id: 'fallback_2', 
          title: 'England vs South Africa',
          short_title: 'ENG vs SA',
          status: 2,
          venue: "Lord's Cricket Ground",
          date_start: new Date(Date.now() + 172800000).toISOString(),
          format: 'ODI',
          competition: { title: 'ODI Series' },
          teama: { name: 'England', short_name: 'ENG' },
          teamb: { name: 'South Africa', short_name: 'SA' }
        }
      ] as EntitySportMatch[],
      total: 2
    }
  }

  getFallbackPlayers() {
    return [
      {
        pid: 1,
        title: 'Virat Kohli',
        short_name: 'V Kohli', 
        playing_role: 'Batsman',
        nationality: 'India'
      },
      {
        pid: 2,
        title: 'Jasprit Bumrah',
        short_name: 'J Bumrah',
        playing_role: 'Bowler', 
        nationality: 'India'
      },
      {
        pid: 3,
        title: 'Steve Smith',
        short_name: 'S Smith',
        playing_role: 'Batsman',
        nationality: 'Australia' 
      }
    ] as EntitySportPlayer[]
  }
}

// Export singleton instance
const entitySportAPI = new EntitySportAPI()
export default entitySportAPI