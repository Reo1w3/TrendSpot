"use client"

import { Download, ExternalLink, Package, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TrendBadge } from "@/components/trend-badge"
import { downloadCsv } from "@/lib/export-csv"
import type { Product } from "@/lib/types"

function ProductThumbnail({ product }: { product: Product }) {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.name}
          className="size-full object-cover"
          crossOrigin="anonymous"
        />
      ) : (
        <Package className="size-5 text-muted-foreground" aria-hidden="true" />
      )}
    </div>
  )
}

function Price({ value }: { value: number }) {
  return (
    <span className="font-mono text-sm tabular-nums">
      ${value.toFixed(2)}
    </span>
  )
}

interface ResultsTableProps {
  products: Product[]
  niche: string
}

export function ResultsTable({ products, niche }: ResultsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">
            {products.length} products found
            {niche ? (
              <span className="text-muted-foreground"> for &ldquo;{niche}&rdquo;</span>
            ) : null}
          </h2>
          <p className="text-xs text-muted-foreground">Sorted by trend momentum</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadCsv(products, `trends-${niche || "all"}.csv`)}
        >
          <Download className="mr-2 size-4" aria-hidden="true" />
          Export to CSV / Excel
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Product</TableHead>
            <TableHead>Trend Signal</TableHead>
            <TableHead>Sourcing Price</TableHead>
            <TableHead>Top Supplier</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <ProductThumbnail product={product} />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1.5 items-start">
                  <div className="flex items-center gap-2">
                    <TrendBadge trend={{ source: "Google Trends", label: product.trend.label }} />
                    <span className="text-sm font-bold font-mono text-foreground shrink-0 bg-muted px-1.5 py-0.5 rounded border border-border">
                      {product.trend.score > 0 ? `${product.trend.score} pts` : "N/A"}
                    </span>
                  </div>
                  {product.trend.momentum && (
                    <span className="text-xs text-muted-foreground">
                      Momentum:{" "}
                      <span
                        className={`font-semibold ${product.trend.score > 0 ? "text-emerald-500" : "text-amber-500/80"
                          }`}
                      >
                        {product.trend.momentum}
                      </span>
                    </span>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  {product.sourcingPrice > 0 ? (
                    <>
                      <Price value={product.sourcingPrice} />
                      {product.suggestedPrice != null && product.suggestedPrice > 0 && (
                        <span className="text-xs text-muted-foreground">
                          resell ${product.suggestedPrice.toFixed(2)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded w-fit border border-amber-500/20">
                      Check Link
                    </span>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{product.supplier.name}</span>
                    {product.supplier.rating > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Star className="size-3 fill-primary text-primary" aria-hidden="true" />
                        {product.supplier.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <a
                    href={product.supplier.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Direct Link
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                </div>
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadCsv([product], `${product.name}.csv`)}
                  aria-label={`Export ${product.name} to CSV`}
                >
                  <Download className="mr-1 size-4" aria-hidden="true" />
                  Export
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}