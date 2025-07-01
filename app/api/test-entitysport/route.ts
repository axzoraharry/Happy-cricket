import { NextResponse } from "next/server"

export async function GET() {
  try {
    const token = process.env.ENTITYSPORT_API_TOKEN
    const baseURL = process.env.ENTITYSPORT_BASE_URL
    
    if (!token) {
      return NextResponse.json({
        status: 'error',
        message: 'EntitySport API token not configured',
        config: {
          token: 'Not set',
          baseURL: baseURL || 'Not set'
        }
      })
    }

    // Test a simple API call to competitions (usually less restrictive)
    const testURL = `${baseURL}/competitions?token=${token}`
    
    console.log('Testing EntitySport API connection...')
    
    const response = await fetch(testURL)
    const data = await response.json()
    
    return NextResponse.json({
      status: response.ok ? 'success' : 'error',
      httpStatus: response.status,
      config: {
        token: token ? `${token.substring(0, 8)}...${token.substring(token.length - 4)}` : 'Not set',
        baseURL: baseURL || 'Not set',
        testEndpoint: '/competitions'
      },
      apiResponse: data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      config: {
        token: process.env.ENTITYSPORT_API_TOKEN ? 'Set' : 'Not set',
        baseURL: process.env.ENTITYSPORT_BASE_URL || 'Not set'
      },
      timestamp: new Date().toISOString()
    })
  }
}