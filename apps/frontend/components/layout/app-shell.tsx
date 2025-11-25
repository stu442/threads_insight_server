import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ThreadsAvatar } from "@/components/layout/threads-avatar"

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <span className="text-lg tracking-tight">NO_NAME_PROJECT</span>
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/posts" className="text-muted-foreground transition-colors hover:text-foreground">
                Posts
              </Link>
              <Link href="/analyze" className="text-muted-foreground transition-colors hover:text-foreground">
                Analyze
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThreadsAvatar />
          </div>
        </div>
      </header>
      <main className={cn("flex-1 container mx-auto px-4 py-8 md:px-6", className)}>{children}</main>
    </div>
  )
}
