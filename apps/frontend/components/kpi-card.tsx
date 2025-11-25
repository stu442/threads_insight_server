import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface KPICardProps {
  title: string
  value: string | number
  subtext?: string
  className?: string
  icon?: ReactNode
}

export function KPICard({ title, value, subtext, className, icon }: KPICardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex shrink-0 items-center justify-center text-muted-foreground">
              {icon}
            </span>
          )}
          <CardTitle className="text-sm font-medium leading-none text-muted-foreground">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  )
}
