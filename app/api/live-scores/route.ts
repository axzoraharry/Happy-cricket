import { NextResponse } from "next/server"
import entitySportAPI from "@/lib/entitysport"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("matchId")

    if (!matchId) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 })
    }

    console.log(`Fetching live scores for match ${matchId} from EntitySport API...`)
    
    // Get live scores from EntitySport
    const liveData = await entitySportAPI.getLiveScores(matchId)
    
    if (!liveData) {
      return NextResponse.json({ error: "Match not found or no live data available" }, { status: 404 })
    }

    console.log(`✅ EntitySport API: Retrieved live scores for match ${matchId}`)

    return NextResponse.json({
      matchId,
      liveData,
      source: 'EntitySport API',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching live scores from EntitySport:", error)
    
    return NextResponse.json({
      matchId: searchParams.get("matchId"),
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'EntitySport API (failed)',
      fallback: {
        message: "Live scores temporarily unavailable",
        status: "Please check back later"
      }
    }, { status: 500 })
  }
}