import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, Users, BarChart3 } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 md:py-24">
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-1/2 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block text-primary">Cricket Fantasy</span>
                <span className="block">Build Your Dream Team</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Create your ultimate cricket team, compete with friends, and win exciting prizes based on real-world
                cricket performances.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/register">
                  <Trophy className="h-5 w-5" />
                  Get Started
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how-to-play">Learn How to Play</Link>
              </Button>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">10,000+ Players</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-medium">₹10 Cr+ Prize Pool</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="font-medium">Real-time Scoring</span>
              </div>
            </div>
          </div>
          <div className="relative mx-auto lg:mr-0 w-full max-w-[500px] pt-8 lg:pt-0">
            <div className="relative z-10 overflow-hidden rounded-2xl border bg-background shadow-xl">
              <Image
                src="/placeholder.svg?key=ixdmg"
                alt="Cricket Fantasy App"
                width={500}
                height={600}
                className="w-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="rounded-lg bg-background/90 backdrop-blur p-4 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Create Your Team</h3>
                      <p className="text-sm text-muted-foreground">Select 11 players within 100 credit points</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 z-0 h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
