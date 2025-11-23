import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface Post {
  id: string
  title: string
  date: string
  topic: string
  tone: string
  engagement: string
  views: number
  likes: number
  replies: number
  reposts: number
  quotes: number
}

interface PostsTableProps {
  posts: Post[]
  detailed?: boolean
}

export function PostsTable({ posts, detailed = false }: PostsTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Content Preview</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Tone</TableHead>
            <TableHead className="text-center">Eng. Rate</TableHead>
            <TableHead className="text-center">Views</TableHead>
            <TableHead className="text-center">Likes</TableHead>
            <TableHead className="text-center">Replies</TableHead>
            <TableHead className="text-center">Reposts</TableHead>
            <TableHead className="text-center">Quotes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium text-muted-foreground text-xs whitespace-nowrap">{post.date}</TableCell>
              <TableCell className="max-w-[250px] truncate font-medium text-sm">{post.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal text-xs">
                  {post.topic}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="font-normal text-xs bg-muted text-muted-foreground hover:bg-muted/80"
                >
                  {post.tone}
                </Badge>
              </TableCell>
              <TableCell className="text-center text-sm">{post.engagement}</TableCell>
              <TableCell className="text-cente text-sm">{post.views.toLocaleString()}</TableCell>
              <TableCell className="text-center text-sm">{post.likes.toLocaleString()}</TableCell>
              <TableCell className="text-center text-sm">{post.replies.toLocaleString()}</TableCell>
              <TableCell className="text-center text-sm">{post.reposts.toLocaleString()}</TableCell>
              <TableCell className="text-center text-sm">{post.quotes.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
