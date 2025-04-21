import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get all teams for the user
    const teams = await sql`
      SELECT t.*, 
             COUNT(tp.player_id) as player_count
      FROM teams t
      LEFT JOIN team_players tp ON t.id = tp.team_id
      WHERE t.user_id = ${userId}
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `

    return NextResponse.json({ teams })
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { name, logo_url } = await request.json()

    // Validate input
    if (!name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    // Create team
    const result = await sql`
      INSERT INTO teams (user_id, name, logo_url, budget)
      VALUES (${userId}, ${name}, ${logo_url || null}, 10000)
      RETURNING *
    `

    return NextResponse.json(
      {
        team: result[0],
        message: "Team created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
