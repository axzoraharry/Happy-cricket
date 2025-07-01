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

  if (loading || !user) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}! Manage your teams and contests.</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/matches">Create New Team</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">
              {teams.length > 0 ? "+1 from last month" : "Create your first team"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contests Joined</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Winnings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,350</div>
            <p className="text-xs text-muted-foreground">+₹550 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#42</div>
            <p className="text-xs text-muted-foreground">Out of 10,000+ players</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teams" className="mt-8">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="teams">My Teams</TabsTrigger>
          <TabsTrigger value="contests">My Contests</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col gap-4">
                      <div className="h-6 w-32 bg-muted animate-pulse rounded-md"></div>
                      <div className="h-4 w-48 bg-muted animate-pulse rounded-md"></div>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>Rank #{team.rank}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Points</p>
                        <p className="text-xl font-bold">{team.totalPoints}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Players</p>
                        <p className="text-xl font-bold">11</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Captain</p>
                        <p className="text-xl font-bold">V. Kohli</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href={`/my-teams/${team.id}`}>View Team</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/my-teams/${team.id}/edit`}>Edit Team</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Teams Found</CardTitle>
                <CardDescription>You haven't created any teams yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create your first team to participate in contests and win exciting prizes.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/matches">Create Team</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contests" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col gap-4">
                      <div className="h-6 w-32 bg-muted animate-pulse rounded-md"></div>
                      <div className="h-4 w-48 bg-muted animate-pulse rounded-md"></div>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : contests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {contests.map((contest) => (
                <Card key={contest.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{contest.name}</CardTitle>
                        <CardDescription>Entry Fee: ₹{contest.entryFee}</CardDescription>
                      </div>
                      <Badge variant="outline" className="uppercase">
                        {contest.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Prize Pool</p>
                        <p className="text-xl font-bold">₹{contest.prizePool.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Teams Joined</p>
                        <p className="text-xl font-bold">
                          {contest.joinedTeams}/{contest.totalTeams}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Starts In</p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{new Date(contest.startTime).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href={`/contests/${contest.id}`}>View Contest</Link>
                    </Button>
                    <Button asChild>
                      <Link href={`/contests/${contest.id}/join`}>Join Contest</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Contests Joined</CardTitle>
                <CardDescription>You haven't joined any contests yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Join contests to compete with other players and win exciting prizes.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/contests">Browse Contests</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col gap-4">
                      <div className="h-6 w-32 bg-muted animate-pulse rounded-md"></div>
                      <div className="h-4 w-48 bg-muted animate-pulse rounded-md"></div>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingMatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {upcomingMatches.map((match) => (
                <Card key={match.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>
                        {match.teamA} vs {match.teamB}
                      </CardTitle>
                      <Badge variant="outline">{match.matchType}</Badge>
                    </div>
                    <CardDescription>{match.venue}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{match.matchDate.toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {match.matchDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Available Contests</p>
                        <p className="text-xl font-bold">12</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/matches/${match.id}/create-team`}>
                        Create Team
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Upcoming Matches</CardTitle>
                <CardDescription>There are no upcoming matches at the moment.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Check back later for upcoming matches and create your fantasy teams.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
