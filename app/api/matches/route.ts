import { NextResponse } from "next/server"
import entitySportAPI from "@/lib/entitysport"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "live"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log('Fetching matches from EntitySport API...')
    
    // Get matches from EntitySport
    const entitySportData = await entitySportAPI.getMatches(status)
    
    // Transform EntitySport data to our format
    const transformedMatches = entitySportData.matches.map((match: any) => ({
      id: match.match_id,
      team_a: match.teama?.name || 'Team A',
      team_b: match.teamb?.name || 'Team B',
      short_title: match.short_title || `${match.teama?.short_name} vs ${match.teamb?.short_name}`,
      venue: match.venue || 'TBA',
      match_date: match.date_start,
      match_type: match.format || 'Unknown',
      status: match.status === 1 ? 'live' : match.status === 2 ? 'upcoming' : 'completed',
      competition: match.competition?.title || 'Cricket Match'
    }))

    // Apply pagination
    const paginatedMatches = transformedMatches.slice(offset, offset + limit)
    const total = transformedMatches.length

    console.log(`✅ EntitySport API: Retrieved ${transformedMatches.length} matches`)

    return NextResponse.json({
      matches: paginatedMatches,
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
    console.error("Error fetching matches from EntitySport:", error)
    
    // Return fallback data in case of API failure
    const fallbackMatches = [
      {
        id: 'fallback_1',
        team_a: 'India',
        team_b: 'Australia', 
        venue: 'Melbourne Cricket Ground',
        match_date: new Date(Date.now() + 86400000).toISOString(),
        match_type: 'T20',
        status: 'upcoming',
        competition: 'T20 International'
      },
      {
        id: 'fallback_2',
        team_a: 'England',
        team_b: 'South Africa',
        venue: "Lord's Cricket Ground", 
        match_date: new Date(Date.now() + 172800000).toISOString(),
        match_type: 'ODI',
        status: 'upcoming',
        competition: 'ODI Series'
      }
    ]

    return NextResponse.json({
      matches: fallbackMatches,
      pagination: {
        total: 2,
        limit: 10,
        offset: 0,
        pages: 1,
        currentPage: 1,
      },
      source: 'Fallback data (EntitySport API unavailable)',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
