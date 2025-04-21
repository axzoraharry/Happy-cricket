import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface MatchCardProps {
  teamA: string
  teamB: string
  teamAScore: string
  teamBScore: string
  matchStatus: string
  matchType: string
  venue: string
  teamALogo: string
  teamBLogo: string
  progress: number
  isLive: boolean
}

export function MatchCard({
  teamA,
  teamB,
  teamAScore,
  teamBScore,
  matchStatus,
  matchType,
  venue,
  teamALogo,
  teamBLogo,
  progress,
  isLive,
}: MatchCardProps) {
  return (
    <Link href={`/matches/${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Badge variant={isLive ? "destructive" : "secondary"} className={cn(isLive && "animate-pulse")}>
                {isLive ? "LIVE" : "Completed"}
              </Badge>
              <Badge variant="outline">{matchType}</Badge>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col items-center text-center w-2/5">
                <div className="relative h-16 w-16 mb-2 overflow-hidden rounded-full bg-muted/50">
                  <Image src={teamALogo || "/placeholder.svg"} alt={teamA} fill className="object-contain p-1" />
                </div>
                <h3 className="font-semibold">{teamA}</h3>
                <p className="text-lg font-bold">{teamAScore}</p>
              </div>

              <div className="flex flex-col items-center justify-center w-1/5">
                <span className="text-xl font-bold text-muted-foreground">VS</span>
              </div>

              <div className="flex flex-col items-center text-center w-2/5">
                <div className="relative h-16 w-16 mb-2 overflow-hidden rounded-full bg-muted/50">
                  <Image src={teamBLogo || "/placeholder.svg"} alt={teamB} fill className="object-contain p-1" />
                </div>
                <h3 className="font-semibold">{teamB}</h3>
                <p className="text-lg font-bold">{teamBScore}</p>
              </div>
            </div>

            {isLive && (
              <div className="mb-4">
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="truncate">{venue}</p>
              <p className={cn("font-medium mt-1", isLive && "text-primary")}>{matchStatus}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
