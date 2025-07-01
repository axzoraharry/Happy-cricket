"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Clock,
  Database,
  Zap
} from "lucide-react"

export default function StatusPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/cricket-status')
      const data = await response.json()
      setStatus(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching status:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container max-w-4xl">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Checking system status...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Cricket Fantasy League - System Status</h1>
          <p className="text-muted-foreground">
            Last updated: {status?.timestamp ? new Date(status.timestamp).toLocaleString() : 'Unknown'}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStatus}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>

        {/* EntitySport API Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              EntitySport API Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Connection Status:</span>
              <Badge variant={
                status?.entitySport?.status === 'Connected' ? 'default' : 
                status?.entitySport?.status === 'API Error' ? 'destructive' : 'secondary'
              }>
                {status?.entitySport?.status === 'Connected' && <CheckCircle className="h-3 w-3 mr-1" />}
                {status?.entitySport?.status === 'API Error' && <XCircle className="h-3 w-3 mr-1" />}
                {status?.entitySport?.status !== 'Connected' && status?.entitySport?.status !== 'API Error' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {status?.entitySport?.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>API Token:</span>
              <span className="font-mono text-sm">{status?.entitySport?.token}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Base URL:</span>
              <span className="text-sm">{status?.entitySport?.baseURL}</span>
            </div>

            {status?.entitySport?.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>API Error:</strong> {status.entitySport.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Data Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Primary Source:</span>
              <span>{status?.dataStrategy?.primary}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Fallback Source:</span>
              <span>{status?.dataStrategy?.fallback}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Current Source:</span>
              <Badge variant={status?.dataStrategy?.currentSource?.includes('EntitySport') ? 'default' : 'secondary'}>
                {status?.dataStrategy?.currentSource}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Internal APIs Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Internal APIs Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {status?.internalAPIs?.map((api: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {api.status === 'Working' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">{api.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {api.dataSource && (
                      <Badge variant="outline" className="text-xs">
                        {api.dataSource}
                      </Badge>
                    )}
                    {api.recordCount !== undefined && (
                      <span className="text-sm text-muted-foreground">
                        {api.recordCount} records
                      </span>
                    )}
                    <Badge variant={api.status === 'Working' ? 'default' : 'destructive'}>
                      {api.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {status?.recommendations && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Current Situation & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {status.recommendations.map((rec: string, index: number) => (
                  <Alert key={index} variant={index === 0 ? "destructive" : "default"}>
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* What's Working */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">
              ✅ What's Currently Working
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-700 dark:text-green-300">
            <ul className="space-y-2">
              <li>• <strong>8 Upcoming Cricket Matches</strong> - Including IPL 2025 and International games</li>
              <li>• <strong>Realistic Cricket Schedule</strong> - Chennai vs Mumbai, India vs Australia, etc.</li>
              <li>• <strong>All Fantasy Features</strong> - Team building, player selection, contests</li>
              <li>• <strong>Player Statistics</strong> - Comprehensive player data and analytics</li>
              <li>• <strong>AI Predictions</strong> - Match forecasts and strategic insights</li>
              <li>• <strong>Live Scoring System</strong> - Ready for live matches when available</li>
            </ul>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <a href="/matches">View Upcoming Matches</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">Go to Dashboard</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>
    </div>
  )
}