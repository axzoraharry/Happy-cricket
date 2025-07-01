"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, Users, Trophy, ArrowLeft, Zap } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function CreateTeamPage() {
  const { id: matchId } = useParams()
  const router = useRouter()
  
  const [match, setMatch] = useState(null)
  const [players, setPlayers] = useState([])
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [captain, setCaptain] = useState(null)
  const [viceCaptain, setViceCaptain] = useState(null)
  const [budget, setBudget] = useState(100)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeRole, setActiveRole] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchData = async () => {
      try {
        // Simulating API calls with mock data
        setTimeout(() => {
          setMatch({
            id: params.id,
            teamA: "India",
            teamB: "Australia",
            venue: "Melbourne Cricket Ground",
            matchDate: new Date(Date.now() + 86400000), // tomorrow
            matchType: "T20",
          })

          setAvailablePlayers([
            {
              id: "p1",
              name: "Virat Kohli",
              country: "India",
              role: "BAT",
              price: 10000,
              points: 0,
              imageUrl: "/cricketer-in-action.png",
            },
            {
              id: "p2",
              name: "Rohit Sharma",
              country: "India",
              role: "BAT",
              price: 9500,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=Rohit Sharma cricket player",
            },
            {
              id: "p3",
              name: "KL Rahul",
              country: "India",
              role: "WK",
              price: 9000,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=KL Rahul cricket player",
            },
            {
              id: "p4",
              name: "Rishabh Pant",
              country: "India",
              role: "WK",
              price: 8500,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=Rishabh Pant cricket player",
            },
            {
              id: "p5",
              name: "Hardik Pandya",
              country: "India",
              role: "AR",
              price: 9200,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=Hardik Pandya cricket player",
            },
            {
              id: "p6",
              name: "Ravindra Jadeja",
              country: "India",
              role: "AR",
              price: 8800,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=Ravindra Jadeja cricket player",
            },
            {
              id: "p7",
              name: "Jasprit Bumrah",
              country: "India",
              role: "BOWL",
              price: 9300,
              points: 0,
              imageUrl: "/dynamic-cricketer.png",
            },
            {
              id: "p8",
              name: "Mohammed Shami",
              country: "India",
              role: "BOWL",
              price: 8700,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=Mohammed Shami cricket player",
            },
            {
              id: "p9",
              name: "Steve Smith",
              country: "Australia",
              role: "BAT",
              price: 9800,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=Steve Smith cricket player",
            },
            {
              id: "p10",
              name: "David Warner",
              country: "Australia",
              role: "BAT",
              price: 9600,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=David Warner cricket player",
            },
            {
              id: "p11",
              name: "Alex Carey",
              country: "Australia",
              role: "WK",
              price: 8400,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=Alex Carey cricket player",
            },
            {
              id: "p12",
              name: "Glenn Maxwell",
              country: "Australia",
              role: "AR",
              price: 9100,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=Glenn Maxwell cricket player",
            },
            {
              id: "p13",
              name: "Marcus Stoinis",
              country: "Australia",
              role: "AR",
              price: 8600,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=Marcus Stoinis cricket player",
            },
            {
              id: "p14",
              name: "Pat Cummins",
              country: "Australia",
              role: "BOWL",
              price: 9400,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=Pat Cummins cricket player",
            },
            {
              id: "p15",
              name: "Mitchell Starc",
              country: "Australia",
              role: "BOWL",
              price: 9200,
              points: 0,
              imageUrl: "/placeholder.svg?height=100&width=100&query=Mitchell Starc cricket player",
            },
          ])

          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [params.id, user])

  const handleSelectPlayer = (player: any) => {
    // Check if player is already selected
    if (selectedPlayers.some((p) => p.id === player.id)) {
      // Remove player
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id))
      setCredits(credits + player.price)

      // If player was captain or vice-captain, reset those
      if (captain === player.id) setCaptain(null)
      if (viceCaptain === player.id) setViceCaptain(null)
    } else {
      // Check team constraints
      if (selectedPlayers.length >= 11) {
        toast({
          title: "Team Full",
          description: "You can only select 11 players",
          variant: "destructive",
        })
        return
      }

      // Check role constraints
      const roleCount = {
        WK: selectedPlayers.filter((p) => p.role === "WK").length,
        BAT: selectedPlayers.filter((p) => p.role === "BAT").length,
        AR: selectedPlayers.filter((p) => p.role === "AR").length,
        BOWL: selectedPlayers.filter((p) => p.role === "BOWL").length,
      }

      if (player.role === "WK" && roleCount.WK >= 4) {
        toast({
          title: "Too Many Wicket-keepers",
          description: "You can select at most 4 wicket-keepers",
          variant: "destructive",
        })
        return
      }

      if (player.role === "BAT" && roleCount.BAT >= 6) {
        toast({
          title: "Too Many Batsmen",
          description: "You can select at most 6 batsmen",
          variant: "destructive",
        })
        return
      }

      if (player.role === "AR" && roleCount.AR >= 4) {
        toast({
          title: "Too Many All-rounders",
          description: "You can select at most 4 all-rounders",
          variant: "destructive",
        })
        return
      }

      if (player.role === "BOWL" && roleCount.BOWL >= 6) {
        toast({
          title: "Too Many Bowlers",
          description: "You can select at most 6 bowlers",
          variant: "destructive",
        })
        return
      }

      // Check credit constraint
      if (credits < player.price) {
        toast({
          title: "Not Enough Credits",
          description: "You don't have enough credits to select this player",
          variant: "destructive",
        })
        return
      }

      // Add player
      setSelectedPlayers([...selectedPlayers, player])
      setCredits(credits - player.price)
    }
  }

  const handleSetCaptain = (playerId: string) => {
    if (captain === playerId) {
      setCaptain(null)
    } else {
      setCaptain(playerId)
      // If this player was vice-captain, reset vice-captain
      if (viceCaptain === playerId) {
        setViceCaptain(null)
      }
    }
  }

  const handleSetViceCaptain = (playerId: string) => {
    if (viceCaptain === playerId) {
      setViceCaptain(null)
    } else {
      setViceCaptain(playerId)
      // If this player was captain, reset captain
      if (captain === playerId) {
        setCaptain(null)
      }
    }
  }

  const handleCreateTeam = () => {
    if (!teamName) {
      toast({
        title: "Team Name Required",
        description: "Please enter a name for your team",
        variant: "destructive",
      })
      return
    }

    if (selectedPlayers.length !== 11) {
      toast({
        title: "Incomplete Team",
        description: "You must select exactly 11 players",
        variant: "destructive",
      })
      return
    }

    if (!captain) {
      toast({
        title: "Captain Required",
        description: "Please select a captain for your team",
        variant: "destructive",
      })
      return
    }

    if (!viceCaptain) {
      toast({
        title: "Vice-Captain Required",
        description: "Please select a vice-captain for your team",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would make an API call to save the team
    toast({
      title: "Team Created",
      description: "Your team has been created successfully",
    })

    router.push("/my-teams")
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
          <h1 className="text-3xl font-bold tracking-tight">Create Team</h1>
          {match && (
            <p className="text-muted-foreground">
              {match.teamA} vs {match.teamB} | {match.matchType} | {new Date(match.matchDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Players</CardTitle>
              <CardDescription>
                Select 11 players within the credit limit. You must select 1-4 wicket-keepers, 3-6 batsmen, 1-4
                all-rounders, and 3-6 bowlers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="WK">WK ({selectedPlayers.filter((p) => p.role === "WK").length})</TabsTrigger>
                  <TabsTrigger value="BAT">BAT ({selectedPlayers.filter((p) => p.role === "BAT").length})</TabsTrigger>
                  <TabsTrigger value="AR">AR ({selectedPlayers.filter((p) => p.role === "AR").length})</TabsTrigger>
                  <TabsTrigger value="BOWL">
                    BOWL ({selectedPlayers.filter((p) => p.role === "BOWL").length})
                  </TabsTrigger>
                </TabsList>

                {["WK", "BAT", "AR", "BOWL"].map((role) => (
                  <TabsContent key={role} value={role} className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {isLoading
                        ? Array(6)
                            .fill(0)
                            .map((_, i) => (
                              <Card key={i} className="overflow-hidden">
                                <CardContent className="p-0">
                                  <div className="p-4 flex flex-col gap-2">
                                    <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
                                    <div className="h-4 w-16 bg-muted animate-pulse rounded-md"></div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                        : availablePlayers
                            .filter((player) => player.role === role)
                            .map((player) => {
                              const isSelected = selectedPlayers.some((p) => p.id === player.id)
                              const isCaptain = captain === player.id
                              const isViceCaptain = viceCaptain === player.id

                              return (
                                <Card
                                  key={player.id}
                                  className={`overflow-hidden cursor-pointer transition-all ${
                                    isSelected ? "border-primary" : ""
                                  }`}
                                  onClick={() => handleSelectPlayer(player)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted/50">
                                        <Image
                                          src={player.imageUrl || "/placeholder.svg"}
                                          alt={player.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <div>
                                        <h3 className="font-semibold text-sm">{player.name}</h3>
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            {player.country}
                                          </Badge>
                                          <Badge variant="secondary" className="text-xs">
                                            {player.role}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center">
                                      <span className="text-sm font-bold">₹{player.price.toLocaleString()}</span>
                                      {isSelected && (
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            variant={isCaptain ? "default" : "outline"}
                                            className="h-6 text-xs px-2"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleSetCaptain(player.id)
                                            }}
                                          >
                                            C
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant={isViceCaptain ? "default" : "outline"}
                                            className="h-6 text-xs px-2"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleSetViceCaptain(player.id)
                                            }}
                                          >
                                            VC
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Your Team</CardTitle>
              <CardDescription>{selectedPlayers.length}/11 players selected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    placeholder="Enter team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Credits Left</span>
                    <span className="text-sm font-bold">₹{credits.toLocaleString()}</span>
                  </div>
                  <Progress value={(10000 - credits) / 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Players</h3>
                  {selectedPlayers.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPlayers.map((player) => (
                        <div key={player.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-muted/50">
                              <Image
                                src={player.imageUrl || "/placeholder.svg"}
                                alt={player.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{player.name}</p>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {player.role}
                                </Badge>
                                {captain === player.id && <Badge className="text-xs px-1 py-0">C</Badge>}
                                {viceCaptain === player.id && (
                                  <Badge variant="secondary" className="text-xs px-1 py-0">
                                    VC
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleSelectPlayer(player)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 border border-dashed rounded-md">
                      <p className="text-sm text-muted-foreground">No players selected</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={selectedPlayers.length !== 11 || !captain || !viceCaptain || !teamName}
                onClick={handleCreateTeam}
              >
                Create Team
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
