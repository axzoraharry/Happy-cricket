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
    fetchMatchData()
    fetchPlayers()
  }, [matchId])

  const fetchMatchData = async () => {
    try {
      // Fetch match details
      const response = await fetch(`/api/matches`)
      const data = await response.json()
      const matchData = data.matches.find(m => m.id == matchId)
      
      if (matchData) {
        setMatch({
          ...matchData,
          teamALogo: `/${matchData.team_a.toLowerCase().replace(' ', '-')}-logo.png`,
          teamBLogo: `/${matchData.team_b.toLowerCase().replace(' ', '-')}-logo.png`,
        })
      }
    } catch (error) {
      console.error("Error fetching match:", error)
    }
  }

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players?limit=50')
      const data = await response.json()
      
      // Add team assignment and enhance player data
      const enhancedPlayers = data.players.map(player => ({
        ...player,
        team: Math.random() > 0.5 ? match?.team_a || 'Team A' : match?.team_b || 'Team B',
        selectedBy: Math.floor(Math.random() * 80) + 10, // % selected by users
        form: ['Hot', 'Good', 'Average', 'Poor'][Math.floor(Math.random() * 4)],
        isPlaying: Math.random() > 0.2, // 80% chance playing
        credits: Math.floor(player.price || (Math.random() * 15 + 5)) // Use price as credits
      }))
      
      setPlayers(enhancedPlayers)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching players:", error)
      setLoading(false)
    }
  }

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = activeRole === "all" || player.role.toLowerCase().includes(activeRole.toLowerCase())
    return matchesSearch && matchesRole
  })

  const addPlayer = (player) => {
    if (selectedPlayers.length >= 11) {
      toast({ title: "Team Full", description: "You can only select 11 players", variant: "destructive" })
      return
    }

    const totalCredits = selectedPlayers.reduce((sum, p) => sum + p.credits, 0)
    if (totalCredits + player.credits > budget) {
      toast({ title: "Budget Exceeded", description: "Not enough credits to add this player", variant: "destructive" })
      return
    }

    if (selectedPlayers.find(p => p.id === player.id)) {
      toast({ title: "Player Already Selected", description: "This player is already in your team", variant: "destructive" })
      return
    }

    // Check team balance (max 7 from one team)
    const teamACount = selectedPlayers.filter(p => p.team === match?.team_a).length
    const teamBCount = selectedPlayers.filter(p => p.team === match?.team_b).length
    
    if (player.team === match?.team_a && teamACount >= 7) {
      toast({ title: "Team Limit", description: `Maximum 7 players from ${match?.team_a}`, variant: "destructive" })
      return
    }
    
    if (player.team === match?.team_b && teamBCount >= 7) {
      toast({ title: "Team Limit", description: `Maximum 7 players from ${match?.team_b}`, variant: "destructive" })
      return
    }

    setSelectedPlayers([...selectedPlayers, player])
    toast({ title: "Player Added", description: `${player.name} added to your team` })
  }

  const removePlayer = (playerId) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId))
    if (captain?.id === playerId) setCaptain(null)
    if (viceCaptain?.id === playerId) setViceCaptain(null)
  }

  const setCaptaincy = (player, role) => {
    if (role === 'captain') {
      if (viceCaptain?.id === player.id) setViceCaptain(null)
      setCaptain(player)
    } else {
      if (captain?.id === player.id) setCaptain(null)
      setViceCaptain(player)
    }
  }

  const usedCredits = selectedPlayers.reduce((sum, p) => sum + p.credits, 0)
  const remainingCredits = budget - usedCredits

  const canSaveTeam = selectedPlayers.length === 11 && captain && viceCaptain

  const saveTeam = () => {
    if (!canSaveTeam) {
      toast({ title: "Incomplete Team", description: "Please select 11 players, captain, and vice-captain", variant: "destructive" })
      return
    }

    // Save team logic here
    toast({ title: "Team Saved!", description: "Your team has been saved successfully" })
    router.push(`/matches/${matchId}/contests`)
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
