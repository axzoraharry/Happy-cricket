import type React from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface AiInsightCardProps {
  title: string
  description: string
  icon: React.ReactNode
  category: string
  confidence: number
}

export function AiInsightCard({ title, description, icon, category, confidence }: AiInsightCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">{icon}</div>
          <Badge variant="outline">{category}</Badge>
        </div>

        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Confidence</span>
            <span className="text-sm font-medium">{confidence}%</span>
          </div>
          <Progress value={confidence} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Powered by Mr Happy AI</span>
        </div>
      </CardFooter>
    </Card>
  )
}
