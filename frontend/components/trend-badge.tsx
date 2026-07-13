import { TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { TrendSignal } from "@/lib/types"

export function TrendBadge({ trend }: { trend: TrendSignal }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{trend.source}</span>
      <Badge variant="success">
        <TrendingUp aria-hidden="true" />
        {trend.label}
      </Badge>
    </div>
  )
}
