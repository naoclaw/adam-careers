import Link from "next/link";
import { CheckIcon, MinusIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import { PricingTiers, type PricingTier } from "@/components/pricing-tiers";

export const metadata = {
  title: "Pricing — Adam Careers",
  description:
    "Free forever plan, plus Pro and Unlimited tiers when you need more tailored CVs.",
};

const TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Try the full experience.",
    monthly: 0,
    yearly: 0,
    quotaLabel: "3 CVs / month",
    cta: "Get started free",
    features: [
      "3 tailored CVs per month",
      "Cover letter with every CV",
      "ATS-readable HTML output",
      "Match score + skill gaps",
      "1 CV template",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For active job seekers.",
    monthly: 9,
    yearly: 84,
    quotaLabel: "30 CVs / month",
    cta: "Start 7-day free trial",
    highlight: true,
    features: [
      "30 tailored CVs per month",
      "All 4 professional templates",
      "AI career coach (chat)",
      "LinkedIn profile import",
      "Priority email support",
      "Export to PDF or HTML",
    ],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    tagline: "Apply without limits.",
    monthly: 19,
    yearly: 180,
    quotaLabel: "Unlimited CVs",
    cta: "Go Unlimited",
    features: [
      "Unlimited tailored CVs",
      "All Pro features",
      "Faster generation queue",
      "Early access to new templates",
      "Priority support",
    ],
  },
];

const COMPARISON: { feature: string; values: (string | boolean)[] }[] = [
  {
    feature: "Tailored CVs per month",
    values: ["3", "30", "Unlimited"],
  },
  { feature: "Cover letter generator", values: [true, true, true] },
  { feature: "ATS-readable HTML output", values: [true, true, true] },
  { feature: "Match score + skill gaps", values: [true, true, true] },
  { feature: "Professional templates", values: ["1", "All 4", "All 4"] },
  { feature: "AI career coach (chat)", values: [false, true, true] },
  { feature: "LinkedIn profile import", values: [false, true, true] },
  { feature: "Priority generation queue", values: [false, false, true] },
  { feature: "Email support", values: ["Community", "Priority", "Priority"] },
];

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your billing portal in one click — your access continues until the end of the current period.",
  },
  {
    q: "What happens after the free trial?",
    a: "We'll email you a few days before the trial ends. If you do nothing, the trial cancels and you stay on the Free plan.",
  },
  {
    q: "Do you store my CVs?",
    a: "Yes, in your account, encrypted at rest. You can export or delete everything from your dashboard at any time.",
  },
  {
    q: "Will the AI invent things on my CV?",
    a: "No. The model rewrites and reorders what's already on your profile to match the job. It never fabricates jobs, dates, or metrics.",
  },
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; canceled?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size="md" href="/" />
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-medium text-gray-700 hover:text-blue-600"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Simple, honest pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Start free. Upgrade only when you&rsquo;re applying to a lot of
            jobs. Cancel any time.
          </p>
          {sp.reason === "quota" && (
            <p className="mx-auto mt-6 max-w-md rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              You&rsquo;ve used all your free CVs this month. Upgrade for more
              tailoring.
            </p>
          )}
          {sp.canceled && (
            <p className="mx-auto mt-6 max-w-md rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700">
              Checkout canceled. No charges were made.
            </p>
          )}
        </div>

        <PricingTiers tiers={TIERS} authed={!!user} />

        {/* Comparison */}
        <section className="mt-24">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Compare every feature
          </h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Feature
                  </th>
                  {TIERS.map((t) => (
                    <th
                      key={t.id}
                      className={`px-6 py-4 text-center font-semibold ${
                        t.highlight ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 1 ? "bg-gray-50" : ""}
                  >
                    <td className="px-6 py-3 text-gray-800">{row.feature}</td>
                    {row.values.map((v, j) => (
                      <td
                        key={j}
                        className="px-6 py-3 text-center text-gray-700"
                      >
                        {typeof v === "boolean" ? (
                          v ? (
                            <CheckIcon className="mx-auto h-5 w-5 text-emerald-600" />
                          ) : (
                            <MinusIcon className="mx-auto h-5 w-5 text-gray-300" />
                          )
                        ) : (
                          <span className="font-medium">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-24">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Questions, answered
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
            {FAQ.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <p className="font-semibold text-gray-900">{f.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-16 text-center text-sm text-gray-500">
          All prices in USD. Need a team plan?{" "}
          <a
            href="mailto:hello@adamcareers.com"
            className="font-semibold text-blue-600 hover:underline"
          >
            Get in touch
          </a>
          .
        </p>
      </main>

      <footer className="bg-gray-900 py-10 text-gray-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <Logo variant="light" size="sm" href="/" />
          <p className="text-sm">© 2026 Adam Careers. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/legal/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-white">
              Terms
            </Link>
            <a
              href="mailto:hello@adamcareers.com"
              className="hover:text-white"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
