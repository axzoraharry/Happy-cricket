"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, CalendarDays, Clock, Trophy, Users, Filter } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      const data = await response.json()
      
      // Transform and enhance the data
      const enhancedMatches = data.matches.map((match: any) => ({
        ...match,
        teamALogo: `/${match.team_a.toLowerCase().replace(' ', '-')}-logo.png`,
        teamBLogo: `/${match.team_b.toLowerCase().replace(' ', '-')}-logo.png`,
        contestsAvailable: Math.floor(Math.random() * 20) + 5,
        totalPrizePool: (Math.floor(Math.random() * 500) + 100) * 1000,
        entryFee: Math.floor(Math.random() * 50) + 10,
        participants: Math.floor(Math.random() * 10000) + 1000
      }))
      
      setMatches(enhancedMatches)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching matches:", error)
      setLoading(false)
    }
  }

  const filteredMatches = matches.filter((match: any) => {
    const matchesSearch = match.team_a.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.team_b.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.venue.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || match.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                </CardContent>
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
          <h1 className="text-3xl font-bold mb-2">Cricket Matches</h1>
          <p className="text-muted-foreground">Create your fantasy teams for upcoming cricket matches</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search matches, teams, or venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Matches</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match: any) => (
            <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-all group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {match.match_type}
                  </Badge>
                  <Badge variant={match.status === 'live' ? 'default' : 'secondary'} className="text-xs">
                    {match.status === 'live' ? '🔴 LIVE' : formatDistanceToNow(new Date(match.match_date), { addSuffix: true })}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Teams */}
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-2 border-2 border-primary/20">
                      <span className="text-sm font-semibold">{match.team_a.substring(0, 3).toUpperCase()}</span>
                    </div>
                    <p className="text-sm font-medium">{match.team_a}</p>
                  </div>

                  <div className="text-center">
                    <span className="text-xl font-bold text-primary">VS</span>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-2 border-2 border-primary/20">
                      <span className="text-sm font-semibold">{match.team_b.substring(0, 3).toUpperCase()}</span>
                    </div>
                    <p className="text-sm font-medium">{match.team_b}</p>
                  </div>
                </div>

                {/* Match Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>{new Date(match.match_date).toLocaleDateString()}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{new Date(match.match_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-sm text-muted-foreground" title={match.venue}>
                    📍 {match.venue}
                  </p>
                  {match.competition && (
                    <p className="text-xs text-primary/80">🏆 {match.competition}</p>
                  )}
                </div>

                {/* Fantasy Stats */}
                <div className="border-t pt-4 space-y-3">
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
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Entry from ₹{match.entryFee}</span>
                    <span>{match.participants.toLocaleString()} joined</span>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link href={`/matches/${match.id}/create-team`}>
                      Create Team & Join Contest
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMatches.length === 0 && !loading && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "No matches available at the moment"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}