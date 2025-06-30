import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Mock teams data for testing
    const mockTeams = [
      { 
        id: 1, 
        name: "Super Kings", 
        total_points: 450, 
        rank: 2,
        player_count: 11,
        budget: 8500,
        created_at: new Date().toISOString()
      },
      { 
        id: 2, 
        name: "Royal Challengers", 
        total_points: 380, 
        rank: 5,
        player_count: 11,
        budget: 7200,
        created_at: new Date().toISOString()
      }
    ]

    return NextResponse.json({ teams: mockTeams })
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, logo_url } = await request.json()

    // Validate input
    if (!name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    // Create mock team
    const newTeam = {
      id: Math.floor(Math.random() * 1000),
      name,
      logo_url: logo_url || null,
      budget: 10000,
      player_count: 0,
      total_points: 0,
      rank: null,
      created_at: new Date().toISOString()
    }

    return NextResponse.json(
      {
        team: newTeam,
        message: "Team created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}