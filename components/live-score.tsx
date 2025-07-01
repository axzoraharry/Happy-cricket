"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  PlayCircle, 
  PauseCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  Zap,
  Users,
  MessageCircle,
  Radio
} from "lucide-react"
import liveScoreAPI from "@/lib/live-score"

interface LiveScoreProps {
  matchId: string
}

export function LiveScore({ matchId }: LiveScoreProps) {
  const [liveData, setLiveData] = useState<any>(null)
  const [isLive, setIsLive] = useState(false)
  const [commentary, setCommentary] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLiveScore()
    
    // Set up real-time updates
    const cleanup = liveScoreAPI.simulateRealTimeUpdates((update) => {
      if (isLive) {
        setCommentary(prev => [update.commentary, ...prev.slice(0, 9)]) // Keep last 10
        
        // Update live data with new ball
        setLiveData((prev: any) => ({
          ...prev,
          teams: {
            ...prev.teams,
            batting: {
              ...prev.teams.batting,
              score: prev.teams.batting.score + update.runs,
              overs: update.over
            }
          }
        }))
      }
    })

    return cleanup
  }, [matchId, isLive])

  const fetchLiveScore = async () => {
    try {
      const data = await liveScoreAPI.getLiveScore(matchId)
      setLiveData(data)
      setCommentary(data.commentary || [])
      setIsLive(data.status === 'live')
      setLoading(false)
    } catch (error) {
      console.error('Error fetching live score:', error)
      setLoading(false)
    }
  }

  const toggleLiveUpdates = () => {
    setIsLive(!isLive)
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!liveData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No live data available</p>
        </CardContent>
      </Card>
    )
  }

  const battingTeam = liveData.teams.batting
  const bowlingTeam = liveData.teams.bowling
  const progressPercentage = liveData.target 
    ? (battingTeam.score / liveData.target) * 100 
    : (parseInt(battingTeam.overs) / 20) * 100

  return (
    <div className="space-y-6">
      {/* Live Status Header */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <Badge variant="destructive" className="animate-pulse">
                  <Radio className="h-3 w-3 mr-1" />
                  LIVE
                </Badge>
              </div>
              <h3 className="font-semibold">{battingTeam.name} vs {bowlingTeam.name}</h3>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleLiveUpdates}
              className={isLive ? "bg-green-100 border-green-300" : ""}
            >
              {isLive ? <PauseCircle className="h-4 w-4 mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
              {isLive ? "Pause" : "Resume"} Updates
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Score Display */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Batting Team */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  🏏 {battingTeam.name}
                  <Badge variant="default">Batting</Badge>
                </h4>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {battingTeam.score}/{battingTeam.wickets}
                  </span>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{battingTeam.overs} overs</div>
                    <div className="text-sm text-muted-foreground">
                      Run Rate: {battingTeam.runRate}
                    </div>
                  </div>
                </div>
                
                {liveData.target && (
                  <div className="space-y-2">
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Target: {liveData.target}</span>
                      <span className="text-primary font-medium">
                        Need: {liveData.target - battingTeam.score} runs
                      </span>
                    </div>
                    {liveData.requiredRate && (
                      <div className="text-sm text-muted-foreground">
                        Required Rate: {liveData.requiredRate}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Current Batsmen */}
              <div className="space-y-3">
                <h5 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Current Batsmen
                </h5>
                {battingTeam.batsmen?.map((batsman: any, index: number) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{batsman.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {batsman.runs} ({batsman.balls}) - SR: {batsman.strikeRate}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div>{batsman.fours} fours • {batsman.sixes} sixes</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bowling Team */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  ⚾ {bowlingTeam.name}
                  <Badge variant="secondary">Bowling</Badge>
                </h4>
              </div>

              {/* Current Bowler */}
              <div className="space-y-3">
                <h5 className="font-medium">Current Bowler</h5>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{bowlingTeam.bowler.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {bowlingTeam.bowler.overs} overs
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {bowlingTeam.bowler.wickets}/{bowlingTeam.bowler.runs}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Econ: {bowlingTeam.bowler.economy}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Balls */}
              <div className="space-y-3">
                <h5 className="font-medium">Recent Balls</h5>
                <div className="flex gap-2 flex-wrap">
                  {liveData.lastBalls?.map((ball: any, index: number) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        ball.type === 'four' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                        ball.type === 'six' ? 'bg-purple-100 text-purple-800 border-2 border-purple-300' :
                        ball.type === 'dot' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ball.runs}
                    </div>
                  ))}
                </div>
              </div>

              {/* Match State */}
              {liveData.matchState && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    <Target className="h-4 w-4 inline mr-2" />
                    {liveData.matchState}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Commentary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Live Commentary
            {isLive && (
              <Badge variant="outline" className="animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Auto-updating
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {commentary.map((comment, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  index === 0 && isLive ? 'bg-primary/10 border border-primary/20 animate-pulse' : 'bg-muted/50'
                }`}
              >
                <p className="text-sm">
                  <span className="text-muted-foreground mr-2">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {comment}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}