import { AppShell } from "@/components/layout/app-shell"
import { PostsTable, type Post } from "@/components/posts/posts-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"
import { getAnalytics, getCurrentUser, type AnalyticsData } from "@/lib/api"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

const FALLBACK_TOPICS = ["Productivity", "Growth", "Strategy", "Community", "Tech"]
const FALLBACK_TAGS = ["#productivity", "#threads", "#growth", "#marketing", "#dev"]
const DEFAULT_PAGE_SIZE = 10

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

type PostsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const parseNumberParam = (value: string | string[] | undefined, fallback: number, min: number) => {
  const parsed = Number(Array.isArray(value) ? value[0] : value)
  if (Number.isNaN(parsed) || parsed < min) return fallback
  return parsed
}

const buildPageLink = (page: number, pageSize: number, totalPages?: number) => {
  const clampedPage = Math.max(1, totalPages ? Math.min(page, totalPages) : page)
  const params = new URLSearchParams()
  if (clampedPage > 1) params.set("page", String(clampedPage))
  if (pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(pageSize))
  const query = params.toString()
  return query ? `/posts?${query}` : "/posts"
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const currentPage = parseNumberParam(resolvedSearchParams.page, 1, 1)
  const currentPageSize = parseNumberParam(resolvedSearchParams.pageSize, DEFAULT_PAGE_SIZE, 1)

  let posts: Post[] = []
  let pagination: AnalyticsData["pagination"] | undefined

  let userId: string
  try {
    const me = await getCurrentUser()
    userId = me.threadsUserId
  } catch (error) {
    redirect("/login?error=threads_auth_failed")
  }

  try {
    const analyticsData = await getAnalytics(userId, {
      page: currentPage,
      pageSize: currentPageSize,
    })
    pagination = analyticsData?.pagination

    posts =
      analyticsData?.posts?.map((post, index) => {
        const topic = FALLBACK_TOPICS[index % FALLBACK_TOPICS.length]

        return {
          id: post.id,
          title: post.caption ? truncateText(post.caption, 70) : "No Caption",
          date: new Date(post.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          topic,
          tags: post.tags || [], // Use actual tags from API
          engagement: post.metrics?.engagement !== undefined ? `${post.metrics.engagement}%` : "-",
          views: post.metrics?.views ?? 0,
          likes: post.metrics?.likes ?? 0,
          replies: post.metrics?.replies ?? 0,
          reposts: post.metrics?.reposts ?? 0,
          quotes: post.metrics?.quotes ?? 0,
        }
      }) || []
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
  }

  return (
    <AppShell className="max-w-5xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">📄 Posts</h1>
        <p className="text-sm text-muted-foreground">Browse and analyze your posts</p>
      </div>

      <div className="flex gap-2 w-full justify-end sm:w-auto">
        <Select>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="productivity">Productivity</SelectItem>
            <SelectItem value="self-dev">Self-dev</SelectItem>
            <SelectItem value="work">Work</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="insightful">Insightful</SelectItem>
            <SelectItem value="educational">Educational</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PostsTable posts={posts} />

      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Page {pagination?.page ?? currentPage} of {pagination?.totalPages ?? Math.max(currentPage, 1)}
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={!(pagination?.hasPrev ?? currentPage > 1)}
            className={!(pagination?.hasPrev ?? currentPage > 1) ? "opacity-60 cursor-not-allowed" : ""}
          >
            <Link
              href={buildPageLink(
                Math.max(1, (pagination?.page ?? currentPage) - 1),
                currentPageSize,
                pagination?.totalPages
              )}
            >
              Previous
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={
              pagination
                ? !pagination.hasNext
                : posts.length < currentPageSize
            }
            className={
              (pagination
                ? !pagination.hasNext
                : posts.length < currentPageSize)
                ? "opacity-60 cursor-not-allowed"
                : ""
            }
          >
            <Link
              href={buildPageLink(
                (pagination?.page ?? currentPage) + 1,
                currentPageSize,
                pagination?.totalPages
              )}
            >
              Next
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
