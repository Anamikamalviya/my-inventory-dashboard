import type { Product } from './types'

export type StockStatus = 'urgent' | 'low' | 'ok'

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