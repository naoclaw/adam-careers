import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/service";
import {
  sendSubscriptionActiveEmail,
  sendSubscriptionCanceledEmail,
  sendPaymentFailedEmail,
} from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("Webhook signature failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supa = createServiceClient();
  if (!supa) {
    console.error("Webhook: no service role client");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata?.user_id ?? "") as string;
        if (!userId || !session.subscription || !session.customer) break;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer.id;
        const subscription = await stripe.subscriptions.retrieve(subId);
        await upsertSubscription(supa, userId, customerId, subscription);
        const email = session.customer_details?.email ?? null;
        const planName = session.metadata?.plan_id ?? "Pro";
        await sendSubscriptionActiveEmail({
          userId,
          toEmail: email,
          planName: planName.charAt(0).toUpperCase() + planName.slice(1),
        });
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = (subscription.metadata?.user_id ?? "") as string;
        if (!userId) break;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        await upsertSubscription(supa, userId, customerId, subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = (subscription.metadata?.user_id ?? "") as string;
        if (!userId) break;
        await supa
          .from("subscriptions")
          .update({
            plan_id: "free",
            status: "canceled",
            stripe_subscription_id: null,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
        const { data: u } = await supa
          .from("profiles")
          .select("email")
          .eq("id", userId)
          .maybeSingle();
        await sendSubscriptionCanceledEmail({
          userId,
          toEmail: u?.email ?? null,
        });
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;
        if (!customerId) break;
        const { data: sub } = await supa
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (!sub) break;
        await supa
          .from("subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("user_id", sub.user_id);
        await sendPaymentFailedEmail({
          userId: sub.user_id,
          toEmail: invoice.customer_email ?? null,
        });
        break;
      }
    }
  } catch (err) {
    console.error("webhook handler error", event.type, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  supa: NonNullable<ReturnType<typeof createServiceClient>>,
  userId: string,
  customerId: string,
  subscription: Stripe.Subscription,
) {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.id ?? null;

  // Map price id → plan id by querying plans table
  let planId = "pro";
  if (priceId) {
    const { data: plan } = await supa
      .from("plans")
      .select("id")
      .or(
        `stripe_monthly_price_id.eq.${priceId},stripe_yearly_price_id.eq.${priceId}`,
      )
      .maybeSingle();
    if (plan?.id) planId = plan.id;
  }
  const cycle =
    subscription.items?.data?.[0]?.price?.recurring?.interval === "year"
      ? "yearly"
      : "monthly";

  // Stripe types vary by API version; cast loosely for portability.
  const sub = subscription as unknown as {
    current_period_end?: number;
    cancel_at_period_end?: boolean;
    trial_end?: number | null;
  };

  await supa.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: planId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      billing_cycle: cycle,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: !!sub.cancel_at_period_end,
      trial_end: sub.trial_end
        ? new Date(sub.trial_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}
