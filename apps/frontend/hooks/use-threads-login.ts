"use client"

import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export function useThreadsLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/threads/auth/url`)
      const result = await response.json()

      if (!response.ok || result.success === false) {
        throw new Error(result.error || "Failed to get Threads login URL")
      }

      const authorizeUrl = result.data?.url
      if (!authorizeUrl) {
        throw new Error("Authorize URL is missing in the response")
      }

      // Redirect user to Threads authorize page
      window.location.href = authorizeUrl
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start Threads login"
      console.error(message)
      setError(message)
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return { startLogin, loading, error }
}
