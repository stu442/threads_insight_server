"use client"

import { useEffect, useState } from "react"
import { fetchAPI } from "@/lib/api"

interface ThreadsProfile {
  id: string
  username: string
  name?: string
  avatar?: string
}

interface UseThreadsProfileState {
  profile: ThreadsProfile | null
  isLoading: boolean
  error: string | null
}

// 간단한 클라이언트 측 캐시 (탭/세션 내 재요청 방지)
let profileCache: ThreadsProfile | null = null
let profilePromise: Promise<ThreadsProfile> | null = null

export function useThreadsProfile(): UseThreadsProfileState {
  const [profile, setProfile] = useState<ThreadsProfile | null>(profileCache)
  const [isLoading, setIsLoading] = useState(!profileCache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      try {
        // 이미 캐시된 값이 있으면 즉시 반환
        if (profileCache) {
          setProfile(profileCache)
          setIsLoading(false)
          return
        }

        // 진행 중인 요청이 없으면 새로 시작
        if (!profilePromise) {
          profilePromise = fetchAPI<ThreadsProfile>("/threads/profile")
            .then((data) => {
              profileCache = data
              return data
            })
            .catch((err) => {
              profilePromise = null
              throw err
            })
        }

        const data = await profilePromise
        if (!cancelled) {
          setProfile(data)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load Threads profile")
          setIsLoading(false)
        }
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [])

  return { profile, isLoading, error }
}
