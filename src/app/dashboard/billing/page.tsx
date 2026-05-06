import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkCvQuota } from "@/lib/quota/check";
import { BillingPortalButton } from "@/components/billing-portal-button";

export const metadata = {
  title: "Billing — Adam Careers",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select(
      "plan_id, status, billing_cycle, current_period_end, cancel_at_period_end, stripe_customer_id, trial_end",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: plan } = await supabase
    .from("plans")
    .select("name, monthly_cv_quota")
    .eq("id", sub?.plan_id ?? "free")
    .maybeSingle();

  const quota = await checkCvQuota(supabase, user.id);

  const used = quota.used;
  const limit = quota.limit;
  const usagePct =
    limit === null ? 100 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-600">
          Your subscription and monthly usage.
        </p>
      </div>

      {sp.success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Subscription active. Welcome aboard!
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Current plan
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {plan?.name ?? "Free"}
          </p>
          <p className="text-sm text-gray-500">
            Status: {sub?.status ?? "active"}
            {sub?.cancel_at_period_end ? " · cancels at period end" : ""}
          </p>
          {sub?.current_period_end && (
            <p className="mt-2 text-xs text-gray-500">
              Renews on{" "}
              {new Date(sub.current_period_end).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            {sub?.stripe_customer_id ? (
              <BillingPortalButton />
            ) : (
              <Link
                href="/pricing"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Upgrade plan
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            This month
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {used} {limit === null ? "" : `/ ${limit}`} CVs
          </p>
          <p className="text-sm text-gray-500">
            {limit === null ? "Unlimited" : "Resets on the 1st of next month"}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${usagePct}%` }}
            />
          </div>
          {!quota.allowed && (
            <Link
              href="/pricing"
              className="mt-4 inline-block rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Upgrade for more
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
