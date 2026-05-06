"use client";

import { useState } from "react";

const TEMPLATES = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Classic" },
  { id: "creative", label: "Creative" },
  { id: "minimal", label: "Minimal" },
] as const;

export function GenerationView({
  generationId,
  initialTemplate,
  coverLetter,
  matchScore,
  matchedSkills,
  missingSkills,
  job,
}: {
  generationId: string;
  initialTemplate: string;
  coverLetter: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  job: { title: string | null; company: string | null; source_url: string | null } | null;
}) {
  const [template, setTemplate] = useState(initialTemplate);
  const [copied, setCopied] = useState(false);

  const previewSrc = `/api/cv/${generationId}/html?template=${template}`;
  const downloadHref = `/api/cv/${generationId}/html?template=${template}&download=1`;

  async function copyCoverLetter() {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  template === t.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <a
              href={previewSrc}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Open in new tab
            </a>
            <a
              href={downloadHref}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Download .html
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <iframe
            key={template}
            src={previewSrc}
            title="CV preview"
            className="h-[80vh] w-full"
          />
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Job
          </p>
          <p className="mt-1 font-semibold text-gray-900">
            {job?.title ?? "Untitled role"}
          </p>
          <p className="text-sm text-gray-600">{job?.company ?? "—"}</p>
          {job?.source_url && (
            <a
              href={job.source_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-blue-600 hover:underline"
            >
              View original posting
            </a>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Match score
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-blue-600">
              {matchScore}
            </span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${Math.min(100, matchScore)}%` }}
            />
          </div>
        </div>

        {matchedSkills.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              You match on
            </p>
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {missingSkills.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-700">
              Skills they ask, you don&rsquo;t have
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Add what you have honestly to your profile to boost your next match.
            </p>
          </div>
        )}

        {coverLetter && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Cover letter
              </p>
              <button
                type="button"
                onClick={copyCoverLetter}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {coverLetter}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
