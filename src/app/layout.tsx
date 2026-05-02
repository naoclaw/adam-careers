import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Adam Careers — Your AI Job Helper",
  description:
    "Land your dream job faster with AI-powered CV building, cover letters, and personalized job coaching.",
  keywords: ["job search", "AI career", "CV builder", "cover letter", "resume"],
  openGraph: {
    title: "Adam Careers — Your AI Job Helper",
    description: "Land your dream job faster with AI.",
    url: "https://adamcareers.com",
    siteName: "Adam Careers",
    type: "website",
  },
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
