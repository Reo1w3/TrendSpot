import { Loader2, SearchX } from "lucide-react"

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-16 text-center shadow-sm">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Scanning trends and suppliers...</p>
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center">
      <SearchX className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">No products found</p>
      <p className="text-xs text-muted-foreground">Try a different niche or one of the hot tags.</p>
    </div>
  )
}
