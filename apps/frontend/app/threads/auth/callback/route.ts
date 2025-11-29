"use server"

import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return NextResponse.json({ success: false, error: "code is required" }, { status: 400 })
  }

  const url = new URL(`${API_URL}/threads/auth/callback`)
  url.searchParams.set("code", code)
  if (state) url.searchParams.set("state", state)

  try {
    const resp = await fetch(url.toString(), { method: "GET", cache: "no-store" })
    const data = await resp.json()
    if (!resp.ok || data?.success === false) {
      return NextResponse.json({ success: false, error: data?.error || "Token exchange failed" }, { status: 500 })
    }

    // TODO: Persist token, map to user, and redirect to dashboard
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to exchange code" }, { status: 500 })
  }
}
