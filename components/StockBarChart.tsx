"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { Product } from "@/lib/types";

export default function StockBarChart({ products }: { products: Product[] }) {
  const data = products.map((p) => ({
    name: p.name,
    Stock: p.current_stock,
    Minimum: p.min_threshold,
  }));

  return (
    <div className="rounded-lg border bg-white p-4 text-black">
      <h2 className="mb-3 font-semibold">Current stock vs minimum threshold</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Stock" fill="#2563eb" />
            <Bar dataKey="Minimum" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}