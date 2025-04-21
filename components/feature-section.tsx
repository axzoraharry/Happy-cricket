import type React from "react"
import { Trophy, TrendingUp, Users, Zap, BarChart3, Brain } from "lucide-react"

export function FeatureSection() {
  return (
    <section className="py-12 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Powered by AI Cricket Intelligence
          </h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with deep cricket knowledge to give you the ultimate
            fantasy cricket experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="h-10 w-10 text-primary" />}
            title="Mr Happy AI Agent"
            description="Our AI cricket expert analyzes matches, predicts outcomes, and provides personalized recommendations."
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-primary" />}
            title="Real-time Analytics"
            description="Get ball-by-ball analysis, player performance tracking, and match insights as the action unfolds."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-primary" />}
            title="Smart Team Selection"
            description="AI-driven team composition optimization based on player form, conditions, and matchups."
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-primary" />}
            title="Performance Predictions"
            description="Advanced algorithms predict player performance and match outcomes with remarkable accuracy."
          />
          <FeatureCard
            icon={<Trophy className="h-10 w-10 text-primary" />}
            title="Fantasy Leagues"
            description="Create or join private leagues, compete with friends, and track your performance on leaderboards."
          />
          <FeatureCard
            icon={<Zap className="h-10 w-10 text-primary" />}
            title="Smart Notifications"
            description="Get timely alerts about critical match events, player performance, and strategic recommendations."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 font-semibold text-xl">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
