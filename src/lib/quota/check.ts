import type { SupabaseClient } from "@supabase/supabase-js";

export type QuotaVerdict = {
  allowed: boolean;
  plan: string;
  used: number;
  limit: number | null; // null = unlimited
  reason?: string;
};

export async function checkCvQuota(
  supabase: SupabaseClient,
  userId: string,
): Promise<QuotaVerdict> {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id, status")
    .eq("user_id", userId)
    .maybeSingle();

  const planId = sub?.plan_id ?? "free";
  const status = sub?.status ?? "active";

  const { data: plan } = await supabase
    .from("plans")
    .select("monthly_cv_quota")
    .eq("id", planId)
    .maybeSingle();

  const limit = plan?.monthly_cv_quota ?? 3;

  if (status === "past_due" || status === "canceled" || status === "incomplete") {
    if (planId !== "free") {
      // Fall back to free quota if a paid sub is in trouble
      return await checkAgainstLimit(supabase, userId, "free", 3);
    }
  }

  return await checkAgainstLimit(supabase, userId, planId, limit);
}

async function checkAgainstLimit(
  supabase: SupabaseClient,
  userId: string,
  planId: string,
  limit: number | null,
): Promise<QuotaVerdict> {
  const periodStart = firstOfMonthIso();

  const { data: usage } = await supabase
    .from("usage_counters")
    .select("cv_count")
    .eq("user_id", userId)
    .eq("period_start", periodStart)
    .maybeSingle();

  const used = usage?.cv_count ?? 0;

  if (limit === null) {
    return { allowed: true, plan: planId, used, limit: null };
  }
  if (used >= limit) {
    return {
      allowed: false,
      plan: planId,
      used,
      limit,
      reason: "monthly_limit_reached",
    };
  }
  return { allowed: true, plan: planId, used, limit };
}

function firstOfMonthIso(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
