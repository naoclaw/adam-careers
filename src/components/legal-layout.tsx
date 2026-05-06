import Link from "next/link";
import { Logo } from "@/components/logo";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size="md" href="/" />
          <nav className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="/legal/privacy" className="hover:text-blue-600">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-blue-600">
              Terms
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to home
        </Link>
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 sm:p-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {updated}</p>
          <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-gray-700">
            {children}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-sm text-gray-500 md:flex-row">
          <p>© 2026 Adam Careers. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/pricing" className="hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/legal/privacy" className="hover:text-gray-900">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-gray-900">
              Terms
            </Link>
            <a
              href="mailto:hello@adamcareers.com"
              className="hover:text-gray-900"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-8 text-xl font-bold text-gray-900 first:mt-0">
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-gray-700">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="ml-5 list-disc space-y-2 text-[15px] leading-relaxed text-gray-700 marker:text-blue-500">
      {children}
    </ul>
  );
}
