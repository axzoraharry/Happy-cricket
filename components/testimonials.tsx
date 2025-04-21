import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

export function Testimonials() {
  return (
    <section className="py-12 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What Our Users Say</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of cricket fans who are already enjoying our fantasy cricket platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-6">
              <Quote className="h-8 w-8 text-primary/40 mb-4" />
              <p className="mb-6 text-lg">
                "I've tried many fantasy cricket platforms, but this one stands out with its user-friendly interface and
                real-time scoring. I've won several contests already!"
              </p>
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src="/placeholder.svg?height=48&width=48&query=happy indian man"
                    alt="Rahul Sharma"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">Rahul Sharma</h4>
                  <p className="text-sm text-muted-foreground">Fantasy Cricket Enthusiast</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-6">
              <Quote className="h-8 w-8 text-primary/40 mb-4" />
              <p className="mb-6 text-lg">
                "The points system is very fair and the real-time updates keep me engaged throughout the match. I love
                competing with my friends in private contests!"
              </p>
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src="/placeholder.svg?height=48&width=48&query=happy woman smiling"
                    alt="Sarah Johnson"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-muted-foreground">Cricket Analyst</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-6">
              <Quote className="h-8 w-8 text-primary/40 mb-4" />
              <p className="mb-6 text-lg">
                "The detailed player statistics and performance analytics help me make informed decisions when creating
                my teams. This platform has definitely improved my cricket knowledge!"
              </p>
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src="/placeholder.svg?height=48&width=48&query=happy australian man"
                    alt="Michael Clarke"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">Michael Clarke</h4>
                  <p className="text-sm text-muted-foreground">Cricket Coach</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
