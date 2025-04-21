import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

export function TestimonialSection() {
  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Loved by Cricket Fans</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about their Happy Cricket experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard
            quote="The AI predictions are incredibly accurate! I've improved my fantasy team performance by 40% since using Happy Cricket."
            name="Rahul Sharma"
            title="Fantasy Cricket Enthusiast"
            avatar="/placeholder.svg?height=64&width=64&query=happy indian man"
          />
          <TestimonialCard
            quote="Mr Happy's insights have completely changed how I approach fantasy cricket. The real-time analytics are a game-changer."
            name="Sarah Johnson"
            title="Cricket Analyst"
            avatar="/placeholder.svg?height=64&width=64&query=happy woman smiling"
          />
          <TestimonialCard
            quote="I love the clean interface and how easy it is to get valuable insights. Happy Cricket makes fantasy cricket so much more enjoyable!"
            name="Michael Clarke"
            title="Cricket Coach"
            avatar="/placeholder.svg?height=64&width=64&query=happy australian man"
          />
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({
  quote,
  name,
  title,
  avatar,
}: {
  quote: string
  name: string
  title: string
  avatar: string
}) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <Quote className="h-8 w-8 text-primary/40 mb-4" />
        <p className="mb-6 text-lg">{quote}</p>
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image src={avatar || "/placeholder.svg"} alt={name} fill className="object-cover" />
          </div>
          <div>
            <h4 className="font-semibold">{name}</h4>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
