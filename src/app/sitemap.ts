import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://adamcareers.com";
  const lastModified = new Date();
  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/login`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/signup`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/legal/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
