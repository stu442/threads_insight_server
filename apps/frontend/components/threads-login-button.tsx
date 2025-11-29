"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import { useThreadsLogin } from "@/hooks/use-threads-login"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ThreadsLoginButtonProps extends ButtonProps {
  children?: ReactNode
}

export function ThreadsLoginButton({ children = "로그인", className, ...props }: ThreadsLoginButtonProps) {
  const { startLogin, loading } = useThreadsLogin()

  return (
    <Button
      type="button"
      onClick={startLogin}
      disabled={loading}
      className={cn(className)}
      {...props}
    >
      {children}
    </Button>
  )
}
