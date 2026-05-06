"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const TEMPLATES = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Classic" },
  { id: "creative", label: "Creative" },
  { id: "minimal", label: "Minimal" },
] as const;

type ExtractedJob = {
  title: string | null;
  company: string | null;
  location: string | null;
  summary: string | null;
  skills: string[];
  requirements: string[];
};

export function JobUrlForm({ defaultTemplate }: { defaultTemplate: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"url" | "paste">("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [template, setTemplate] = useState(
    TEMPLATES.find((t) => t.id === defaultTemplate)?.id ?? "modern",
  );
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<ExtractedJob | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  async function onExtract(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setJob(null);
    setJobId(null);
    setExtracting(true);
    try {
      const res = await fetch("/api/jobs/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "url" ? { url } : { text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Extraction failed");
      setJob(data.job);
      setJobId(data.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  async function onGenerate() {
    if (!jobId) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/cv/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, template_id: template }),
      });
      const data = await res.json();
      if (res.status === 402) {
        router.push("/pricing?reason=quota");
        return;
      }
      if (!res.ok) throw new Error(data?.error || "Generation failed");
      router.push(`/dashboard/generations/${data.generation_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              mode === "url"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Paste a job URL
          </button>
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              mode === "paste"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Paste the description
          </button>
        </div>

        <form onSubmit={onExtract} className="space-y-3">
          {mode === "url" ? (
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/jobs/senior-engineer"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full job description here…"
              rows={10}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={extracting}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {extracting ? "Extracting…" : "Extract job"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </form>
      </div>

      {job && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Extracted job
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {job.title ?? "Untitled role"}
            </h2>
            <p className="text-sm text-gray-600">
              {[job.company, job.location].filter(Boolean).join(" · ") ||
                "Company unknown"}
            </p>
            {job.summary && (
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {job.summary}
              </p>
            )}
          </div>
          {job.skills.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Required skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              CV template
            </p>
            <div className="grid gap-2 sm:grid-cols-4">
              {TEMPLATES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    template === t.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generating
              ? "Tailoring your CV…"
              : "Generate tailored CV + cover letter"}
          </button>
        </div>
      )}
    </div>
  );
}
