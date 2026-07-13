"use client"

import { useState, useEffect } from "react"
import { Sparkles, Zap, Search } from "lucide-react"

import { SearchHero } from "@/components/search-hero"
import { ResultsTable } from "@/components/results-table"
import { EmptyState, LoadingState } from "@/components/results-states"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Product } from "@/lib/types"

export function ProductResearchDashboard() {
  const [results, setResults] = useState<Product[] | null>(null)
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [hotTags, setHotTags] = useState<string[]>([])

  // Obtiene las tendencias reales e históricas
  useEffect(() => {
    const loadTrends = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/hot-tags')
        if (res.ok) {
          const data = await res.json()
          setHotTags(data)
        }
      } catch (e) {
        console.error("Error al cargar tendencias reales:", e)
      }
    }

    if (!isLoading) {
      loadTrends()
    }
  }, [isLoading])

  const handleSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);
    setQuery(searchQuery);
    setSuggestedKeywords([]); // Limpiamos sugerencias anteriores

    try {
      // Disparamos la carga de productos y sugerencias en paralelo
      const [response, keywordsResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/research?niche=${encodeURIComponent(searchQuery)}`),
        fetch(`http://localhost:3001/api/trends/keywords?niche=${encodeURIComponent(searchQuery)}`)
      ]);

      if (!response.ok) {
        throw new Error("Error al conectar con el servidor de analíticas.");
      }

      const data = await response.json();
      setResults(data);

      if (keywordsResponse.ok) {
        const keywordsData = await keywordsResponse.json();
        setSuggestedKeywords(keywordsData.keywords || []);
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasSearched = results !== null || isLoading

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="size-6 text-emerald-500 fill-emerald-500" />
            <span className="text-lg font-bold tracking-tight">TrendSpot</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4">
        <div className={hasSearched ? "py-8" : "flex min-h-[70dvh] items-center py-8"}>
          <div className="w-full space-y-8">
            <SearchHero
              onSearch={handleSearch}
              isLoading={isLoading}
              hotTags={hotTags}
              compact={hasSearched}
            />

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading ? (
              <LoadingState />
            ) : results !== null ? (
              results.length > 0 ? (
                <div className="space-y-6">
                  {/* Píldoras de búsquedas sugeridas de Amazon */}
                  {suggestedKeywords.length > 0 && (
                    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:gap-4">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 shrink-0">
                        <Sparkles className="size-4 text-amber-500 fill-amber-500" />
                        Related Searches:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {suggestedKeywords.map((kw) => (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => handleSearch(kw)}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary hover:border-muted-foreground"
                          >
                            <Search className="size-3" />
                            {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <ResultsTable products={results} niche={query} />
                </div>
              ) : (
                <EmptyState />
              )
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}