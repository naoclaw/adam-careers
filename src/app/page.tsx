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

const features = [
  {
    icon: ChatBubbleLeftRightIcon,
    title: "AI Career Coach",
    description:
      "Chat with your personal AI powered by Grok — get tailored advice, interview prep, and job search strategy 24/7.",
  },
  {
    icon: DocumentTextIcon,
    title: "Smart CV Builder",
    description:
      "Import from LinkedIn or upload your PDF/Word file. Our AI analyzes and enhances it instantly.",
  },
  {
    icon: SparklesIcon,
    title: "4 Professional Templates",
    description:
      "Choose from Modern, Classic, Creative, or Minimal designs. Export a polished CV and cover letter in seconds.",
  },
  {
    icon: UserCircleIcon,
    title: "LinkedIn Integration",
    description:
      "Link your LinkedIn account to import your profile and leverage your professional network for job opportunities.",
  },
  {
    icon: CloudArrowUpIcon,
    title: "Your Documents, Secure",
    description:
      "All your CVs, cover letters, and files are stored securely — accessible anywhere, always yours.",
  },
  {
    icon: BriefcaseIcon,
    title: "Job Match Intelligence",
    description:
      "Get AI-scored job matches based on your profile. Know exactly where you stand before you apply.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up in 30 seconds with your email or LinkedIn.",
  },
  {
    step: "02",
    title: "Import your profile",
    desc: "Upload your CV or connect LinkedIn — AI parses everything.",
  },
  {
    step: "03",
    title: "Build & customize",
    desc: "Choose a template, let AI enhance your content, export your perfect CV.",
  },
  {
    step: "04",
    title: "Chat & apply",
    desc: "Ask your AI coach anything. Get interview-ready. Land the job.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Software Engineer",
    avatar: "SM",
    text: "I updated my CV with Adam Careers and got 3 interviews in one week. The AI suggestions were spot on.",
  },
  {
    name: "James K.",
    role: "Marketing Manager",
    avatar: "JK",
    text: "The cover letter templates saved me hours. Clean, professional, and the AI tailored each one to the job.",
  },
  {
    name: "Amira L.",
    role: "Product Designer",
    avatar: "AL",
    text: "The LinkedIn import feature is magic. My entire work history was parsed in seconds. Incredible tool.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <BriefcaseIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              Adam Careers
            </span>
          </div>
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
            <a
              href="#testimonials"
              className="hover:text-blue-600 transition-colors"
            >
              Stories
            </a>
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
            Land your dream job
            <br />
            <span className="gradient-text">10x faster</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered career companion. Build a stunning CV, write
            compelling cover letters, and get personalized coaching — all in one
            place.
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

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Real people. Real results.
            </h2>
            <p className="text-xl text-gray-500">
              Join thousands who found their next opportunity with Adam Careers.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-400">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex gap-0.5 mt-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      className="w-4 h-4 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
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
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <BriefcaseIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Adam Careers</span>
            </div>
            <p className="text-sm">© 2026 Adam Careers. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
