import type { Product } from "./types"

function escapeCell(value: string | number): string {
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/** Converts products to a CSV string that Excel / Sheets can open. */
export function productsToCsv(products: Product[]): string {
  const headers = [
    "Product Name",
    "Category",
    "Trend Source",
    "Trend Signal",
    "Sourcing Price (USD)",
    "Suggested Price (USD)",
    "Supplier",
    "Supplier Rating",
    "Supplier Link",
  ]
  const rows = products.map((p) => [
    p.name,
    p.category,
    p.trend.source,
    p.trend.label,
    p.sourcingPrice.toFixed(2),
    p.suggestedPrice != null ? p.suggestedPrice.toFixed(2) : "",
    p.supplier.name,
    p.supplier.rating.toFixed(1),
    p.supplier.url,
  ])
  return [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n")
}

/** Triggers a client-side download of the given products as a .csv file. */
export function downloadCsv(products: Product[], filename = "product-research.csv"): void {
  const csv = productsToCsv(products)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
