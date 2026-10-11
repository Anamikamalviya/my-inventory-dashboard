'use client'

import { useEffect, useState } from 'react'
import { Package, TriangleAlert, IndianRupee } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'
import AddProductForm from '@/components/AddProductForm'
import StockBarChart from '@/components/StockBarChart'
import SalesLineChart from '@/components/SalesLineChart'
import {
  daysRemaining,
  stockoutDate,
  getStatus,
  restockCost,
} from '@/lib/prediction'

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

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert(error.message)
    } else {
      loadProducts()
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  if (loading) return <p className="p-8">Loading...</p>
  if (error) return <p className="p-8 text-red-600">Error: {error}</p>

  const urgentProducts = products.filter((p) => getStatus(p) === 'urgent')
  const lowStockCount = products.filter((p) => getStatus(p) !== 'ok').length
  const totalRestockCost = products.reduce((sum, p) => sum + restockCost(p), 0)

  return (
    <main className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Inventory Dashboard</h1>

      {/* Metric cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-lg border bg-white p-4 text-black">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-lg border bg-white p-4 text-black">
          <TriangleAlert className="h-8 w-8 text-red-600" />
          <div>
            <p className="text-sm text-gray-500">Low-Stock Items</p>
            <p className="text-2xl font-bold">{lowStockCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-lg border bg-white p-4 text-black">
          <IndianRupee className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Predicted Restock Cost</p>
            <p className="text-2xl font-bold">
              ₹{totalRestockCost.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Urgent banner */}
      {urgentProducts.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">
            Urgent restock needed for {urgentProducts.length} product(s):
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {urgentProducts.map((p) => {
              const days = daysRemaining(p.current_stock, p.daily_avg_sales)
              return (
                <li key={p.id}>
                  {p.name} ({days === 0 ? 'out of stock' : `${days?.toFixed(1)} days left`})
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StockBarChart products={products} />
        <SalesLineChart />
      </div>

      <AddProductForm onAdded={loadProducts} />

      {/* Table (phone par side me scroll hoti hai) */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="border p-2 text-left">Image</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Category</th>
              <th className="border p-2 text-left">Stock</th>
              <th className="border p-2 text-left">Minimum</th>
              <th className="border p-2 text-left">Avg Daily Sales</th>
              <th className="border p-2 text-left">Days Left</th>
              <th className="border p-2 text-left">Stock-out Date</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const days = daysRemaining(p.current_stock, p.daily_avg_sales)
              const out = stockoutDate(days)
              const status = getStatus(p)
              return (
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
                  <td className="border p-2">
                    {days === null ? '—' : days.toFixed(1)}
                  </td>
                  <td className="border p-2">
                    {out ? out.toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="border p-2">
                    {status === 'urgent' && (
                      <span className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                        Urgent Restock
                      </span>
                    )}
                    {status === 'low' && (
                      <span className="rounded bg-amber-500 px-2 py-1 text-xs font-semibold text-white">
                        Low Stock
                      </span>
                    )}
                    {status === 'ok' && (
                      <span className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="rounded bg-gray-200 px-2 py-1 text-xs text-black hover:bg-red-600 hover:text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}