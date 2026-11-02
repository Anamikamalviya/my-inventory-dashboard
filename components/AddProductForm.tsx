"use client";

import { useRef, useState } from "react";            // added useRef
import { X } from "lucide-react";                    // added X icon
import { supabase } from "@/lib/supabaseClient";

type Props = {
  onAdded: () => void;
};

export default function AddProductForm({ onAdded }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [threshold, setThreshold] = useState("10");
  const [dailySales, setDailySales] = useState("2.5");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);   // added

  // added: clears both React state and the browser's file input
  function clearFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    setError("");

    if (!name.trim() || stock === "") {
      setError("Name and stock are required");
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | null = null;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Image upload failed");
        }
        imageUrl = data.url;
      }

      const { error: insertError } = await supabase.from("products").insert({
        name: name.trim(),
        category: category.trim() || null,
        current_stock: Number(stock),
        min_threshold: Number(threshold),
        daily_avg_sales: Number(dailySales),
        image_url: imageUrl,
      });

      if (insertError) throw new Error(insertError.message);

      setName("");
      setCategory("");
      setStock("");
      setThreshold("10");
      setDailySales("2.5");
      clearFile();                                       // changed: was setFile(null)
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "border rounded px-3 py-2 w-full";

  return (
    <div className="border rounded-lg p-4 mb-6 bg-white text-black">
      <h2 className="text-lg font-semibold mb-3">Add product</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={inputClass} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputClass} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input className={inputClass} type="number" placeholder="Current stock" value={stock} onChange={(e) => setStock(e.target.value)} />
        <input className={inputClass} type="number" placeholder="Min threshold" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        <input className={inputClass} type="number" step="0.1" placeholder="Avg daily sales" value={dailySales} onChange={(e) => setDailySales(e.target.value)} />

        {/* changed: file input wrapped with a remove button */}
        <div className="relative">
          <input
            ref={fileInputRef}
            className={`${inputClass} pr-12`}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file && (
            <button
              type="button"
              onClick={clearFile}
              disabled={loading}
              aria-label="Remove selected file"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-200 p-1 text-black hover:bg-red-600 hover:text-white disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add product"}
      </button>
    </div>
  );
}