import { NextResponse } from "next/server"
import entitySportAPI from "@/lib/entitysport"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const matchId = params.id

    console.log(`Fetching match details for ${matchId} from EntitySport API...`)
    
    // Get match details from EntitySport
    const matchDetails = await entitySportAPI.getMatchDetails(matchId)
    
    if (!matchDetails) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    console.log(`✅ EntitySport API: Retrieved details for match ${matchId}`)

    return NextResponse.json({
      match: matchDetails,
      source: 'EntitySport API',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error(`Error fetching match ${params.id} details from EntitySport:`, error)
    
    return NextResponse.json({
      matchId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'EntitySport API (failed)',
      fallback: {
        message: "Match details temporarily unavailable",
        status: "Please check back later"
      }
    }, { status: 500 })
  }
}