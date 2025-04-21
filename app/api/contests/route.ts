import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("matchId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = sql`
      SELECT c.*, 
             COUNT(ct.team_id) as joined_teams
      FROM contests c
      LEFT JOIN contest_teams ct ON c.id = ct.contest_id
    `

    if (matchId) {
      query = sql`
        ${query} 
        WHERE c.match_id = ${matchId}
      `
    }

    query = sql`
      ${query}
      GROUP BY c.id
      ORDER BY c.entry_fee ASC
      LIMIT ${limit} OFFSET ${offset}
    `

    const contests = await query

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) FROM contests
      ${matchId ? sql`WHERE match_id = ${matchId}` : sql``}
    `

    const total = Number.parseInt(countResult[0].count)

    return NextResponse.json({
      contests,
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
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { name, matchId, entryFee, maxTeams, totalPrize, isPrivate, description } = await request.json()

    // Validate input
    if (!name || !matchId || !maxTeams || !totalPrize) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create contest
    const result = await sql`
      INSERT INTO contests (
        name, match_id, entry_fee, max_teams, total_prize, 
        is_private, description, creator_id, current_entries
      )
      VALUES (
        ${name}, ${matchId}, ${entryFee || 0}, ${maxTeams}, ${totalPrize},
        ${isPrivate || false}, ${description || null}, ${userId}, 0
      )
      RETURNING *
    `

    return NextResponse.json(
      {
        contest: result[0],
        message: "Contest created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating contest:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
