const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

function daysRemaining(stock, avgDailySales) {
  const s = Number(stock);
  const a = Number(avgDailySales);
  if (s <= 0) return 0;
  if (!a || a <= 0) return null;
  return s / a;
}

export const handler = async () => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=id,name,current_stock,min_threshold,daily_avg_sales`,
    { headers }
  );
  if (!res.ok) {
    throw new Error(`Could not read products: ${res.status} ${await res.text()}`);
  }
  const products = await res.json();
  console.log(`Found ${products.length} products`);

  const now = new Date();
  const urgentNames = [];
  let updated = 0;

  for (const p of products) {
    const days = daysRemaining(p.current_stock, p.daily_avg_sales);

    let stockout = null;
    if (days !== null) {
      const d = new Date();
      d.setDate(d.getDate() + Math.ceil(days));
      stockout = d.toISOString().slice(0, 10);
    }

    let status = "ok";
    if (days !== null && days < 5) status = "urgent";
    else if (Number(p.current_stock) <= Number(p.min_threshold)) status = "low";

    if (status === "urgent") urgentNames.push(p.name);

    const upd = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${p.id}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({
        days_remaining: days === null ? null : Number(days.toFixed(2)),
        predicted_stockout: stockout,
        status,
        last_predicted_at: now.toISOString(),
      }),
    });

    if (!upd.ok) {
      console.error(`Update failed for ${p.name}: ${upd.status} ${await upd.text()}`);
    } else {
      updated++;
    }
  }

  console.log(`Updated ${updated} of ${products.length} products`);
  console.log(`Urgent items (${urgentNames.length}): ${urgentNames.join(", ") || "none"}`);

  return { updated, total: products.length, urgent: urgentNames };
};