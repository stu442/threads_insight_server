import { AppShell } from "@/components/layout/app-shell"
import { PostsTable, type Post } from "@/components/posts/posts-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"

const MOCK_POSTS: Post[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `post-${i + 1}`,
  title: [
    "5 Ways to Boost Productivity Without Burnout",
    "Why I Stopped Using To-Do Lists",
    "The Future of Remote Work in 2025",
    "My Morning Routine for Maximum Focus",
    "How to Learn New Skills Fast",
    "The Art of Deep Work",
    "Minimalism in Digital Design",
    "Understanding React Server Components",
    "Building Scalable Systems",
    "The Psychology of Habit Formation",
  ][i],
  date: `Oct ${24 - i}`,
  topic: ["Productivity", "Self-dev", "Work", "Lifestyle", "Learning"][i % 5],
  tone: ["Insightful", "Controversial", "Analytical", "Personal", "Educational"][i % 5],
  engagement: `${(Math.random() * 5 + 2).toFixed(1)}%`,
  saves: Math.floor(Math.random() * 300) + 50,
}))

export default function PostsPage() {
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

      <PostsTable posts={MOCK_POSTS} />

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
