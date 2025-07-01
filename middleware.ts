import { NextResponse } from "next/server"

export function middleware(request: Request) {
  // Add any middleware logic here if needed
  return NextResponse.next()
}