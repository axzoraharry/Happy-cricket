"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  Eye, 
  Star,
  Trophy,
  Users,
  CloudRain,
  Thermometer,
  Wind,
  BarChart3,
  Lightbulb,
  AlertTriangle
} from "lucide-react"
import cricketAI from "@/lib/cricket-ai"

interface AIPredictionsProps {
  matchData: any
  liveData?: any
}

export function AIPredictions({ matchData, liveData }: AIPredictionsProps) {
  const [predictions, setPredictions] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("match")

  useEffect(() => {
    generatePredictions()
  }, [matchData])

  const generatePredictions = async () => {
    try {
      const matchPredictions = cricketAI.generateMatchPredictions(matchData)
      setPredictions(matchPredictions)
      setLoading(false)
    } catch (error) {
      console.error('Error generating predictions:', error)
      setLoading(false)
    }
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

  if (!predictions) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">AI predictions not available</p>
        </CardContent>
      </Card>
    )
  }

  const teamA = matchData.team_a || 'Team A'
  const teamB = matchData.team_b || 'Team B'
  const teamAWin = predictions.winProbability[teamA]
  const teamBWin = 100 - teamAWin - predictions.winProbability.tie

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Cricket Intelligence</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Powered by advanced machine learning • {predictions.confidence}% confidence
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant="secondary" className="mb-2">
                <Eye className="h-3 w-3 mr-1" />
                Live Analysis
              </Badge>
              <p className="text-xs text-muted-foreground">
                Updated {new Date(predictions.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Prediction Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="match">Match</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Match Predictions */}
        <TabsContent value="match" className="space-y-6">
          {/* Win Probability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Win Probability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{teamA}</span>
                    {teamAWin > teamBWin && <Trophy className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <span className="text-2xl font-bold text-primary">{teamAWin}%</span>
                </div>
                <Progress value={teamAWin} className="h-3" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{teamB}</span>
                    {teamBWin > teamAWin && <Trophy className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <span className="text-2xl font-bold text-primary">{teamBWin}%</span>
                </div>
                <Progress value={teamBWin} className="h-3" />
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Tie/No Result</span>
                  <span className="text-lg font-medium">{predictions.winProbability.tie}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Predictions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{teamA} Score Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {predictions.scorePredictions[teamA].predictedScore}
                  </div>
                  <p className="text-sm text-muted-foreground">Predicted Score</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Range:</span>
                    <span>{predictions.scorePredictions[teamA].range.min} - {predictions.scorePredictions[teamA].range.max}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Confidence:</span>
                    <span>{predictions.scorePredictions[teamA].confidence}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{teamB} Score Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {predictions.scorePredictions[teamB].predictedScore}
                  </div>
                  <p className="text-sm text-muted-foreground">Predicted Score</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Range:</span>
                    <span>{predictions.scorePredictions[teamB].range.min} - {predictions.scorePredictions[teamB].range.max}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Confidence:</span>
                    <span>{predictions.scorePredictions[teamB].confidence}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Match Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Key Match Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{predictions.keyPredictions.totalRuns}</div>
                  <p className="text-sm text-muted-foreground">Total Runs</p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{predictions.keyPredictions.totalWickets}</div>
                  <p className="text-sm text-muted-foreground">Total Wickets</p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{predictions.keyPredictions.totalSixes}</div>
                  <p className="text-sm text-muted-foreground">Total Sixes</p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{predictions.keyPredictions.powerplayScore}</div>
                  <p className="text-sm text-muted-foreground">Powerplay Runs</p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{predictions.keyPredictions.deathOverScore}</div>
                  <p className="text-sm text-muted-foreground">Death Over Runs</p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{predictions.keyPredictions.totalFours}</div>
                  <p className="text-sm text-muted-foreground">Total Fours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Player Predictions */}
        <TabsContent value="players" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Top Scorer</h4>
                    <Badge variant="default">{predictions.topPerformers.topScorer.confidence}% confident</Badge>
                  </div>
                  <p className="font-semibold text-lg">{predictions.topPerformers.topScorer.player}</p>
                  <p className="text-2xl font-bold text-primary">{predictions.topPerformers.topScorer.predictedRuns} runs</p>
                  <p className="text-sm text-muted-foreground mt-2">{predictions.topPerformers.topScorer.reasoning}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Top Wicket Taker</h4>
                    <Badge variant="default">{predictions.topPerformers.topWicketTaker.confidence}% confident</Badge>
                  </div>
                  <p className="font-semibold text-lg">{predictions.topPerformers.topWicketTaker.player}</p>
                  <p className="text-2xl font-bold text-primary">{predictions.topPerformers.topWicketTaker.predictedWickets} wickets</p>
                  <p className="text-sm text-muted-foreground mt-2">{predictions.topPerformers.topWicketTaker.reasoning}</p>
                </div>
              </CardContent>
            </Card>

            {/* Player of the Match */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Player of the Match
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg border border-yellow-200">
                  <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <p className="font-bold text-xl">{predictions.topPerformers.playerOfMatch.player}</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{predictions.topPerformers.playerOfMatch.probability}%</p>
                  <p className="text-sm text-muted-foreground mt-2">{predictions.topPerformers.playerOfMatch.reasoning}</p>
                </div>

                {/* Captain Picks */}
                <div>
                  <h4 className="font-medium mb-3">Fantasy Captain Picks</h4>
                  <div className="space-y-2">
                    {predictions.topPerformers.captainPicks.map((pick: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{pick.player}</p>
                          <p className="text-xs text-muted-foreground">{pick.reasoning}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{pick.score}</div>
                          <p className="text-xs text-muted-foreground">AI Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conditions Tab */}
        <TabsContent value="conditions" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weather Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudRain className="h-5 w-5" />
                  Weather Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <span>{predictions.weatherImpact.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    <span>{predictions.weatherImpact.windSpeed} km/h</span>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">{predictions.weatherImpact.condition}</p>
                  <p className="text-sm text-muted-foreground">Humidity: {predictions.weatherImpact.humidity}%</p>
                  {predictions.weatherImpact.dewFactor && (
                    <Badge variant="outline" className="mt-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Dew Factor Expected
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Batting:</span>
                    <Badge variant={
                      predictions.weatherImpact.impact.batting === 'Favorable' ? 'default' : 'secondary'
                    }>
                      {predictions.weatherImpact.impact.batting}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Bowling:</span>
                    <Badge variant={
                      predictions.weatherImpact.impact.bowling === 'Favorable' ? 'default' : 'secondary'
                    }>
                      {predictions.weatherImpact.impact.bowling}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Fielding:</span>
                    <Badge variant={
                      predictions.weatherImpact.impact.fielding === 'Good' ? 'default' : 'secondary'
                    }>
                      {predictions.weatherImpact.impact.fielding}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {predictions.weatherImpact.recommendation}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pitch Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Pitch Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{predictions.pitchAnalysis.type}</p>
                  <p className="text-sm text-muted-foreground">Pitch Type</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Pace Support</span>
                      <span className="text-sm font-medium">{predictions.pitchAnalysis.paceSupport}%</span>
                    </div>
                    <Progress value={predictions.pitchAnalysis.paceSupport} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Spin Support</span>
                      <span className="text-sm font-medium">{predictions.pitchAnalysis.spinSupport}%</span>
                    </div>
                    <Progress value={predictions.pitchAnalysis.spinSupport} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Chase Success Rate</span>
                      <span className="text-sm font-medium">{predictions.pitchAnalysis.chaseSuccess}%</span>
                    </div>
                    <Progress value={predictions.pitchAnalysis.chaseSuccess} className="h-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <p className="text-lg font-bold">{predictions.pitchAnalysis.averageScore}</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <p className="text-lg font-bold">{predictions.pitchAnalysis.bounceRating}/10</p>
                    <p className="text-xs text-muted-foreground">Bounce</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fantasy Tab */}
        <TabsContent value="fantasy" className="space-y-6">
          {predictions.fantasyRecommendations && (
            <>
              {/* Captain Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Captain Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictions.fantasyRecommendations.captainSuggestions.map((suggestion: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{suggestion.player}</p>
                          <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{suggestion.probability}%</div>
                          <p className="text-xs text-muted-foreground">Success Rate</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Team Composition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Optimal Team Composition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {predictions.fantasyRecommendations.teamComposition.batsmen.recommendation}
                      </p>
                      <p className="text-sm text-muted-foreground">Batsmen</p>
                      <p className="text-xs text-muted-foreground">
                        ({predictions.fantasyRecommendations.teamComposition.batsmen.min}-{predictions.fantasyRecommendations.teamComposition.batsmen.max})
                      </p>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {predictions.fantasyRecommendations.teamComposition.bowlers.recommendation}
                      </p>
                      <p className="text-sm text-muted-foreground">Bowlers</p>
                      <p className="text-xs text-muted-foreground">
                        ({predictions.fantasyRecommendations.teamComposition.bowlers.min}-{predictions.fantasyRecommendations.teamComposition.bowlers.max})
                      </p>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {predictions.fantasyRecommendations.teamComposition.allRounders.recommendation}
                      </p>
                      <p className="text-sm text-muted-foreground">All-Rounders</p>
                      <p className="text-xs text-muted-foreground">
                        ({predictions.fantasyRecommendations.teamComposition.allRounders.min}-{predictions.fantasyRecommendations.teamComposition.allRounders.max})
                      </p>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {predictions.fantasyRecommendations.teamComposition.wicketKeepers.recommendation}
                      </p>
                      <p className="text-sm text-muted-foreground">Keepers</p>
                      <p className="text-xs text-muted-foreground">
                        ({predictions.fantasyRecommendations.teamComposition.wicketKeepers.min}-{predictions.fantasyRecommendations.teamComposition.wicketKeepers.max})
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Strategic Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictions.fantasyRecommendations.budgetTips.map((tip: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <p className="text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Match Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions.insights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}