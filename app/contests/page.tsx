"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Search, Users } from "lucide-react"

export default function ContestsPage() {
  const [contests, setContests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetch('/api/contests')
        const data = await response.json()
        setContests(data.contests || [])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching contests:", error)
        // Fallback to mock data
        setContests([
          {
            id: 1,
            name: "IPL Mega Contest",
            entryFee: 100,
            totalTeams: 10000,
            joinedTeams: 8500,
            prizePool: 1000000,
            status: "upcoming",
            startTime: new Date(Date.now() + 86400000), // tomorrow
          },
        ])
        setIsLoading(false)
      }
    }

    fetchContests()
  }, [])

  const filteredContests = contests.filter((contest) => contest.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contests</h1>
          <p className="text-muted-foreground">Join contests and compete with other players</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/contests/create">Create Contest</Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contests..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
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
          ) : filteredContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContests.map((contest) => (
                <Card key={contest.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{contest.name}</CardTitle>
                        <CardDescription>Starts {new Date(contest.startTime).toLocaleDateString()}</CardDescription>
                      </div>
                      <Badge variant={contest.entryFee === 0 ? "secondary" : "outline"}>
                        {contest.entryFee === 0 ? "FREE" : `₹${contest.entryFee}`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Trophy className="h-4 w-4" />
                          <span>Prize Pool</span>
                        </div>
                        <span className="font-bold text-lg">₹{contest.prizePool.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Users className="h-4 w-4" />
                          <span>Entries</span>
                        </div>
                        <span className="font-bold text-lg">
                          {contest.joinedTeams}/{contest.totalTeams}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(contest.joinedTeams / contest.totalTeams) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>{Math.round((contest.joinedTeams / contest.totalTeams) * 100)}% Full</span>
                      <span>{contest.totalTeams - contest.joinedTeams} spots left</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/contests/${contest.id}`}>Join Contest</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Contests Found</CardTitle>
                <CardDescription>No contests match your search criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Try adjusting your search or check back later for new contests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Similar content for other tabs */}
        <TabsContent value="free" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests
              .filter((contest) => contest.entryFee === 0)
              .map((contest) => (
                <Card key={contest.id} className="overflow-hidden">
                  {/* Same card content as above */}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{contest.name}</CardTitle>
                        <CardDescription>Starts {new Date(contest.startTime).toLocaleDateString()}</CardDescription>
                      </div>
                      <Badge variant="secondary">FREE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Trophy className="h-4 w-4" />
                          <span>Prize Pool</span>
                        </div>
                        <span className="font-bold text-lg">₹{contest.prizePool.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Users className="h-4 w-4" />
                          <span>Entries</span>
                        </div>
                        <span className="font-bold text-lg">
                          {contest.joinedTeams}/{contest.totalTeams}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(contest.joinedTeams / contest.totalTeams) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>{Math.round((contest.joinedTeams / contest.totalTeams) * 100)}% Full</span>
                      <span>{contest.totalTeams - contest.joinedTeams} spots left</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/contests/${contest.id}`}>Join Contest</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
