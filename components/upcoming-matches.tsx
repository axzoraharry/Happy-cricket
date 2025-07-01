"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Trophy, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function UpcomingMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches')
        const data = await response.json()
        
        // Transform the data to include team logos and additional info
        const transformedMatches = data.matches.map((match: any) => ({
          id: match.id,
          teamA: match.team_a,
          teamB: match.team_b,
          venue: match.venue,
          matchDate: new Date(match.match_date),
          matchType: match.match_type,
          status: match.status,
          competition: match.competition,
          short_title: match.short_title,
          teamALogo: `/${match.team_a.toLowerCase().replace(' ', '-')}-logo.png`,
          teamBLogo: `/${match.team_b.toLowerCase().replace(' ', '-')}-logo.png`,
          // Add fantasy-specific data
          contestsAvailable: Math.floor(Math.random() * 20) + 5,
          totalPrizePool: (Math.floor(Math.random() * 500) + 100) * 1000,
          entryFee: Math.floor(Math.random() * 50) + 10
        }))
        
        setMatches(transformedMatches)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching matches:", error)
        // Fallback to mock data if API fails
        setMatches([
          {
            id: 1,
            teamA: "India",
            teamB: "Australia",
            venue: "Melbourne Cricket Ground",
            matchDate: new Date(Date.now() + 86400000),
            matchType: "T20",
            status: "upcoming",
            competition: "T20 International",
            teamALogo: "/india-logo.png",
            teamBLogo: "/australia-logo.png",
            contestsAvailable: 15,
            totalPrizePool: 250000,
            entryFee: 25
          },
          {
            id: 2,
            teamA: "England", 
            teamB: "South Africa",
            venue: "Lord's Cricket Ground",
            matchDate: new Date(Date.now() + 172800000),
            matchType: "ODI",
            status: "upcoming",
            competition: "ODI Series",
            teamALogo: "/england-logo.png",
            teamBLogo: "/south-africa-logo.png",
            contestsAvailable: 12,
            totalPrizePool: 180000,
            entryFee: 20
          }
        ])
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Upcoming Matches</h2>
            <p className="text-muted-foreground mt-2">Create your fantasy teams for these upcoming cricket matches</p>
          </div>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/matches">View All Matches</Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col gap-4 items-center justify-center h-[280px]">
                    <div className="h-8 w-32 bg-muted animate-pulse rounded-md"></div>
                    <div className="h-6 w-48 bg-muted animate-pulse rounded-md"></div>
                    <div className="h-6 w-24 bg-muted animate-pulse rounded-md"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <Link href={`/matches/${match.id}/create-team`} key={match.id}>
                <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] group">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {match.matchType}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {formatDistanceToNow(match.matchDate, { addSuffix: true })}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col items-center text-center w-2/5">
                          <div className="relative h-16 w-16 mb-3 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20">
                            <Image
                              src={match.teamALogo || "/placeholder.svg"}
                              alt={match.teamA}
                              fill
                              className="object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                          </div>
                          <h3 className="font-semibold text-sm">{match.teamA}</h3>
                        </div>

                        <div className="flex flex-col items-center justify-center w-1/5">
                          <span className="text-xl font-bold text-primary">VS</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {match.status === 'live' ? '🔴 LIVE' : 'UPCOMING'}
                          </span>
                        </div>

                        <div className="flex flex-col items-center text-center w-2/5">
                          <div className="relative h-16 w-16 mb-3 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20">
                            <Image
                              src={match.teamBLogo || "/placeholder.svg"}
                              alt={match.teamB}
                              fill
                              className="object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                          </div>
                          <h3 className="font-semibold text-sm">{match.teamB}</h3>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>{match.matchDate.toLocaleDateString()}</span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{match.matchDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate" title={match.venue}>
                          📍 {match.venue}
                        </p>
                        {match.competition && (
                          <p className="text-xs text-primary/80">🏆 {match.competition}</p>
                        )}
                      </div>

                      {/* Fantasy Stats */}
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{match.contestsAvailable} Contests</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-600 font-medium">₹{(match.totalPrizePool / 1000)}K</span>
                          </div>
                        </div>
                        <div className="text-xs text-center text-muted-foreground">
                          Entry from ₹{match.entryFee}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-center group-hover:from-primary/90 group-hover:to-primary transition-all">
                      <span className="text-sm font-semibold text-primary-foreground">
                        Create Team & Join Contest
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
