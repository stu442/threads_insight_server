import { AppShell } from "@/components/layout/app-shell"
import { KPICard } from "@/components/kpi-card"
import { PostsTable, type Post } from "@/components/posts/posts-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAnalytics } from "@/lib/api"
import Link from "next/link"

// 페이지가 매번 동적으로 렌더링 되도록 함
export const dynamic = 'force-dynamic'

// TODO: Replace with actual user ID from auth context or configuration
const USER_ID = "32547435728232967"

export default async function DashboardPage() {
  let analyticsData = null
  let posts: Post[] = []

  try {
    analyticsData = await getAnalytics(USER_ID)

    if (analyticsData?.posts) {
      posts = analyticsData.posts.map((post) => ({
        id: post.id,
        title: post.caption ? (post.caption.length > 50 ? post.caption.slice(0, 50) + "..." : post.caption) : "No Caption",
        date: new Date(post.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        topic: "TEST", // Placeholder as API doesn't provide topic yet
        tags: post.tags || [], // Use actual tags from API
        engagement: `${post.metrics.engagement}%`,
        views: post.metrics.views,
        likes: post.metrics.likes,
        replies: post.metrics.replies,
        reposts: post.metrics.reposts,
        quotes: post.metrics.quotes,
      }))
    }
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
  }

  return (
    <AppShell className="max-w-5xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">📊 대시보드</h1>
        <p className="text-sm text-muted-foreground">콘텐츠 성과를 분석해보세요.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Posts"
          value={analyticsData?.totalPosts.toLocaleString() || "-"}
        />
        <KPICard
          title="Avg Engagement (7d)"
          value={analyticsData?.periodStats.averageEngagement ? `${analyticsData.periodStats.averageEngagement}%` : "-"}
        />
        <KPICard title="Top Topic" value="TEST" subtext="TEST_TEST" />
        <KPICard title="Top Tag" value="TEST" subtext="TEST_TEST" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recently Posts</h2>
          <Link href="/posts">
            <Button variant="ghost" size="sm" className="text-muted-foreground cursor-pointer" >
              View all
            </Button>
          </Link>
        </div>
        <PostsTable posts={posts.length > 0 ? posts : []} detailed />
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
