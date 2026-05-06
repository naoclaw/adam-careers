import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Billing is not configured yet" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    plan_id?: string;
    cycle?: "monthly" | "yearly";
  };
  const planId = body.plan_id;
  const cycle = body.cycle === "yearly" ? "yearly" : "monthly";
  if (!planId || planId === "free") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { data: plan } = await supabase
    .from("plans")
    .select("id, name, stripe_monthly_price_id, stripe_yearly_price_id")
    .eq("id", planId)
    .maybeSingle();
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const priceId =
    cycle === "yearly" ? plan.stripe_yearly_price_id : plan.stripe_monthly_price_id;
  if (!priceId) {
    return NextResponse.json(
      { error: "This plan is not configured in Stripe yet" },
      { status: 503 },
    );
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = sub?.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: planId === "pro" ? 7 : undefined,
      metadata: { user_id: user.id, plan_id: planId, cycle },
    },
    metadata: { user_id: user.id, plan_id: planId, cycle },
    success_url: `${appUrl}/dashboard/billing?success=1`,
    cancel_url: `${appUrl}/pricing?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
