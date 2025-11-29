import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { getCurrentUser } from "@/lib/api"
import { redirect } from "next/navigation"

// 페이지가 매번 동적으로 렌더링 되도록 함
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // 현재 로그인된 사용자 조회 (JWT 쿠키 기반). 실패하면 로그인 페이지로.
  let userId: string
  try {
    const me = await getCurrentUser()
    userId = me.threadsUserId
  } catch (error) {
    redirect("/login?error=threads_auth_failed")
  }

  return (
    <DashboardClient userId={userId} />
  )
}
