'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'
import AddProductForm from '@/components/AddProductForm'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadProducts() {
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      setError(error.message)
    } else {
      setProducts(data as Product[])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  if (loading) return <p className="p-8">Loading...</p>
  if (error) return <p className="p-8 text-red-600">Error: {error}</p>

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Inventory Dashboard</h1>

      <AddProductForm onAdded={loadProducts} />

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100 text-black">
          <tr>
            <th className="border p-2 text-left">Image</th>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Category</th>
            <th className="border p-2 text-left">Stock</th>
            <th className="border p-2 text-left">Minimum</th>
            <th className="border p-2 text-left">Avg Daily Sales</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No image</span>
                )}
              </td>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.category}</td>
              <td className="border p-2">{p.current_stock}</td>
              <td className="border p-2">{p.min_threshold}</td>
              <td className="border p-2">{p.daily_avg_sales}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}