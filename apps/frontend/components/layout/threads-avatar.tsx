"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useThreadsProfile } from "@/hooks/use-threads-profile"

export function ThreadsAvatar() {
  const { profile, isLoading } = useThreadsProfile()
  const avatarUrl = profile?.avatar ?? profile?.threads_profile_picture_url ?? profile?.profile_picture_url
  const fallbackText = profile?.username?.[0]?.toUpperCase() || "?"

  return (
    <Link href="/dashboard" className={cn("cursor-pointer", isLoading && "pointer-events-none opacity-70")} aria-disabled={isLoading}>
      <Avatar className="h-8 w-8">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={profile?.username ? `${profile.username} avatar` : "Threads avatar"} />}
        <AvatarFallback className={cn("text-xs")}>{isLoading ? "…" : fallbackText}</AvatarFallback>
      </Avatar>
    </Link>
  )
}
