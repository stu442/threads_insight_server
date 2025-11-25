import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ThreadsProfile {
  id: string
  username: string
  name?: string
  avatar?: string
  threads_profile_picture_url?: string
  profile_picture_url?: string // legacy
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

async function fetchProfile(): Promise<ThreadsProfile | null> {
  try {
    const res = await fetch(`${API_URL}/threads/profile`, {
      // 캐싱 + 5분마다 재검증 (App Shell 서버렌더링용)
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`Failed with ${res.status}`)
    const json = await res.json()
    return json.data ?? json
  } catch (err) {
    // 서버 컴포넌트라 콘솔에만 남기고, UI는 폴백으로 처리
    console.error("Failed to load Threads profile", err)
    return null
  }
}

export async function ThreadsAvatar() {
  const profile = await fetchProfile()
  const avatarUrl = profile?.avatar ?? profile?.threads_profile_picture_url ?? profile?.profile_picture_url
  const fallbackText = profile?.username?.[0]?.toUpperCase() || "?"

  return (
    <Link href="/dashboard" className="cursor-pointer">
      <Avatar className="h-8 w-8">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={profile?.username ? `${profile.username} avatar` : "Threads avatar"} />}
        <AvatarFallback className={cn("text-xs")}>{fallbackText}</AvatarFallback>
      </Avatar>
    </Link>
  )
}
