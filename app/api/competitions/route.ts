import { NextResponse } from "next/server"
import entitySportAPI from "@/lib/entitysport"

export async function GET(request: Request) {
  try {
    console.log('Fetching competitions from EntitySport API...')
    
    // Get competitions from EntitySport
    const competitions = await entitySportAPI.getCompetitions()

    console.log(`✅ EntitySport API: Retrieved ${competitions.length} competitions`)

    return NextResponse.json({
      competitions,
      total: competitions.length,
      source: 'EntitySport API',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching competitions from EntitySport:", error)
    
    // Return fallback data
    const fallbackCompetitions = [
      {
        cid: 'fallback_1',
        title: 'T20 International',
        abbr: 'T20I',
        type: 'International',
        category: 'T20'
      },
      {
        cid: 'fallback_2', 
        title: 'ODI Series',
        abbr: 'ODI',
        type: 'International',
        category: 'ODI'
      },
      {
        cid: 'fallback_3',
        title: 'Test Series',
        abbr: 'Test',
        type: 'International', 
        category: 'Test'
      }
    ]

    return NextResponse.json({
      competitions: fallbackCompetitions,
      total: fallbackCompetitions.length,
      source: 'Fallback data (EntitySport API unavailable)',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}