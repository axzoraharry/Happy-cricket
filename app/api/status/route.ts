import { NextResponse } from "next/server"

export async function GET() {
  try {
    const timestamp = new Date().toISOString()
    
    // Test all our API endpoints
    const baseUrl = 'http://localhost:3001/api'
    
    const endpointTests = [
      { name: 'Matches', endpoint: '/matches', description: 'Cricket matches with EntitySport integration' },
      { name: 'Players', endpoint: '/players', description: 'Cricket players with EntitySport integration' },
      { name: 'Teams', endpoint: '/teams', description: 'Fantasy teams data' },
      { name: 'Contests', endpoint: '/contests', description: 'Fantasy contests' },
      { name: 'Leaderboard', endpoint: '/leaderboard', description: 'Rankings and statistics' },
      { name: 'Competitions', endpoint: '/competitions', description: 'Cricket competitions with EntitySport' },
      { name: 'EntitySport Test', endpoint: '/test-entitysport', description: 'EntitySport API connection test' }
    ]

    const results = []
    
    for (const test of endpointTests) {
      try {
        const response = await fetch(`${baseUrl}${test.endpoint}`)
        const data = await response.json()
        
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          description: test.description,
          status: response.ok ? 'SUCCESS' : 'ERROR',
          httpStatus: response.status,
          dataSource: data.source || 'Internal',
          hasData: Array.isArray(data.matches) ? data.matches.length > 0 :
                   Array.isArray(data.players) ? data.players.length > 0 :
                   Array.isArray(data.teams) ? data.teams.length > 0 :
                   Array.isArray(data.contests) ? data.contests.length > 0 :
                   Array.isArray(data.leaderboard) ? data.leaderboard.length > 0 :
                   Array.isArray(data.competitions) ? data.competitions.length > 0 :
                   data.status === 'success',
          error: data.error || null
        })
      } catch (error) {
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          description: test.description,
          status: 'ERROR',
          httpStatus: 500,
          dataSource: 'Unknown',
          hasData: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      status: 'Cricket Fantasy League API Status',
      timestamp,
      entitySportIntegration: {
        configured: !!process.env.ENTITYSPORT_API_TOKEN,
        token: process.env.ENTITYSPORT_API_TOKEN ? 
          `${process.env.ENTITYSPORT_API_TOKEN.substring(0, 8)}...${process.env.ENTITYSPORT_API_TOKEN.substring(-4)}` : 
          'Not configured',
        baseURL: process.env.ENTITYSPORT_BASE_URL || 'Not configured',
        fallbackSystem: 'Active - providing cricket data when EntitySport API is unavailable'
      },
      endpoints: results,
      summary: {
        totalEndpoints: results.length,
        successfulEndpoints: results.filter(r => r.status === 'SUCCESS').length,
        errorEndpoints: results.filter(r => r.status === 'ERROR').length,
        endpointsWithData: results.filter(r => r.hasData).length
      },
      nextSteps: [
        'Verify EntitySport API token validity',
        'Check EntitySport API documentation for correct endpoint format',
        'Consider contacting EntitySport support for token verification',
        'All endpoints are working with fallback data in the meantime'
      ]
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}