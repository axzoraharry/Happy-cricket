"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal } from "lucide-react"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchLeaderboard = async () => {
      try {
        // Simulating API call with mock data
        setTimeout(() => {
          setLeaderboard([
            { id: 1, rank: 1, userName: "CricketMaster", teamName: "Super Kings", points: 1250, prize: 50000 },
            { id: 2, rank: 2, userName: "FantasyKing", teamName: "Royal Challengers", points: 1200, prize: 25000 },
            { id: 3, rank: 3, userName: "CricketFan123", teamName: "Mumbai Indians", points: 1150, prize: 10000 },
            { id: 4, rank: 4, userName: "BattingPro", teamName: "Delhi Capitals", points: 1100, prize: 5000 },
            { id: 5, rank: 5, userName: "BowlingWizard", teamName: "Rajasthan Royals", points: 1050, prize: 2500 },
            { id: 6, rank: 6, userName: "AllRounder", teamName: "Sunrisers", points: 1000, prize: 1000 },
            { id: 7, rank: 7, userName: "CricketLover", teamName: "Knight Riders", points: 950, prize: 500 },
            { id: 8, rank: 8, userName: "FantasyPro", teamName: "Punjab Kings", points: 900, prize: 250 },
            { id: 9, rank: 9, userName: "CricketExpert", teamName: "Chennai Super Kings", points: 850, prize: 100 },
            { id: 10, rank: 10, userName: "FantasyMaster", teamName: "Royal Challengers", points: 800, prize: 50 },
          ])
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other players</p>
        </div>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>Top players across all contests</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
                          <div className="h-3 w-16 bg-muted animate-pulse rounded-md"></div>
                        </div>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded-md"></div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="grid grid-cols-12 py-2 px-4 font-medium text-sm">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-3">User</div>
                    <div className="col-span-3">Team</div>
                    <div className="col-span-2 text-right">Points</div>
                    <div className="col-span-3 text-right">Prize</div>
                  </div>

                  {leaderboard.map((entry) => (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-12 py-3 px-4 items-center rounded-md ${
                        entry.rank <= 3 ? "bg-primary/5" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="col-span-1 flex items-center">
                        {entry.rank === 1 ? (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        ) : entry.rank === 2 ? (
                          <Medal className="h-5 w-5 text-gray-400" />
                        ) : entry.rank === 3 ? (
                          <Medal className="h-5 w-5 text-amber-700" />
                        ) : (
                          <span className="font-medium">{entry.rank}</span>
                        )}
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=32&width=32&query=${entry.userName}`} />
                          <AvatarFallback>{entry.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.userName}</span>
                      </div>
                      <div className="col-span-3">{entry.teamName}</div>
                      <div className="col-span-2 text-right font-bold">{entry.points}</div>
                      <div className="col-span-3 text-right font-medium">₹{entry.prize.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Friends Leaderboard</CardTitle>
              <CardDescription>See how you rank against your friends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">You haven't added any friends yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Leaderboards</CardTitle>
              <CardDescription>Leaderboards for specific tournaments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">Select a tournament to view its leaderboard</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
