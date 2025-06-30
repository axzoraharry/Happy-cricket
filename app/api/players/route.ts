import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Mock players data
    const mockPlayers = [
      { 
        id: 1, 
        name: "Virat Kohli", 
        team: "India", 
        role: "Batsman", 
        price: 12.5,
        points: 850,
        country: "India"
      },
      { 
        id: 2, 
        name: "Jasprit Bumrah", 
        team: "India", 
        role: "Bowler", 
        price: 11.0,
        points: 720,
        country: "India"
      },
      { 
        id: 3, 
        name: "Steve Smith", 
        team: "Australia", 
        role: "Batsman", 
        price: 11.5,
        points: 780,
        country: "Australia"
      },
      { 
        id: 4, 
        name: "Pat Cummins", 
        team: "Australia", 
        role: "Bowler", 
        price: 10.5,
        points: 650,
        country: "Australia"
      },
      { 
        id: 5, 
        name: "Joe Root", 
        team: "England", 
        role: "Batsman", 
        price: 10.0,
        points: 720,
        country: "England"
      },
      { 
        id: 6, 
        name: "Kagiso Rabada", 
        team: "South Africa", 
        role: "Bowler", 
        price: 9.5,
        points: 680,
        country: "South Africa"
      }
    ]

    // Filter by role if provided
    let filteredPlayers = mockPlayers
    if (role) {
      filteredPlayers = mockPlayers.filter(p => p.role.toLowerCase() === role.toLowerCase())
    }

    // Filter by search if provided
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase()
      filteredPlayers = filteredPlayers.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.country.toLowerCase().includes(searchTerm) ||
        p.team.toLowerCase().includes(searchTerm)
      )
    }

    // Apply pagination
    const paginatedPlayers = filteredPlayers.slice(offset, offset + limit)
    const total = filteredPlayers.length

    return NextResponse.json({
      players: paginatedPlayers,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    })
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}