import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "upcoming"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Mock matches data for testing
    const mockMatches = [
      {
        id: 1,
        team_a: "India",
        team_b: "Australia", 
        venue: "Melbourne Cricket Ground",
        match_date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        match_type: "T20",
        status: "upcoming"
      },
      {
        id: 2,
        team_a: "England",
        team_b: "South Africa",
        venue: "Lord's Cricket Ground", 
        match_date: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
        match_type: "ODI", 
        status: "upcoming"
      }
    ]

    // Filter matches by status
    const filteredMatches = mockMatches.filter(match => match.status === status)
    
    // Apply pagination
    const paginatedMatches = filteredMatches.slice(offset, offset + limit)
    
    const total = filteredMatches.length

    return NextResponse.json({
      matches: paginatedMatches,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    })
  } catch (error) {
    console.error("Error fetching matches:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
