// Email sender. Uses Resend if RESEND_API_KEY is set, otherwise no-ops.
// All sends are logged to email_log via the service-role client when
// available; we fall back to console logging if no service key is set.

import { createServiceClient } from "@/lib/supabase/service";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

type SendArgs = {
  type: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId?: string | null;
};

async function send({ type, to, subject, html, text, userId }: SendArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM ?? "Adam Careers <hello@adamcareers.com>";

  if (!apiKey) {
    console.info("[email] (skipped — no RESEND_API_KEY)", { type, to, subject });
    return { ok: false, skipped: true };
  }

  let providerId: string | null = null;
  let status = "queued";
  let errorText: string | null = null;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text: text ?? stripTags(html),
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      status = "failed";
      errorText =
        (data && (data.message || data.error)) ?? `HTTP ${res.status}`;
    } else {
      status = "sent";
      providerId = data?.id ?? null;
    }
  } catch (err) {
    status = "failed";
    errorText = err instanceof Error ? err.message : String(err);
  }

  const supa = createServiceClient();
  if (supa) {
    await supa
      .from("email_log")
      .insert({
        user_id: userId ?? null,
        type,
        to_email: to,
        subject,
        status,
        provider_id: providerId,
        error: errorText,
      });
  }

  return { ok: status === "sent", providerId, error: errorText };
}

function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const APP_URL = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "https://adamcareers.com";

function shell(content: string) {
  return `<!DOCTYPE html>
<html><body style="font-family: -apple-system, sans-serif; background: #f9fafb; padding: 32px; color: #111827;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
    <tr><td>
      <p style="font-weight: 700; font-size: 18px; color: #2563eb; margin: 0 0 24px;">Adam Careers</p>
      ${content}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px;" />
      <p style="font-size: 12px; color: #6b7280;">You received this because you have an Adam Careers account at ${APP_URL()}.</p>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendWelcomeEmail(args: {
  userId: string;
  toEmail: string | null;
  fullName: string | null;
}) {
  if (!args.toEmail) return;
  const name = args.fullName?.split(" ")[0] ?? "there";
  await send({
    type: "welcome",
    to: args.toEmail,
    subject: "Welcome to Adam Careers",
    userId: args.userId,
    html: shell(`
      <h1 style="font-size: 24px; margin: 0 0 12px;">Welcome, ${name}.</h1>
      <p style="line-height: 1.5; margin: 0 0 16px;">You just got a personal AI career coach. Here's how to make the most of it:</p>
      <ol style="padding-left: 18px; line-height: 1.6;">
        <li>Complete your profile (or import from LinkedIn).</li>
        <li>Paste any job URL — we'll extract the requirements and tailor your CV in seconds.</li>
        <li>Download an ATS-optimized HTML CV and a cover letter, ready to send.</li>
      </ol>
      <p style="margin: 24px 0 0;">
        <a href="${APP_URL()}/dashboard" style="background: #2563eb; color: #fff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;">Go to dashboard</a>
      </p>
    `),
  });
}

export async function sendCvReadyEmail(args: {
  userId: string;
  toEmail: string | null;
  generationId: string;
  jobTitle: string | null;
  company: string | null;
}) {
  if (!args.toEmail) return;
  const role = args.jobTitle ?? "your role";
  const company = args.company ? ` at ${args.company}` : "";
  await send({
    type: "cv_ready",
    to: args.toEmail,
    subject: `Your CV for ${role}${company} is ready`,
    userId: args.userId,
    html: shell(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">Your tailored CV is ready</h1>
      <p style="line-height: 1.5;">We've tailored your CV and a cover letter for <strong>${role}${company}</strong>.</p>
      <p style="margin: 24px 0 0;">
        <a href="${APP_URL()}/dashboard/generations/${args.generationId}" style="background: #2563eb; color: #fff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;">Open your CV</a>
      </p>
    `),
  });
}

export async function sendSubscriptionActiveEmail(args: {
  userId: string;
  toEmail: string | null;
  planName: string;
}) {
  if (!args.toEmail) return;
  await send({
    type: "subscription_active",
    to: args.toEmail,
    subject: `Welcome to Adam Careers ${args.planName}`,
    userId: args.userId,
    html: shell(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">You're on ${args.planName}</h1>
      <p style="line-height: 1.5;">Your subscription is active. Generate as many tailored CVs as you need.</p>
      <p style="margin: 24px 0 0;">
        <a href="${APP_URL()}/dashboard" style="background: #2563eb; color: #fff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;">Open dashboard</a>
      </p>
    `),
  });
}

export async function sendSubscriptionCanceledEmail(args: {
  userId: string;
  toEmail: string | null;
}) {
  if (!args.toEmail) return;
  await send({
    type: "subscription_canceled",
    to: args.toEmail,
    subject: "Your Adam Careers subscription was canceled",
    userId: args.userId,
    html: shell(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">Subscription canceled</h1>
      <p style="line-height: 1.5;">You can still use the free plan, and you can resubscribe any time.</p>
      <p style="margin: 24px 0 0;">
        <a href="${APP_URL()}/pricing" style="background: #2563eb; color: #fff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;">See plans</a>
      </p>
    `),
  });
}

export async function sendPaymentFailedEmail(args: {
  userId: string;
  toEmail: string | null;
}) {
  if (!args.toEmail) return;
  await send({
    type: "payment_failed",
    to: args.toEmail,
    subject: "Action needed: payment failed",
    userId: args.userId,
    html: shell(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">Your last payment failed</h1>
      <p style="line-height: 1.5;">Please update your card to keep your subscription active.</p>
      <p style="margin: 24px 0 0;">
        <a href="${APP_URL()}/dashboard/billing" style="background: #2563eb; color: #fff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;">Manage billing</a>
      </p>
    `),
  });
}
