import { NextResponse } from "next/server"
import entitySportAPI from "@/lib/entitysport"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log('Fetching players from EntitySport API...')
    
    // Get players from EntitySport
    const entitySportPlayers = await entitySportAPI.getPlayers()
    
    // Transform EntitySport data to our format
    const transformedPlayers = entitySportPlayers.map((player: any) => ({
      id: player.pid,
      name: player.title,
      short_name: player.short_name,
      team: player.nationality || 'Unknown',
      role: player.playing_role || 'Unknown',
      country: player.nationality || 'Unknown',
      price: Math.random() * 15 + 5, // Random price between 5-20 for fantasy purposes
      points: Math.floor(Math.random() * 1000) + 500 // Random points for fantasy
    }))

    // Filter by role if provided
    let filteredPlayers = transformedPlayers
    if (role) {
      filteredPlayers = transformedPlayers.filter((p: any) => 
        p.role.toLowerCase().includes(role.toLowerCase())
      )
    }

    // Filter by search if provided
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase()
      filteredPlayers = filteredPlayers.filter((p: any) => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.country.toLowerCase().includes(searchTerm) ||
        p.team.toLowerCase().includes(searchTerm)
      )
    }

    // Apply pagination
    const paginatedPlayers = filteredPlayers.slice(offset, offset + limit)
    const total = filteredPlayers.length

    console.log(`✅ EntitySport API: Retrieved ${transformedPlayers.length} players, filtered to ${total}`)

    return NextResponse.json({
      players: paginatedPlayers,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
      source: 'EntitySport API'
    })
  } catch (error) {
    console.error("Error fetching players from EntitySport:", error)
    
    // Return fallback data in case of API failure
    const fallbackPlayers = [
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
      }
    ]

    // Apply same filtering logic to fallback data
    let filteredFallback = fallbackPlayers
    if (role) {
      filteredFallback = fallbackPlayers.filter(p => p.role.toLowerCase().includes(role.toLowerCase()))
    }
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase()
      filteredFallback = filteredFallback.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.country.toLowerCase().includes(searchTerm) ||
        p.team.toLowerCase().includes(searchTerm)
      )
    }

    const paginatedFallback = filteredFallback.slice(offset, offset + limit)

    return NextResponse.json({
      players: paginatedFallback,
      pagination: {
        total: filteredFallback.length,
        limit,
        offset,
        pages: Math.ceil(filteredFallback.length / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
      source: 'Fallback data (EntitySport API unavailable)',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}