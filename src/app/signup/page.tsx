"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Logo } from "@/components/logo";

const LINKEDIN_ENABLED =
  process.env.NEXT_PUBLIC_LINKEDIN_OIDC_ENABLED === "true";

const PERKS = [
  "Tailor your CV to any job in seconds",
  "ATS-readable HTML that recruiters can parse",
  "Cover letter included with every CV",
  "Free forever — no credit card to start",
];

function SignupForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "Almost there — check your inbox and click the link to confirm your account.",
      );
    }
    setLoading(false);
  }

  async function handleLinkedIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: form */}
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex justify-center lg:justify-start">
              <Logo size="lg" href="/" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Create your free account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have one?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>

            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              {LINKEDIN_ENABLED && (
                <>
                  <button
                    onClick={handleLinkedIn}
                    className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl bg-[#0A66C2] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#0959a8]"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Continue with LinkedIn
                  </button>
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-3 text-gray-400">
                        or use your email
                      </span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    {message}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="At least 6 characters"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create my free account"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-500">
                By creating an account you agree to our{" "}
                <Link
                  href="/legal/terms"
                  className="text-gray-700 hover:underline"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal/privacy"
                  className="text-gray-700 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Right: marketing panel */}
        <div className="hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 lg:flex lg:flex-col lg:justify-center lg:p-16 lg:text-white">
          <div className="max-w-md">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-200">
              Adam Careers
            </p>
            <h3 className="text-4xl font-extrabold leading-tight">
              Stop rewriting CVs.
              <br />
              <span className="text-blue-200">Start applying.</span>
            </h3>
            <p className="mt-6 text-lg leading-relaxed text-blue-100">
              Paste a job URL and get a tailored, ATS-ready CV plus cover
              letter in under a minute — built from your own profile, never
              invented.
            </p>
            <ul className="mt-10 space-y-4">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-200" />
                  <span className="text-sm text-blue-50">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
