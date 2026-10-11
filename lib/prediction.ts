import type { Product } from './types'

export type StockStatus = 'urgent' | 'low' | 'ok'

export const TARGET_COVER_DAYS = 14

export function daysRemaining(stock: number, avgDailySales: number): number | null {
  const s = Number(stock)
  const a = Number(avgDailySales)
  if (s <= 0) return 0
  if (!a || a <= 0) return null
  return s / a
}

export function stockoutDate(days: number | null): Date | null {
  if (days === null) return null
  const d = new Date()
  d.setDate(d.getDate() + Math.ceil(days))
  return d
}

export function getStatus(p: Product): StockStatus {
  const days = daysRemaining(p.current_stock, p.daily_avg_sales)
  if (days !== null && days < 5) return 'urgent'
  if (p.current_stock <= p.min_threshold) return 'low'
  return 'ok'
}

// Itne units mangwane padenge taaki TARGET_COVER_DAYS din ka stock ho jaye
export function unitsNeeded(p: Product): number {
  const need = Math.ceil(TARGET_COVER_DAYS * Number(p.daily_avg_sales) - Number(p.current_stock))
  return need > 0 ? need : 0
}

export function restockCost(p: Product): number {
  return unitsNeeded(p) * Number(p.unit_cost ?? 0)
}