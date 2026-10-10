export type Product = {
  id: string
  name: string
  category: string | null
  current_stock: number
  min_threshold: number
  daily_avg_sales: number
  image_url: string | null
  created_at: string
}