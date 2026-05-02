"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
  email: string | null;
  headline: string | null;
  linkedin_url: string | null;
  summary: string | null;
  location: string | null;
};

export default function DashboardLinkedInPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState("");

  async function loadProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name,email,headline,linkedin_url,summary,location")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(data);
  }

  useEffect(() => { loadProfile(); }, []);

  async function handleImport() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/linkedin/import", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Import failed");
      setImported(true);
      await loadProfile();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  const fields: { label: string; key: keyof Profile }[] = [
    { label: "Name", key: "full_name" },
    { label: "Email", key: "email" },
    { label: "Headline", key: "headline" },
    { label: "Location", key: "location" },
    { label: "LinkedIn URL", key: "linkedin_url" },
    { label: "Summary", key: "summary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">LinkedIn Import</h1>
        <p className="text-sm text-gray-600 mt-1">
          Import your LinkedIn profile to auto-fill your CV and personalise your AI career coach.
        </p>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-blue-900">
            {imported ? "✅ Profile imported!" : "Sync your LinkedIn profile"}
          </p>
          <p className="text-sm text-blue-700 mt-0.5">
            {imported
              ? "Your profile data has been saved and is ready for CV generation."
              : "One click — we fetch your profile via your connected LinkedIn account."}
          </p>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
        <button
          onClick={handleImport}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-2 bg-[#0A66C2] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#0959a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          )}
          {loading ? "Importing..." : "Import from LinkedIn"}
        </button>
      </div>

      {profile && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Saved profile data</h2>
          <dl className="grid gap-4 md:grid-cols-2">
            {fields.map(({ label, key }) => (
              <div key={key}>
                <dt className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">{label}</dt>
                <dd className="text-sm text-gray-800 font-medium">
                  {key === "linkedin_url" && profile[key] ? (
                    <a href={profile[key]!} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profile[key]}
                    </a>
                  ) : (
                    profile[key] ?? <span className="text-gray-400 italic">Not set</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
