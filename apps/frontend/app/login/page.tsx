import { ThreadsLoginButton } from "@/components/threads-login-button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function LoginErrorPage({
  searchParams,
}: {
  searchParams?: { error?: string }
}) {
  const errorMessage =
    searchParams?.error === "threads_auth_failed"
      ? "Threads 인증에 실패했어요. 잠시 후 다시 시도해 주세요."
      : "로그인 처리 중 문제가 발생했어요."

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-foreground">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wide">Login Error</span>
        </div>
        <h1 className="text-2xl font-semibold">로그인에 실패했습니다</h1>
        <p className="mt-3 text-sm text-muted-foreground">{errorMessage}</p>

        <div className="mt-8 flex flex-col gap-3">
          <ThreadsLoginButton>다시 로그인하기</ThreadsLoginButton>
          <Link
            href="/"
            className="text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
