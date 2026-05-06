import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://adamcareers.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Adam Careers — Land your next job, 10× faster",
    template: "%s · Adam Careers",
  },
  description:
    "Paste a job URL and get a tailored, ATS-ready CV and cover letter in seconds. Powered by AI, designed by humans.",
  keywords: [
    "AI CV",
    "ATS resume",
    "cover letter generator",
    "job application",
    "AI career coach",
  ],
  alternates: { canonical: APP_URL },
  openGraph: {
    title: "Adam Careers — Land your next job, 10× faster",
    description:
      "Paste a job URL → get a tailored, ATS-ready CV and cover letter in seconds.",
    url: APP_URL,
    siteName: "Adam Careers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adam Careers — Land your next job, 10× faster",
    description: "Paste a job URL → tailored CV + cover letter in seconds.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
