"use client"

import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ThreadsAvatar } from "@/components/layout/threads-avatar"

interface AppShellProps {
  children: React.ReactNode
  className?: string
  lockNavigation?: boolean
  lockMessage?: string
}

export function AppShell({ children, className, lockNavigation = false, lockMessage }: AppShellProps) {
  const navLinkClass = cn(
    "text-muted-foreground transition-colors hover:text-foreground",
    lockNavigation && "pointer-events-none opacity-50 cursor-not-allowed",
  )

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className={cn("flex items-center gap-2 font-semibold", lockNavigation && "pointer-events-none")}
              aria-disabled={lockNavigation}
              tabIndex={lockNavigation ? -1 : 0}
            >
              <span className="text-lg tracking-tight">NO_NAME_PROJECT</span>
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className={navLinkClass}
                aria-disabled={lockNavigation}
                tabIndex={lockNavigation ? -1 : 0}
              >
                Dashboard
              </Link>
              <Link
                href="/posts"
                className={navLinkClass}
                aria-disabled={lockNavigation}
                tabIndex={lockNavigation ? -1 : 0}
              >
                Posts
              </Link>
              <Link
                href="/analyze"
                className={navLinkClass}
                aria-disabled={lockNavigation}
                tabIndex={lockNavigation ? -1 : 0}
              >
                Analyze
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThreadsAvatar />
          </div>
        </div>
        {lockNavigation ? (
          <div className="border-t bg-amber-50 text-amber-900 text-sm px-4 py-2 md:px-6">
            {lockMessage || "분석이 진행 중입니다. 완료 후 이동할 수 있어요."}
          </div>
        ) : null}
      </header>
      <main
        className={cn("flex-1 container mx-auto px-4 py-8 md:px-6", className)}
        aria-busy={lockNavigation || undefined}
      >
        {children}
      </main>
    </div>
  )
}
