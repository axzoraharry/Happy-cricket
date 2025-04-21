import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tournamentId = searchParams.get("tournamentId")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!tournamentId) {
      return NextResponse.json({ error: "Tournament ID is required" }, { status: 400 })
    }

    const leaderboard = await sql`
      SELECT l.*, u.name as user_name, t.name as team_name
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      JOIN teams t ON l.team_id = t.id
      WHERE l.tournament_id = ${tournamentId}
      ORDER BY l.points DESC, l.rank ASC
      LIMIT ${limit} OFFSET ${offset}
    `

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
