import { AppShell } from "@/components/layout/app-shell"
import { KPICard } from "@/components/kpi-card"
import { PostsTable, type Post } from "@/components/posts/posts-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "5 Ways to Boost Productivity Without Burnout",
    date: "Oct 24",
    topic: "Productivity",
    tone: "Insightful",
    engagement: "4.2%",
    saves: 128,
    score: 92,
  },
  {
    id: "2",
    title: "Why I Stopped Using To-Do Lists (And What I Do Instead)",
    date: "Oct 22",
    topic: "Self-development",
    tone: "Controversial",
    engagement: "6.8%",
    saves: 342,
    score: 98,
  },
  {
    id: "3",
    title: "The Future of Remote Work in 2025",
    date: "Oct 20",
    topic: "Work",
    tone: "Analytical",
    engagement: "3.1%",
    saves: 85,
    score: 84,
  },
  {
    id: "4",
    title: "My Morning Routine for Maximum Focus",
    date: "Oct 18",
    topic: "Lifestyle",
    tone: "Personal",
    engagement: "3.9%",
    saves: 112,
    score: 88,
  },
  {
    id: "5",
    title: "How to Learn New Skills Fast",
    date: "Oct 15",
    topic: "Learning",
    tone: "Educational",
    engagement: "5.5%",
    saves: 210,
    score: 94,
  },
]

export default function DashboardPage() {
  return (
    <AppShell className="max-w-5xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">📊 대시보드</h1>
        <p className="text-sm text-muted-foreground">콘텐츠 성과를 분석해보세요.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Posts" value="1,248" />
        <KPICard title="Avg Engagement (7d)" value="4.8%" trend="up" trendValue="12% vs last week" />
        <KPICard title="Top Topic" value="Self-dev" subtext="32% of total engagement" />
        <KPICard title="Best Combo" value="Insight · List" subtext="Highest conversion rate" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Top Performing Posts</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View all
          </Button>
        </div>
        <PostsTable posts={MOCK_POSTS} detailed />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Insight</h2>
        <Card className="bg-muted/50 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI Insight (Mock)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              "Short-form motivational posts performed 2.3x better than average last week. Consider increasing frequency
              of this format on Tuesdays."
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
