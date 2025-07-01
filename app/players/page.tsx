"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, TrendingUp, Zap, Filter, BarChart3 } from "lucide-react"

export default function PlayersPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [teamFilter, setTeamFilter] = useState("all")
  const [sortBy, setSortBy] = useState("points")

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players?limit=50')
      const data = await response.json()
      
      // Enhance player data
      const enhancedPlayers = data.players.map((player: any) => ({
        ...player,
        team: player.country || 'Unknown',
        selectedBy: Math.floor(Math.random() * 80) + 10,
        form: ['Hot', 'Good', 'Average', 'Poor'][Math.floor(Math.random() * 4)],
        isPlaying: Math.random() > 0.2,
        credits: Math.floor(player.price || (Math.random() * 15 + 5)),
        recentMatches: Math.floor(Math.random() * 10) + 5,
        average: (Math.random() * 60 + 20).toFixed(1),
        strikeRate: (Math.random() * 40 + 100).toFixed(1)
      }))
      
      setPlayers(enhancedPlayers)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching players:", error)
      setLoading(false)
    }
  }

  const filteredAndSortedPlayers = players
    .filter((player: any) => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           player.team.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === "all" || player.role.toLowerCase().includes(roleFilter.toLowerCase())
      const matchesTeam = teamFilter === "all" || player.team === teamFilter
      return matchesSearch && matchesRole && matchesTeam
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "points":
          return b.points - a.points
        case "price":
          return b.credits - a.credits
        case "selected":
          return b.selectedBy - a.selectedBy
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const teams = [...new Set(players.map((p: any) => p.team))].sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4 animate-pulse">
                  <div className="h-12 w-12 bg-muted rounded-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cricket Players</h1>
          <p className="text-muted-foreground">Explore player statistics and build your fantasy team</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="batsman">Batsmen</SelectItem>
              <SelectItem value="bowler">Bowlers</SelectItem>
              <SelectItem value="all-rounder">All-Rounders</SelectItem>
              <SelectItem value="wicket-keeper">Wicket-Keepers</SelectItem>
            </SelectContent>
          </Select>

          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="points">Points</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="selected">Selection %</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            {filteredAndSortedPlayers.length} players
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedPlayers.map((player: any) => (
            <Card key={player.id} className="hover:shadow-lg transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/player-${player.id}.jpg`} />
                      <AvatarFallback>{player.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">{player.name}</h3>
                      <p className="text-xs text-muted-foreground">{player.team}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">{player.credits}</div>
                    <p className="text-xs text-muted-foreground">Credits</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Role and Form */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{player.role}</Badge>
                  <div className="flex items-center gap-2">
                    <Badge variant={player.form === 'Hot' ? 'default' : 'secondary'} className="text-xs">
                      {player.form === 'Hot' && <Zap className="h-3 w-3 mr-1" />}
                      {player.form}
                    </Badge>
                    {!player.isPlaying && <Badge variant="destructive" className="text-xs">Doubtful</Badge>}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Points:</span>
                    <span className="font-medium">{player.points}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Selected by:</span>
                    <span className="font-medium">{player.selectedBy}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recent matches:</span>
                    <span className="font-medium">{player.recentMatches}</span>
                  </div>
                  
                  {player.role.toLowerCase().includes('batsman') && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Average:</span>
                        <span className="font-medium">{player.average}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Strike Rate:</span>
                        <span className="font-medium">{player.strikeRate}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Star className="h-4 w-4 mr-1" />
                    Favorite
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Stats
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedPlayers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No players found</h3>
            <p className="text-muted-foreground">
              {searchTerm || roleFilter !== "all" || teamFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No players available at the moment"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}