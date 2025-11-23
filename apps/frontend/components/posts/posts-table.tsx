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
  saves: number
  score?: number
}

interface PostsTableProps {
  posts: Post[]
  detailed?: boolean
}

export function PostsTable({ posts, detailed = false }: PostsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Content Preview</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Tone</TableHead>
            <TableHead className="text-right">Eng. Rate</TableHead>
            <TableHead className="text-right">Saves</TableHead>
            {detailed && <TableHead className="text-right">Score</TableHead>}
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium text-muted-foreground text-xs whitespace-nowrap">{post.date}</TableCell>
              <TableCell className="max-w-[300px] truncate font-medium text-sm">{post.title}</TableCell>
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
              <TableCell className="text-right text-sm">{post.engagement}</TableCell>
              <TableCell className="text-right text-sm">{post.saves}</TableCell>
              {detailed && <TableCell className="text-right text-sm">{post.score}</TableCell>}
              <TableCell className="text-right">
                <Link href={`/posts/${post.id}`}>
                  <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                    Details
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
