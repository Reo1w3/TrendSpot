export type TrendSource = "TikTok Ads" | "Google Trends" | "Facebook Ads" | "Amazon" | "Instagram"

export interface TrendData {
  score: number
  label: string
  momentum: string
}

export interface SupplierData {
  name: string
  url: string
  rating: number
  orders_completed: number
}

export interface Product {
  id: string
  name: string
  category: string
  imageUrl?: string
  sourcingPrice: number
  suggestedPrice?: number
  trend: TrendData
  supplier: SupplierData
}

export interface TrendSignal {
  source: TrendSource
  label: string
  change?: number
}