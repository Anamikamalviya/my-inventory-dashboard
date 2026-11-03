'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Item = { id: string; name: string; current_stock: number };

export default function RecordSaleCard({
  products,
  onSaved,
}: {
  products: Item[];
  onSaved: () => void | Promise<void>;
}) {
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const selected = products.find((p) => p.id === productId);

  const submit = async () => {
    const quantity = Number(qty);

    if (!productId) {
      setMessage({ text: 'Choose a product.', ok: false });
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setMessage({ text: 'Enter a whole number greater than 0.', ok: false });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.rpc('record_sale', {
      p_product_id: productId,
      p_qty: quantity,
    });

    setSaving(false);

    if (error) {
      setMessage({ text: error.message, ok: false });
      return;
    }

    setMessage({ text: `Recorded sale of ${quantity} x ${selected?.name}.`, ok: true });
    setQty('');
    await onSaved();
  };

  return (
    <div className="mb-6 rounded-lg border bg-white p-5 text-black">
      <h2 className="mb-3 text-lg font-bold">Record sale</h2>

      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="rounded border p-3"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (stock: {p.current_stock})
            </option>
          ))}
        </select>

        <input
          className="rounded border p-3"
          type="number"
          min={1}
          placeholder="Quantity sold"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
      </div>

      <button
        onClick={submit}
        disabled={saving}
        className="mt-3 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Record sale'}
      </button>

      {message && (
        <p className={`mt-2 text-sm ${message.ok ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}