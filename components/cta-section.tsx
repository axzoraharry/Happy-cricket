import { Button } from "@/components/ui/button"
import { BirdIcon as Cricket } from "lucide-react"

export function CtaSection() {
  return (
    <section className="py-12 md:py-24 bg-primary/5">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to transform your fantasy cricket experience?
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">
            Join thousands of cricket enthusiasts who are already using Happy Cricket to get AI-powered insights and
            predictions.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              <Cricket className="h-5 w-5" />
              Get Started for Free
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
