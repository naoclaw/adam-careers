"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@heroicons/react/24/outline";

export type PricingTier = {
  id: "free" | "pro" | "unlimited";
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  quotaLabel: string;
  cta: string;
  features: string[];
  highlight?: boolean;
};

export function PricingTiers({
  tiers,
  authed,
}: {
  tiers: PricingTier[];
  authed: boolean;
}) {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="mt-12">
      <div className="flex justify-center">
        <div className="inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-gray-200">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                cycle === c
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {c === "monthly" ? "Monthly" : "Yearly"}
              {c === "yearly" && (
                <span className="ml-1.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                  Save 22%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {tiers.map((t) => (
          <TierCard key={t.id} tier={t} cycle={cycle} authed={authed} />
        ))}
      </div>
    </div>
  );
}

function TierCard({
  tier,
  cycle,
  authed,
}: {
  tier: PricingTier;
  cycle: "monthly" | "yearly";
  authed: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = cycle === "monthly" ? tier.monthly : tier.yearly;
  const isFree = tier.id === "free";

  async function handleCheckout() {
    if (isFree) return;
    if (!authed) {
      router.push(`/signup?next=/pricing`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: tier.id, cycle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not start checkout");
      if (data.url) window.location.href = data.url;
      else throw new Error("Checkout URL missing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-8 transition ${
        tier.highlight
          ? "border-blue-600 shadow-xl ring-1 ring-blue-100"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {tier.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
          Most popular
        </span>
      )}

      <div>
        <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{tier.tagline}</p>
      </div>

      <div className="mt-6">
        {price === 0 ? (
          <p className="text-4xl font-extrabold text-gray-900">Free</p>
        ) : (
          <p className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-gray-900">
              ${cycle === "yearly" ? Math.round(price / 12) : price}
            </span>
            <span className="text-sm font-medium text-gray-500">/month</span>
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {price === 0
            ? "Forever — no credit card."
            : cycle === "yearly"
              ? `Billed annually — $${price}/year`
              : "Billed monthly. Cancel anytime."}
        </p>
        <p className="mt-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {tier.quotaLabel}
        </p>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {isFree ? (
          <Link
            href={authed ? "/dashboard" : "/signup"}
            className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            {authed ? "Go to dashboard" : tier.cta}
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition disabled:opacity-50 ${
              tier.highlight
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {loading ? "Loading…" : tier.cta}
          </button>
        )}
        {error && (
          <p className="mt-2 text-center text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
