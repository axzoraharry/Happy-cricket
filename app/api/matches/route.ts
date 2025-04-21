import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "upcoming"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = sql`
      SELECT * FROM matches
      WHERE status = ${status}
    `

    if (status === "upcoming") {
      query = sql`
        ${query} AND match_date > NOW()
        ORDER BY match_date ASC
      `
    } else if (status === "live") {
      query = sql`
        ${query}
        ORDER BY match_date ASC
      `
    } else if (status === "completed") {
      query = sql`
        ${query}
        ORDER BY match_date DESC
      `
    }

    query = sql`
      ${query}
      LIMIT ${limit} OFFSET ${offset}
    `

    const matches = await query

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) FROM matches
      WHERE status = ${status}
      ${status === "upcoming" ? sql`AND match_date > NOW()` : sql``}
    `

    const total = Number.parseInt(countResult[0].count)

    return NextResponse.json({
      matches,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    })
  } catch (error) {
    console.error("Error fetching matches:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
