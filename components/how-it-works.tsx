import { Trophy, Users, Zap, BarChart3 } from "lucide-react"

export function HowItWorks() {
  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">How Fantasy Cricket Works</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Create your dream team, compete with friends, and win exciting prizes based on real-world cricket
            performances.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Create Your Team</h3>
            <p className="text-muted-foreground">
              Select 11 players within a budget of 100 credits. Choose wisely to maximize your team's potential.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">2. Join Contests</h3>
            <p className="text-muted-foreground">
              Enter contests with your team. Choose from free contests or compete for cash prizes in paid contests.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">3. Score Points</h3>
            <p className="text-muted-foreground">
              Your players earn points based on their real-world performance in the match. Track scores in real-time.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">4. Win Prizes</h3>
            <p className="text-muted-foreground">
              Top performers in each contest win exciting prizes. Climb the leaderboard and showcase your cricket
              knowledge.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-muted/30 rounded-lg p-6 md:p-8">
          <h3 className="text-2xl font-bold mb-4 text-center">Points System</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h4 className="font-bold mb-2 text-primary">Batting Points</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Run</span>
                  <span className="font-medium">+1</span>
                </li>
                <li className="flex justify-between">
                  <span>Boundary Bonus</span>
                  <span className="font-medium">+1</span>
                </li>
                <li className="flex justify-between">
                  <span>Six Bonus</span>
                  <span className="font-medium">+2</span>
                </li>
                <li className="flex justify-between">
                  <span>30 Run Bonus</span>
                  <span className="font-medium">+4</span>
                </li>
                <li className="flex justify-between">
                  <span>Half Century Bonus</span>
                  <span className="font-medium">+8</span>
                </li>
                <li className="flex justify-between">
                  <span>Century Bonus</span>
                  <span className="font-medium">+16</span>
                </li>
                <li className="flex justify-between">
                  <span>Duck Penalty</span>
                  <span className="font-medium">-2</span>
                </li>
              </ul>
            </div>
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h4 className="font-bold mb-2 text-primary">Bowling Points</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Wicket</span>
                  <span className="font-medium">+25</span>
                </li>
                <li className="flex justify-between">
                  <span>LBW/Bowled Bonus</span>
                  <span className="font-medium">+8</span>
                </li>
                <li className="flex justify-between">
                  <span>Maiden Over</span>
                  <span className="font-medium">+12</span>
                </li>
                <li className="flex justify-between">
                  <span>3 Wicket Bonus</span>
                  <span className="font-medium">+4</span>
                </li>
                <li className="flex justify-between">
                  <span>4 Wicket Bonus</span>
                  <span className="font-medium">+8</span>
                </li>
                <li className="flex justify-between">
                  <span>5 Wicket Bonus</span>
                  <span className="font-medium">+16</span>
                </li>
                <li className="flex justify-between">
                  <span>Economy Rate &lt; 5 (min 2 overs)</span>
                  <span className="font-medium">+6</span>
                </li>
              </ul>
            </div>
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h4 className="font-bold mb-2 text-primary">Fielding Points</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Catch</span>
                  <span className="font-medium">+8</span>
                </li>
                <li className="flex justify-between">
                  <span>3 Catch Bonus</span>
                  <span className="font-medium">+4</span>
                </li>
                <li className="flex justify-between">
                  <span>Stumping</span>
                  <span className="font-medium">+12</span>
                </li>
                <li className="flex justify-between">
                  <span>Run Out (Direct)</span>
                  <span className="font-medium">+12</span>
                </li>
                <li className="flex justify-between">
                  <span>Run Out (Indirect)</span>
                  <span className="font-medium">+6</span>
                </li>
              </ul>
              <h4 className="font-bold mt-4 mb-2 text-primary">Other Points</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Captain</span>
                  <span className="font-medium">2x</span>
                </li>
                <li className="flex justify-between">
                  <span>Vice Captain</span>
                  <span className="font-medium">1.5x</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
