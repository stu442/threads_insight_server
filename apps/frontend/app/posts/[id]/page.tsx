import { AppShell } from "@/components/layout/app-shell"
import { KPICard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowUpRight } from "lucide-react"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params

  return (
    <AppShell className="max-w-3xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">📌 Post Detail</h1>
        <p className="text-sm text-muted-foreground">ID: {id} · Published on Oct 24, 2023 · 10:42 AM</p>
      </div>

      <div className="space-y-6">
        <section>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Original Content</CardTitle>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs bg-transparent">
                Open in Threads <ArrowUpRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                Stop trying to be productive 24/7. It’s a trap.
                <br />
                <br />
                Real growth happens in the rest periods, not just the grind. Think of it like muscle growth: you lift to
                tear, you rest to repair.
                <br />
                <br />
                If you never rest, you just break.
                <br />
                <br />
                #Productivity #MentalHealth #Growth
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <KPICard title="Impressions" value="12.5k" />
          <KPICard title="Likes" value="842" />
          <KPICard title="Saves" value="342" />
          <KPICard title="Eng. Rate" value="6.8%" trend="up" trendValue="high" />
        </section>

        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">AI Labeling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-6">
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground block">Topic</span>
                  <Badge variant="outline">Self-development</Badge>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground block">Tone</span>
                  <Badge variant="secondary">Direct</Badge>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground block">Style</span>
                  <Badge variant="secondary">Short-form</Badge>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground block">Emotion</span>
                  <Badge variant="secondary">Empowering</Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground block">Keywords</span>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="font-normal text-muted-foreground">
                    Productivity
                  </Badge>
                  <Badge variant="outline" className="font-normal text-muted-foreground">
                    Rest
                  </Badge>
                  <Badge variant="outline" className="font-normal text-muted-foreground">
                    Growth
                  </Badge>
                  <Badge variant="outline" className="font-normal text-muted-foreground">
                    Mental Health
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Insight</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This post performed above average due to its short length and direct, motivational tone. The metaphor of
              "muscle growth" resonated well with the audience, driving high saves.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Actions</h3>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start bg-transparent">
                Generate Variations
              </Button>
              <Button variant="outline" className="justify-start bg-transparent">
                Create A/B Test Version
              </Button>
              <Button variant="outline" className="justify-start bg-transparent">
                Republish Strategy
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
