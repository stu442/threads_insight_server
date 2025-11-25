import { AppShell } from "@/components/layout/app-shell"
import { KPICard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowUpRight, Eye, Heart, MessageCircle, Repeat2, TrendingUp } from "lucide-react"
import { notFound } from "next/navigation"

import { getPost } from "@/lib/api"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params

  let post;
  try {
    post = await getPost(id);
  } catch (error) {
    // If post is not found, show 404 page
    notFound();
  }

  const insights = post.insights[0] || {
    views: 0,
    likes: 0,
    replies: 0,
    reposts: 0,
    quotes: 0
  };

  const analytics = post.analytics || {
    engagementRate: 0,
    tags: [],
    category: 'Uncategorized'
  };

  return (
    <AppShell className="max-w-3xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">📌 Post Detail</h1>
        <p className="text-sm text-muted-foreground">
          ID: {post.id} · Published on {new Date(post.timestamp).toLocaleDateString()} · {new Date(post.timestamp).toLocaleTimeString()}
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Original Content</CardTitle>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs bg-transparent" asChild>
                <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                  Open in Threads <ArrowUpRight className="h-3 w-3" />
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {post.caption}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 grid-cols-2 sm:grid-cols-5">
          <KPICard title="Views" value={insights.views.toLocaleString()} icon={<Eye className="h-4 w-4" />} />
          <KPICard title="Likes" value={insights.likes.toLocaleString()} icon={<Heart className="h-4 w-4" />} />
          <KPICard title="Replies" value={insights.replies.toLocaleString()} icon={<MessageCircle className="h-4 w-4" />} />
          <KPICard title="Reposts" value={insights.reposts.toLocaleString()} icon={<Repeat2 className="h-4 w-4" />} />
          <KPICard title="Eng. Rate" value={`${analytics.engagementRate.toFixed(1)}% `} icon={<TrendingUp className="h-4 w-4" />} />
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
                  <Badge variant="outline">{analytics.category || 'Uncategorized'}</Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground block">Keywords</span>
                <div className="flex flex-wrap gap-2">
                  {analytics.tags && analytics.tags.length > 0 ? (
                    analytics.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="font-normal text-muted-foreground">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tags available</span>
                  )}
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
