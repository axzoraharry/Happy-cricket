"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Trophy, Users, TrendingUp, Star, Clock, Zap, DollarSign } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [dashboardData, setDashboardData] = useState({
    matches: [],
    teams: [],
    contests: [],
    leaderboard: [],
    userStats: {
      totalPoints: 0,
      rank: 0,
      teamsCreated: 0,
      contestsJoined: 0,
      totalWinnings: 0
    }
  })
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch all dashboard data in parallel
      const [matchesRes, teamsRes, contestsRes, leaderboardRes] = await Promise.all([
        fetch('/api/matches'),
        fetch('/api/teams'),
        fetch('/api/contests'),
        fetch('/api/leaderboard')
      ])

      const [matchesData, teamsData, contestsData, leaderboardData] = await Promise.all([
        matchesRes.json(),
        teamsRes.json(),
        contestsRes.json(),
        leaderboardRes.json()
      ])

      // Generate user stats
      const userStats = {
        totalPoints: 1547,
        rank: 42,
        teamsCreated: teamsData.teams?.length || 0,
        contestsJoined: 8,
        totalWinnings: 2500
      }

      setDashboardData({
        matches: matchesData.matches || [],
        teams: teamsData.teams || [],
        contests: contestsData.contests || [],
        leaderboard: leaderboardData.leaderboard || [],
        userStats
      })
      
      setDataLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setDataLoading(false)
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-lg">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Champion'}!</h1>
              <p className="text-muted-foreground">Ready to create your winning team?</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{dashboardData.userStats.totalPoints}</div>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">#{dashboardData.userStats.rank}</div>
                <p className="text-sm text-muted-foreground">Rank</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{dashboardData.userStats.teamsCreated}</div>
                <p className="text-sm text-muted-foreground">Teams</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{dashboardData.userStats.contestsJoined}</div>
                <p className="text-sm text-muted-foreground">Contests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">₹{dashboardData.userStats.totalWinnings}</div>
                <p className="text-sm text-muted-foreground">Winnings</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="matches">Upcoming Matches</TabsTrigger>
            <TabsTrigger value="teams">My Teams</TabsTrigger>
            <TabsTrigger value="contests">My Contests</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Upcoming Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Upcoming Matches</h2>
              <Button asChild>
                <Link href="/matches">View All</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.matches.slice(0, 6).map((match) => (
                <Card key={match.id} className="hover:shadow-lg transition-all group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="outline">{match.match_type}</Badge>
                      <Badge variant="secondary" className="text-xs">
                        {formatDistanceToNow(new Date(match.match_date), { addSuffix: true })}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-2">
                          <span className="text-sm font-semibold">{match.team_a.substring(0, 3).toUpperCase()}</span>
                        </div>
                        <p className="text-sm font-medium">{match.team_a}</p>
                      </div>

                      <div className="text-center">
                        <span className="text-xl font-bold text-primary">VS</span>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-2">
                          <span className="text-sm font-semibold">{match.team_b.substring(0, 3).toUpperCase()}</span>
                        </div>
                        <p className="text-sm font-medium">{match.team_b}</p>
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground mb-1">📍 {match.venue}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(match.match_date).toLocaleDateString()} • {new Date(match.match_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/matches/${match.id}/create-team`}>
                        Create Team
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Teams</h2>
              <Button asChild>
                <Link href="/matches">Create New Team</Link>
              </Button>
            </div>

            {dashboardData.teams.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.teams.map((team) => (
                  <Card key={team.id} className="hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription>Points: {team.total_points}</CardDescription>
                        </div>
                        <Badge variant={team.rank <= 3 ? "default" : "secondary"}>
                          Rank #{team.rank}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Players:</span>
                          <span>{team.player_count}/11</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Budget Used:</span>
                          <span>₹{(10000 - team.budget).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Created:</span>
                          <span>{new Date(team.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        View Team
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first fantasy cricket team</p>
                  <Button asChild>
                    <Link href="/matches">Create Team</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Contests Tab */}
          <TabsContent value="contests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Contests</h2>
              <Button asChild>
                <Link href="/contests">Browse Contests</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.contests.slice(0, 6).map((contest) => (
                <Card key={contest.id} className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{contest.name}</CardTitle>
                      <Badge variant={contest.status === 'live' ? 'default' : 'secondary'}>
                        {contest.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">₹{contest.total_prize.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{contest.joined_teams}/{contest.max_teams}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Entry Fee:</span>
                      <span>₹{contest.entry_fee}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Starts:</span>
                      <span>{formatDistanceToNow(new Date(contest.start_time), { addSuffix: true })}</span>
                    </div>

                    <Button className="w-full" variant="outline">
                      View Contest
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Leaderboard</h2>
              <Badge variant="outline">This Week</Badge>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {dashboardData.leaderboard.slice(0, 10).map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className={`flex items-center justify-between p-4 border-b last:border-b-0 ${
                        entry.user_name === user?.name ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {entry.rank}
                        </div>
                        
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`/user-${entry.user_id}.jpg`} />
                          <AvatarFallback>
                            {entry.user_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <p className="font-semibold">{entry.user_name}</p>
                          <p className="text-sm text-muted-foreground">{entry.team_name}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{entry.points} pts</p>
                        {entry.prize_won > 0 && (
                          <p className="text-sm text-green-600">₹{entry.prize_won}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
