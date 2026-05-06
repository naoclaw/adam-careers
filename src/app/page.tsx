import Link from "next/link";
import {
  BriefcaseIcon,
  SparklesIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { Logo } from "@/components/logo";

const features = [
  {
    icon: SparklesIcon,
    title: "Paste any job URL",
    description:
      "Drop in a link to a posting on LinkedIn, Indeed, or any career page. We pull out the role, requirements, and skills automatically.",
  },
  {
    icon: DocumentTextIcon,
    title: "Tailored in seconds",
    description:
      "Our AI rewrites your summary and bullets to match the job — using only what's actually in your profile, never inventing.",
  },
  {
    icon: BriefcaseIcon,
    title: "ATS-readable HTML",
    description:
      "Real semantic HTML that applicant-tracking systems can parse — not pixel-baked PDFs that lose their structure.",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Cover letter included",
    description:
      "Each generation comes with a 250-350 word cover letter, specific to the company and the role. Copy and ship.",
  },
  {
    icon: UserCircleIcon,
    title: "Match score + skill gap",
    description:
      "See how well you match each job and exactly which skills the posting asks for that aren't yet on your profile.",
  },
  {
    icon: CloudArrowUpIcon,
    title: "Your data, your control",
    description:
      "Your profile and CVs are private to your account. Cancel any time — your data is exportable and deletable.",
  },
];

const steps = [
  {
    step: "01",
    title: "Build your profile",
    desc: "Sign up free, then add your experience and skills — or import from LinkedIn.",
  },
  {
    step: "02",
    title: "Paste a job URL",
    desc: "We extract the role, the company, and the exact skills they ask for.",
  },
  {
    step: "03",
    title: "Get a tailored CV",
    desc: "Pick a template and AI rewrites your CV plus a cover letter for that specific job.",
  },
  {
    step: "04",
    title: "Download and apply",
    desc: "Open in browser, print to PDF, or download the ATS-ready HTML. Ship it.",
  },
];

const reasons = [
  {
    title: "It's truthful",
    desc: "We rewrite what's in your profile — we don't invent jobs, dates, or metrics. ATS-readable, recruiter-credible.",
  },
  {
    title: "It's specific",
    desc: "Every CV is rebuilt around the job you paste. Different posting, different tailored summary and bullets.",
  },
  {
    title: "It saves hours",
    desc: "What used to be 90 minutes of editing per application becomes 30 seconds. So you can apply to more, better.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" href="/" />
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a
              href="#features"
              className="hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-blue-600 transition-colors"
            >
              How it works
            </a>
            <Link
              href="/pricing"
              className="hover:text-blue-600 transition-colors"
            >
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 glass text-blue-200 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <SparklesIcon className="w-4 h-4" />
            <span>Powered by Grok AI</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Paste a job URL.
            <br />
            <span className="gradient-text">Get a tailored CV.</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Drop in a link to any job posting. We extract the requirements and
            rewrite your CV and cover letter to match — in under a minute, in
            ATS-ready HTML.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-lg"
            >
              Start for free
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 glass text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-all text-lg"
            >
              Sign in
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-10 text-blue-200 text-sm">
            {["No credit card required", "Free to start", "Cancel anytime"].map(
              (t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  <span>{t}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Everything you need to get hired
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              From your first application to your offer letter — Adam Careers
              has you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                  <f.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-500">
              Get your career moving in 4 simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-3/4 w-1/2 h-0.5 bg-blue-100" />
                )}
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-5 shadow-lg shadow-blue-200">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it's different */}
      <section id="why" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Why people pick Adam
            </h2>
            <p className="text-xl text-gray-500">
              We built this for one thing: getting you to the interview, faster.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reasons.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl bg-white border border-gray-100 p-8"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {r.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-extrabold text-white mb-6">
            Ready to find your dream job?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Start building your AI-powered career profile today. Free forever,
            no credit card needed.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-10 py-5 rounded-xl hover:bg-blue-50 transition-all shadow-2xl hover:-translate-y-0.5 text-xl"
          >
            Get started for free
            <ArrowRightIcon className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Logo variant="light" size="sm" href="/" />
            <p className="text-sm">© 2026 Adam Careers. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/legal/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <a
                href="mailto:hello@adamcareers.com"
                className="hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
