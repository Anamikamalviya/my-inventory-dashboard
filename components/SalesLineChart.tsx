"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";

type Point = { date: string; units: number };

export default function SalesLineChart() {
  const [data, setData] = useState<Point[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: rows, error } = await supabase
        .from("sales")
        .select("quantity_sold, sale_date")
        .limit(5000);

      if (error) {
        setError(error.message);
        return;
      }

      // Group by date: har din ki total bikri jodo
      const totals: Record<string, number> = {};
      for (const r of rows ?? []) {
        const day = new Date(r.sale_date).toLocaleDateString("en-CA");
        totals[day] = (totals[day] ?? 0) + r.quantity_sold;
      }

      const points = Object.entries(totals)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, units]) => ({ date, units }));

      setData(points);
    }
    load();
  }, []);

  return (
    <div className="rounded-lg border bg-white p-4 text-black">
      <h2 className="mb-3 font-semibold">Total units sold per day</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="units" stroke="#16a34a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}