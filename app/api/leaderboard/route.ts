import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tournamentId = searchParams.get("tournamentId")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Mock leaderboard data
    const mockLeaderboard = [
      {
        id: 1,
        user_id: 1,
        user_name: "Cricket Master",
        team_id: 1,
        team_name: "Super Kings",
        points: 2850,
        rank: 1,
        prize_won: 50000
      },
      {
        id: 2,
        user_id: 2,
        user_name: "Fantasy Pro",
        team_id: 2,
        team_name: "Royal Challengers",
        points: 2650,
        rank: 2,
        prize_won: 25000
      },
      {
        id: 3,
        user_id: 3,
        user_name: "Cricket Fan",
        team_id: 3,
        team_name: "Mumbai Warriors",
        points: 2450,
        rank: 3,
        prize_won: 10000
      },
      {
        id: 4,
        user_id: 4,
        user_name: "Team Builder",
        team_id: 4,
        team_name: "Delhi Capitals",
        points: 2350,
        rank: 4,
        prize_won: 5000
      },
      {
        id: 5,
        user_id: 5,
        user_name: "Fantasy Expert",
        team_id: 5,
        team_name: "Chennai Lions",
        points: 2250,
        rank: 5,
        prize_won: 2500
      }
    ]

    // Apply pagination
    const paginatedLeaderboard = mockLeaderboard.slice(offset, offset + limit)

    return NextResponse.json({ 
      leaderboard: paginatedLeaderboard,
      pagination: {
        total: mockLeaderboard.length,
        limit,
        offset,
        pages: Math.ceil(mockLeaderboard.length / limit),
        currentPage: Math.floor(offset / limit) + 1,
      }
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}