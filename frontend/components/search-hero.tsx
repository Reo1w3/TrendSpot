"use client"

import type React from "react"
import { useState } from "react"
import { Search, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchHeroProps {
  onSearch: (niche: string) => void
  isLoading: boolean
  hotTags: string[] // Prop para recibir las tendencias reales
  compact?: boolean
}

export function SearchHero({ onSearch, isLoading, hotTags, compact = false }: SearchHeroProps) {
  const [value, setValue] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isLoading) return
    onSearch(value)
  }

  function handleTag(tag: string) {
    setValue(tag)
    if (!isLoading) onSearch(tag)
  }

  return (
    <section
      className={`mx-auto flex w-full max-w-2xl flex-col items-center text-center ${compact ? "gap-4" : "gap-6"
        }`}
    >
      {!compact && (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            AI-powered product research
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Find winning products before they blow up
            </h1>
            <p className="mx-auto max-w-md text-pretty text-muted-foreground leading-relaxed">
              Enter a niche and instantly surface trending products, traffic signals, and verified
              suppliers.
            </p>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter your niche (e.g., Fitness, Pets, Tech...)"
              aria-label="Product niche"
              className="h-11 pl-9"
            />
          </div>
          <Button type="submit" size="lg" disabled={isLoading} className="h-11 px-5">
            {isLoading ? "Searching..." : "Find Trends & Suppliers"}
          </Button>
        </div>
      </form>

      {/* Solo se muestran los hot tags si existen búsquedas reales en el historial */}
      {hotTags && hotTags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Hot tags:</span>
          {hotTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTag(tag)}
              disabled={isLoading}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}