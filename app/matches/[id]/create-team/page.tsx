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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading team builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {match && (
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3">
                  <img src={match.teamALogo} alt={match.team_a} className="w-8 h-8 rounded-full" />
                  <span className="font-semibold">{match.team_a}</span>
                  <span className="text-muted-foreground">vs</span>
                  <span className="font-semibold">{match.team_b}</span>
                  <img src={match.teamBLogo} alt={match.team_b} className="w-8 h-8 rounded-full" />
                </div>
                
                <Badge variant="outline">{match.match_type}</Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Team Preview */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>Your Team ({selectedPlayers.length}/11)</span>
                  <div className="text-sm">
                    <span className={remainingCredits < 0 ? "text-red-500" : "text-green-600"}>
                      {remainingCredits} credits left
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPlayers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Select players to build your team
                  </p>
                ) : (
                  selectedPlayers.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/player-${player.id}.jpg`} />
                          <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{player.name}</p>
                          <p className="text-xs text-muted-foreground">{player.role} • {player.credits} cr</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {captain?.id === player.id && <Badge variant="default" className="text-xs">C</Badge>}
                        {viceCaptain?.id === player.id && <Badge variant="secondary" className="text-xs">VC</Badge>}
                        <Button variant="ghost" size="sm" onClick={() => removePlayer(player.id)}>
                          ×
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                
                {selectedPlayers.length > 0 && (
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Credits Used:</span>
                      <span className="font-medium">{usedCredits}/{budget}</span>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      disabled={!canSaveTeam}
                      onClick={saveTeam}
                    >
                      {canSaveTeam ? "Save Team & Continue" : `Need ${11 - selectedPlayers.length} more players`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Player Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle>Select Players</CardTitle>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeRole} onValueChange={setActiveRole} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="batsman">Batsmen</TabsTrigger>
                    <TabsTrigger value="bowler">Bowlers</TabsTrigger>
                    <TabsTrigger value="all-rounder">All-Round</TabsTrigger>
                    <TabsTrigger value="wicket-keeper">Keepers</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeRole} className="space-y-3">
                    {filteredPlayers.map((player) => {
                      const isSelected = selectedPlayers.find(p => p.id === player.id)
                      const canSelect = !isSelected && selectedPlayers.length < 11 && remainingCredits >= player.credits
                      
                      return (
                        <Card key={player.id} className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={`/player-${player.id}.jpg`} />
                                  <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{player.name}</h3>
                                    {player.form === 'Hot' && <Zap className="h-4 w-4 text-orange-500" />}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{player.role}</span>
                                    <span>•</span>
                                    <span>{player.team}</span>
                                    <span>•</span>
                                    <span>{player.selectedBy}% selected</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={player.form === 'Hot' ? 'default' : 'secondary'} className="text-xs">
                                      {player.form}
                                    </Badge>
                                    {!player.isPlaying && <Badge variant="destructive" className="text-xs">Doubtful</Badge>}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="font-semibold">{player.credits} cr</div>
                                  <div className="text-sm text-muted-foreground">{player.points} pts</div>
                                </div>
                                
                                {isSelected ? (
                                  <div className="flex flex-col gap-1">
                                    <Button 
                                      size="sm" 
                                      variant={captain?.id === player.id ? "default" : "outline"}
                                      onClick={() => setCaptaincy(player, 'captain')}
                                      disabled={!isSelected}
                                    >
                                      C
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant={viceCaptain?.id === player.id ? "default" : "outline"}
                                      onClick={() => setCaptaincy(player, 'vice')}
                                      disabled={!isSelected}
                                    >
                                      VC
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm"
                                    onClick={() => addPlayer(player)}
                                    disabled={!canSelect}
                                  >
                                    Add
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
