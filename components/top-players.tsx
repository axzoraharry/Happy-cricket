"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TopPlayers() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchPlayers = async () => {
      try {
        // Simulating API call with mock data
        setTimeout(() => {
          setPlayers([
            {
              id: 1,
              name: "Virat Kohli",
              country: "India",
              role: "Batsman",
              battingRating: 95,
              bowlingRating: 20,
              fieldingRating: 85,
              price: 12000,
              imageUrl: "/cricketer-in-action.png",
            },
            {
              id: 2,
              name: "Jasprit Bumrah",
              country: "India",
              role: "Bowler",
              battingRating: 30,
              bowlingRating: 96,
              fieldingRating: 75,
              price: 11500,
              imageUrl: "/dynamic-cricketer.png",
            },
            {
              id: 3,
              name: "Ben Stokes",
              country: "England",
              role: "All-rounder",
              battingRating: 85,
              bowlingRating: 80,
              fieldingRating: 90,
              price: 11000,
              imageUrl: "/cricket-player-action.png",
            },
            {
              id: 4,
              name: "Kane Williamson",
              country: "New Zealand",
              role: "Batsman",
              battingRating: 92,
              bowlingRating: 15,
              fieldingRating: 80,
              price: 10500,
              imageUrl: "/placeholder.svg?height=200&width=200&query=Kane Williamson cricket player",
            },
            {
              id: 5,
              name: "Rashid Khan",
              country: "Afghanistan",
              role: "Bowler",
              battingRating: 45,
              bowlingRating: 94,
              fieldingRating: 75,
              price: 10000,
              imageUrl: "/placeholder.svg?height=200&width=200&query=Rashid Khan cricket player",
            },
            {
              id: 6,
              name: "Jos Buttler",
              country: "England",
              role: "Wicket-keeper",
              battingRating: 90,
              bowlingRating: 10,
              fieldingRating: 92,
              price: 9500,
              imageUrl: "/placeholder.svg?height=200&width=200&query=Jos Buttler cricket player",
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching players:", error)
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Top Players</h2>
            <p className="text-muted-foreground mt-2">Select from the best cricket players around the world</p>
          </div>
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link href="/players">View All Players</Link>
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="batsmen">Batsmen</TabsTrigger>
              <TabsTrigger value="bowlers">Bowlers</TabsTrigger>
              <TabsTrigger value="all-rounders">All-rounders</TabsTrigger>
              <TabsTrigger value="wicket-keepers">Wicket-keepers</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-muted animate-pulse"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded-md"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {players.map((player) => (
                  <Link href={`/players/${player.id}`} key={player.id}>
                    <Card className="overflow-hidden transition-all hover:shadow-md">
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <Image
                            src={player.imageUrl || "/placeholder.svg"}
                            alt={player.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="font-medium">
                              {player.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg">{player.name}</h3>
                          <p className="text-sm text-muted-foreground">{player.country}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">BAT</span>
                              <span className="text-xs font-bold text-primary">{player.battingRating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">BOWL</span>
                              <span className="text-xs font-bold text-primary">{player.bowlingRating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">FIELD</span>
                              <span className="text-xs font-bold text-primary">{player.fieldingRating}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-primary/5 p-3 flex justify-between items-center">
                        <span className="text-sm font-medium">Price</span>
                        <span className="text-sm font-bold">₹{player.price.toLocaleString()}</span>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Other tabs would filter the players by role */}
          <TabsContent value="batsmen" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {players
                .filter((player) => player.role === "Batsman")
                .map((player) => (
                  <Link href={`/players/${player.id}`} key={player.id}>
                    <Card className="overflow-hidden transition-all hover:shadow-md">
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <Image
                            src={player.imageUrl || "/placeholder.svg"}
                            alt={player.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="font-medium">
                              {player.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg">{player.name}</h3>
                          <p className="text-sm text-muted-foreground">{player.country}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">BAT</span>
                              <span className="text-xs font-bold text-primary">{player.battingRating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">BOWL</span>
                              <span className="text-xs font-bold text-primary">{player.bowlingRating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">FIELD</span>
                              <span className="text-xs font-bold text-primary">{player.fieldingRating}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-primary/5 p-3 flex justify-between items-center">
                        <span className="text-sm font-medium">Price</span>
                        <span className="text-sm font-bold">₹{player.price.toLocaleString()}</span>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>

          {/* Similar content for other tabs */}
          <TabsContent value="bowlers" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {players
                .filter((player) => player.role === "Bowler")
                .map((player) => (
                  <Link href={`/players/${player.id}`} key={player.id}>
                    <Card className="overflow-hidden transition-all hover:shadow-md">
                      {/* Same card content as above */}
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <Image
                            src={player.imageUrl || "/placeholder.svg"}
                            alt={player.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="font-medium">
                              {player.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg">{player.name}</h3>
                          <p className="text-sm text-muted-foreground">{player.country}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">BAT</span>
                              <span className="text-xs font-bold text-primary">{player.battingRating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">BOWL</span>
                              <span className="text-xs font-bold text-primary">{player.bowlingRating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">FIELD</span>
                              <span className="text-xs font-bold text-primary">{player.fieldingRating}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-primary/5 p-3 flex justify-between items-center">
                        <span className="text-sm font-medium">Price</span>
                        <span className="text-sm font-bold">₹{player.price.toLocaleString()}</span>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
