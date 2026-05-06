"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PricingCheckoutButton({
  planId,
  label,
  primary = false,
  requiresAuth = false,
}: {
  planId: string;
  label: string;
  primary?: boolean;
  requiresAuth?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (requiresAuth) {
      router.push(`/signup?next=/pricing`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId, cycle: "monthly" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not start checkout");
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Checkout URL missing");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className={`block w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition disabled:opacity-50 ${
          primary
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        {loading ? "Loading…" : label}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
