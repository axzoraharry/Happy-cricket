"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function UpcomingMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchMatches = async () => {
      try {
        // Simulating API call with mock data
        setTimeout(() => {
          setMatches([
            {
              id: 1,
              teamA: "India",
              teamB: "Australia",
              venue: "Melbourne Cricket Ground",
              matchDate: new Date(Date.now() + 86400000), // tomorrow
              matchType: "T20",
              teamALogo: "/placeholder.svg?key=5htgb",
              teamBLogo: "/placeholder.svg?key=qni2s",
            },
            {
              id: 2,
              teamA: "England",
              teamB: "South Africa",
              venue: "Lord's Cricket Ground",
              matchDate: new Date(Date.now() + 172800000), // day after tomorrow
              matchType: "ODI",
              teamALogo: "/placeholder.svg?key=7vxc4",
              teamBLogo: "/placeholder.svg?key=y3ese",
            },
            {
              id: 3,
              teamA: "New Zealand",
              teamB: "Pakistan",
              venue: "Eden Park, Auckland",
              matchDate: new Date(Date.now() + 259200000), // 3 days from now
              matchType: "Test",
              teamALogo: "/stylized-silver-fern.png",
              teamBLogo: "/cricket-team-emblem.png",
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching matches:", error)
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
                  <div className="p-6 flex flex-col gap-4 items-center justify-center h-[200px]">
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
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant="outline">{match.matchType}</Badge>
                        <Badge variant="secondary">{formatDistanceToNow(match.matchDate, { addSuffix: true })}</Badge>
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col items-center text-center w-2/5">
                          <div className="relative h-16 w-16 mb-2 overflow-hidden rounded-full bg-muted/50">
                            <Image
                              src={match.teamALogo || "/placeholder.svg"}
                              alt={match.teamA}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <h3 className="font-semibold">{match.teamA}</h3>
                        </div>

                        <div className="flex flex-col items-center justify-center w-1/5">
                          <span className="text-xl font-bold text-muted-foreground">VS</span>
                        </div>

                        <div className="flex flex-col items-center text-center w-2/5">
                          <div className="relative h-16 w-16 mb-2 overflow-hidden rounded-full bg-muted/50">
                            <Image
                              src={match.teamBLogo || "/placeholder.svg"}
                              alt={match.teamB}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <h3 className="font-semibold">{match.teamB}</h3>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          <CalendarDays className="h-4 w-4" />
                          <p>{match.matchDate.toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <p>{match.matchDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <p className="mt-2 truncate">{match.venue}</p>
                      </div>
                    </div>
                    <div className="bg-primary/5 p-3 text-center">
                      <span className="text-sm font-medium text-primary">Create Team</span>
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
