import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("matchId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Mock contests data
    const mockContests = [
      {
        id: 1,
        name: "IPL Mega Contest",
        entry_fee: 100,
        max_teams: 10000,
        total_prize: 1000000,
        joined_teams: 8500,
        status: "upcoming",
        match_id: 1,
        start_time: new Date(Date.now() + 86400000).toISOString()
      },
      {
        id: 2,
        name: "T20 World Cup Special",
        entry_fee: 500,
        max_teams: 5000,
        total_prize: 2500000,
        joined_teams: 3200,
        status: "upcoming",
        match_id: 2,
        start_time: new Date(Date.now() + 172800000).toISOString()
      }
    ]

    // Filter by matchId if provided
    let filteredContests = mockContests
    if (matchId && !isNaN(parseInt(matchId))) {
      filteredContests = mockContests.filter(c => c.match_id === parseInt(matchId))
    }

    // Apply pagination
    const paginatedContests = filteredContests.slice(offset, offset + limit)
    const total = filteredContests.length

    return NextResponse.json({
      contests: paginatedContests,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    })
  } catch (error) {
    console.error("Error fetching contests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, matchId, entryFee, maxTeams, totalPrize, isPrivate, description } = await request.json()

    // Validate input
    if (!name || !matchId || !maxTeams || !totalPrize) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create mock contest
    const newContest = {
      id: Math.floor(Math.random() * 1000),
      name,
      match_id: matchId,
      entry_fee: entryFee || 0,
      max_teams: maxTeams,
      total_prize: totalPrize,
      is_private: isPrivate || false,
      description: description || null,
      joined_teams: 0,
      status: "upcoming",
      created_at: new Date().toISOString()
    }

    return NextResponse.json(
      {
        contest: newContest,
        message: "Contest created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating contest:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}