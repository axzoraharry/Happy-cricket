import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = sql`
      SELECT * FROM players
      WHERE 1=1
    `

    if (role) {
      query = sql`
        ${query} AND role = ${role}
      `
    }

    if (search) {
      query = sql`
        ${query} AND (name ILIKE ${"%" + search + "%"} OR country ILIKE ${"%" + search + "%"})
      `
    }

    query = sql`
      ${query}
      ORDER BY price DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const players = await query

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) FROM players
      WHERE 1=1
      ${role ? sql`AND role = ${role}` : sql``}
      ${search ? sql`AND (name ILIKE ${"%" + search + "%"} OR country ILIKE ${"%" + search + "%"})` : sql``}
    `

    const total = Number.parseInt(countResult[0].count)

    return NextResponse.json({
      players,
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
