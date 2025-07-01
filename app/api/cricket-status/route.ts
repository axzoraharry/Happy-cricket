import { NextResponse } from "next/server"

export async function GET() {
  try {
    const token = process.env.ENTITYSPORT_API_TOKEN
    const baseURL = process.env.ENTITYSPORT_BASE_URL
    
    // Test EntitySport API connection
    let entitySportStatus = "Not Available"
    let entitySportError = null
    
    if (token) {
      try {
        const testURL = `${baseURL}/matches?token=${token}&status=2&per_page=5`
        const response = await fetch(testURL)
        const data = await response.json()
        
        if (response.ok && data.status === 'ok') {
          entitySportStatus = "Connected"
        } else {
          entitySportStatus = "API Error"
          entitySportError = data.response || data.message || "Unknown error"
        }
      } catch (error) {
        entitySportStatus = "Connection Failed"
        entitySportError = error instanceof Error ? error.message : "Unknown error"
      }
    } else {
      entitySportStatus = "Token Not Configured"
    }
    
    // Check our internal APIs
    const internalAPIs = []
    const endpoints = [
      { name: "Matches", path: "/api/matches" },
      { name: "Players", path: "/api/players" },
      { name: "Teams", path: "/api/teams" },
      { name: "Contests", path: "/api/contests" },
      { name: "Leaderboard", path: "/api/leaderboard" }
    ]
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3001${endpoint.path}`)
        const data = await response.json()
        
        internalAPIs.push({
          name: endpoint.name,
          status: response.ok ? "Working" : "Error",
          dataSource: data.source || "Internal",
          recordCount: data.matches?.length || data.players?.length || data.teams?.length || data.contests?.length || data.leaderboard?.length || 0
        })
      } catch (error) {
        internalAPIs.push({
          name: endpoint.name,
          status: "Error",
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      
      entitySport: {
        status: entitySportStatus,
        token: token ? `${token.substring(0, 8)}...${token.substring(token.length - 4)}` : "Not set",
        baseURL: baseURL || "Not set",
        error: entitySportError
      },
      
      internalAPIs,
      
      dataStrategy: {
        primary: "EntitySport API (when available)",
        fallback: "Realistic Cricket Schedule",
        currentSource: entitySportStatus === "Connected" ? "EntitySport API" : "Realistic Cricket Schedule"
      },
      
      recommendations: entitySportStatus !== "Connected" ? [
        "Current EntitySport API token appears to be invalid or expired",
        "The application is using realistic cricket data as fallback",
        "To get live data, please obtain a valid EntitySport API token",
        "Contact EntitySport support if you believe your token should be working"
      ] : [
        "EntitySport API is working correctly",
        "Real cricket data is being used",
        "All systems operational"
      ]
    })
  } catch (error) {
    return NextResponse.json({
      error: "Failed to check API status",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}