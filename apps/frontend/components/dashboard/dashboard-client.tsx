"use client"

import { useEffect, useMemo, useState } from "react"
import { KPICard } from "@/components/kpi-card"
import { PostsTable, type Post } from "@/components/posts/posts-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { AppShell } from "@/components/layout/app-shell"
import {
  getAnalytics,
  getCategoryMetrics,
  syncUserData,
  type AnalyticsData,
  type CategoryMetrics,
  type SyncResult,
} from "@/lib/api"
import Link from "next/link"

type LoadState = "syncing" | "loading" | "ready" | "error"

interface DashboardClientProps {
  userId: string
}

const LAST_SYNC_KEY = "threadsLastSyncAt"
const SYNC_COOLDOWN_MS = 10 * 60 * 1000 // 10 minutes

export function DashboardClient({ userId }: DashboardClientProps) {
  const [status, setStatus] = useState<LoadState>("syncing")
  const [statusMessage, setStatusMessage] = useState("데이터 상태를 확인하고 있어요...")
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetrics[] | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        // 클라이언트 기준 10분 쿨다운 체크
        const now = Date.now()
        const lastSync = typeof window !== "undefined" ? Number(localStorage.getItem(LAST_SYNC_KEY) || 0) : 0
        const shouldSync = now - lastSync > SYNC_COOLDOWN_MS

        if (shouldSync) {
          setStatus("syncing")
          setStatusMessage("데이터 동기화 중입니다. 잠시만 기다려주세요...")
          const sync = await syncUserData()
          if (cancelled) return

          if (typeof window !== "undefined") {
            localStorage.setItem(LAST_SYNC_KEY, String(Date.now()))
          }

          setSyncResult(sync)
          setStatusMessage(
            sync.mode === "full" ? "모든 포스트를 정리하고 분석 중입니다." : "신규 포스트를 반영하고 있어요.",
          )
        } else {
          setStatus("loading")
          setStatusMessage("최근 10분 내 동기화 완료. 데이터 불러오는 중입니다...")
          setSyncResult({
            mode: "skipped",
            collectedCount: 0,
            analyzedCount: 0,
            skippedCount: 0,
            touchedPostIds: [],
            backgroundSyncStarted: false,
          })
        }

        setStatus("loading")

        const [analytics, metrics] = await Promise.all([
          getAnalytics(userId),
          getCategoryMetrics(userId),
        ])
        if (cancelled) return

        setAnalyticsData(analytics)
        setCategoryMetrics(metrics)
        if (analytics?.posts) {
          setPosts(
            analytics.posts.map((post) => ({
              id: post.id,
              title: post.caption
                ? post.caption.length > 50
                  ? post.caption.slice(0, 50) + "..."
                  : post.caption
                : "No Caption",
              date: new Date(post.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              topic: post.category || "Uncategorized",
              tags: post.tags || [],
              engagement: `${post.metrics.engagement}%`,
              views: post.metrics.views,
              likes: post.metrics.likes,
              replies: post.metrics.replies,
              reposts: post.metrics.reposts,
              quotes: post.metrics.quotes,
            })),
          )
        }
        setStatus("ready")
      } catch (err: any) {
        if (cancelled) return
        setError(err?.message ?? "데이터 준비 중 문제가 발생했어요.")
        setStatus("error")
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [userId])

  const progressValue = useMemo(() => {
    if (status === "ready") return 100
    if (status === "loading") return 70
    if (status === "syncing") return 35
    return 0
  }, [status])

  const loadingSteps = useMemo(
    () => [
      {
        label: "데이터 동기화",
        done: status !== "syncing" && status !== "error",
        active: status === "syncing",
      },
      {
        label: "분석 계산",
        done: status === "ready",
        active: status === "loading",
      },
    ],
    [status],
  )

  if (status !== "ready") {
    return (
      <AppShell
        className="max-w-5xl space-y-8"
        lockNavigation
        lockMessage="분석이 완료될 때까지 다른 메뉴로 이동할 수 없어요."
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">📊 대시보드</h1>
            <p className="text-sm text-muted-foreground">
              실시간으로 Threads 데이터를 수집하고 분석 결과를 준비 중입니다.
            </p>
          </div>

          <Card className="border-dashed">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">데이터 준비 중</CardTitle>
                <p className="text-sm text-muted-foreground">약간의 시간이 소요될 수 있어요.</p>
              </div>
              {status === "error" ? null : <Spinner className="h-6 w-6 text-primary" />}
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progressValue} />
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
              <div className="space-y-2">
                {loadingSteps.map((step) => (
                  <div key={step.label} className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        step.done ? "bg-green-500" : step.active ? "bg-primary" : "bg-muted-foreground/40"
                      }`}
                    />
                    <span className="text-sm text-foreground/80">{step.label}</span>
                  </div>
                ))}
              </div>
              {syncResult ? (
                <p className="text-xs text-muted-foreground">
                  {syncResult.mode === "full"
                    ? "첫 분석이라 모든 포스트를 수집하고 있어요."
                    : "최근 게시물 위주로 새 데이터를 반영하고 있어요."}
                </p>
              ) : null}
              {status === "error" ? (
                <div className="flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <span>{error}</span>
                  <Button size="sm" variant="outline" onClick={() => location.reload()}>
                    다시 시도
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell className="max-w-5xl space-y-8" lockNavigation={false}>
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">📊 대시보드</h1>
          <p className="text-sm text-muted-foreground">
            콘텐츠 성과를 분석해보세요. {syncResult?.mode === "full" ? "전체 동기화 완료" : "신규 데이터 반영"}됐어요.
          </p>
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
          <KPICard
            title="Top Topic"
            value={categoryMetrics?.[0]?.category || "-"}
            subtext={categoryMetrics?.[0] ? `${categoryMetrics[0].count} posts` : undefined}
          />
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
      </div>
    </AppShell>
  )
}
