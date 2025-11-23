import { AppShell } from "@/components/layout/app-shell"
import { PostsTable, type Post } from "@/components/posts/posts-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"
import { getAnalytics } from "@/lib/api"

// TODO: Replace with actual user ID from auth context
const USER_ID = "32547435728232967"
const FALLBACK_TOPICS = ["Productivity", "Growth", "Strategy", "Community", "Tech"]
const FALLBACK_TAGS = ["#productivity", "#threads", "#growth", "#marketing", "#dev"]

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

export default async function PostsPage() {
  let posts: Post[] = []

  try {
    const analyticsData = await getAnalytics(USER_ID)

    posts =
      analyticsData?.posts?.map((post, index) => {
        const topic = FALLBACK_TOPICS[index % FALLBACK_TOPICS.length]
        const tags = [
          FALLBACK_TAGS[index % FALLBACK_TAGS.length],
          FALLBACK_TAGS[(index + 2) % FALLBACK_TAGS.length],
        ]

        return {
          id: post.id,
          title: post.caption ? truncateText(post.caption, 70) : "No Caption",
          date: new Date(post.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          topic,
          tags,
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search in content..." className="pl-9 w-full" />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
              <SelectValue placeholder="Tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="insightful">Insightful</SelectItem>
              <SelectItem value="educational">Educational</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="story">Story</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <PostsTable posts={posts} />

      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">Page 1 of 5</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
