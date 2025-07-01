"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  BarChart3, 
  Calendar,
  Star,
  Zap,
  Eye,
  Users,
  Activity,
  Trophy,
  Lightbulb
} from "lucide-react"
import playerStatsAPI from "@/lib/player-stats"

interface PlayerStatsProps {
  playerId: string
  playerName: string
}

export function PlayerStats({ playerId, playerName }: PlayerStatsProps) {
  const [playerData, setPlayerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchPlayerStats()
  }, [playerId])

  const fetchPlayerStats = async () => {
    try {
      const stats = await playerStatsAPI.getPlayerStats(playerId, playerName)
      setPlayerData(stats)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching player stats:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!playerData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Player statistics not available</p>
        </CardContent>
      </Card>
    )
  }

  const getFormColor = (form: string) => {
    switch (form) {
      case 'Excellent': return 'text-green-600 bg-green-100'
      case 'Good': return 'text-blue-600 bg-blue-100'
      case 'Average': return 'text-yellow-600 bg-yellow-100'
      case 'Poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/player-${playerId}.jpg`} />
                  <AvatarFallback className="text-lg">
                    {playerName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="text-2xl font-bold">{playerName}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getFormColor(playerData.recentForm.rating)}>
                      <Activity className="h-3 w-3 mr-1" />
                      {playerData.recentForm.rating} Form
                    </Badge>
                    <Badge variant="outline">
                      <Star className="h-3 w-3 mr-1" />
                      {playerData.fantasyInsights.price} Credits
                    </Badge>
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {playerData.fantasyInsights.ownership}% Owned
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Fantasy Quick Stats */}
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {playerData.fantasyInsights.projectedPoints}
                </div>
                <p className="text-sm text-muted-foreground">Projected Points</p>
                <div className="flex items-center gap-1 mt-2">
                  {playerData.recentForm.trend === 'improving' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">{playerData.recentForm.trend}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Form</TabsTrigger>
          <TabsTrigger value="season">Season Stats</TabsTrigger>
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {playerData.seasonStats.runs}
                    </div>
                    <p className="text-sm text-muted-foreground">Runs This Season</p>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {playerData.seasonStats.average}
                    </div>
                    <p className="text-sm text-muted-foreground">Average</p>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {playerData.seasonStats.strikeRate}
                    </div>
                    <p className="text-sm text-muted-foreground">Strike Rate</p>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {playerData.recentForm.consistency}%
                    </div>
                    <p className="text-sm text-muted-foreground">Consistency</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                  <ul className="text-sm space-y-1">
                    {playerData.performanceAnalysis.strengths.slice(0, 2).map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Areas for Improvement</h4>
                  <ul className="text-sm space-y-1">
                    {playerData.performanceAnalysis.weaknesses.slice(0, 2).map((weakness: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pitch Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Pitch Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(playerData.performanceAnalysis.pitchAnalysis.batting).map(([pitch, score]: [string, any]) => (
                  <div key={pitch} className="text-center">
                    <div className="mb-2">
                      <Progress value={score} className="h-2" />
                    </div>
                    <p className="text-sm font-medium">{pitch}</p>
                    <p className="text-xs text-muted-foreground">{score}% effective</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Form Tab */}
        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Last 10 Matches Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {playerData.recentMatches.slice(0, 10).map((match: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-sm font-medium">{new Date(match.date).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">{match.format}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium">vs {match.opponent}</span>
                        <Badge variant="outline" className="text-xs">{match.venue}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">
                          {match.runs}{match.dismissed ? '' : '*'} ({match.balls})
                        </div>
                        <div className="text-xs text-muted-foreground">
                          SR: {match.strikeRate}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-primary">{match.fantasyPoints}</div>
                        <div className="text-xs text-muted-foreground">Fantasy Pts</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Season Stats Tab */}
        <TabsContent value="season" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Batting Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Batting Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Matches</p>
                    <p className="text-xl font-bold">{playerData.seasonStats.matches}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Innings</p>
                    <p className="text-xl font-bold">{playerData.seasonStats.innings}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Runs</p>
                    <p className="text-xl font-bold">{playerData.seasonStats.runs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-xl font-bold">{playerData.seasonStats.average}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Strike Rate</p>
                    <p className="text-xl font-bold">{playerData.seasonStats.strikeRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Highest Score</p>
                    <p className="text-xl font-bold">{playerData.seasonStats.highestScore}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Boundaries</span>
                    <span className="font-medium">
                      {playerData.seasonStats.fours} fours • {playerData.seasonStats.sixes} sixes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bowling Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Bowling Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Wickets</p>
                    <p className="text-xl font-bold">{playerData.seasonStats.wickets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Economy</p>
                    <p className="text-xl font-bold">{playerData.seasonStats.economy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-xl font-bold">{playerData.seasonStats.bowlingAverage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Best Figures</p>
                    <p className="text-xl font-bold">{playerData.seasonStats.bestFigures}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fantasy Tab */}
        <TabsContent value="fantasy" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Fantasy Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Fantasy Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Price</span>
                  <span className="font-bold">{playerData.fantasyInsights.price} Credits</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Ownership</span>
                  <span className="font-bold">{playerData.fantasyInsights.ownership}%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Projected Points</span>
                  <span className="font-bold text-primary">{playerData.fantasyInsights.projectedPoints}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Captain Potential</span>
                  <div className="flex items-center gap-2">
                    <Progress value={playerData.fantasyInsights.captainPotential} className="h-2 w-16" />
                    <span className="font-bold">{playerData.fantasyInsights.captainPotential}%</span>
                  </div>
                </div>

                {playerData.fantasyInsights.differentialPick && (
                  <Badge className="w-full justify-center" variant="default">
                    <Trophy className="h-3 w-3 mr-1" />
                    Differential Pick
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Fixtures */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Fixtures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {playerData.upcomingFixtures.map((fixture: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">vs {fixture.opponent}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(fixture.date).toLocaleDateString()} • {fixture.venue}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary">
                          {fixture.fantasyProjection} pts
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < fixture.difficulty ? 'bg-red-400' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Career Tab */}
        <TabsContent value="career" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Career Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Batting Career</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Matches</span>
                      <span className="font-medium">{playerData.careerStats.totalMatches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Runs</span>
                      <span className="font-medium">{playerData.careerStats.totalRuns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average</span>
                      <span className="font-medium">{playerData.careerStats.average}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Strike Rate</span>
                      <span className="font-medium">{playerData.careerStats.strikeRate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Milestones</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Centuries</span>
                      <span className="font-medium">{playerData.careerStats.centuries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Half-Centuries</span>
                      <span className="font-medium">{playerData.careerStats.halfCenturies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Highest Score</span>
                      <span className="font-medium">{playerData.careerStats.highestScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sixes</span>
                      <span className="font-medium">{playerData.careerStats.totalSixes}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Bowling Career</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wickets</span>
                      <span className="font-medium">{playerData.careerStats.totalWickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average</span>
                      <span className="font-medium">{playerData.careerStats.bowlingAverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Economy</span>
                      <span className="font-medium">{playerData.careerStats.economyRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best Bowling</span>
                      <span className="font-medium">{playerData.careerStats.bestBowling}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}