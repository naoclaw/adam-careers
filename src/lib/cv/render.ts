// CV HTML renderers. Pure functions — given a profile, a job, and the AI's
// tailored content, return a self-contained HTML string. ATS-friendly:
// semantic headings, no images, plain Unicode, real text (no SVG icons).
//
// Each template uses inline <style>; no external CSS so the file works as a
// download or as the body of a print-to-PDF.

import type { FullProfile } from "@/lib/profile/types";
import type { TailoredCV } from "./generate";

export type TemplateId = "modern" | "classic" | "creative" | "minimal";

const TEMPLATE_NAMES: Record<TemplateId, string> = {
  modern: "Modern",
  classic: "Classic",
  creative: "Creative",
  minimal: "Minimal",
};

export function isTemplateId(s: string | null | undefined): s is TemplateId {
  return s === "modern" || s === "classic" || s === "creative" || s === "minimal";
}

export type RenderInput = {
  profile: FullProfile;
  tailored: TailoredCV;
  template: TemplateId;
  watermark?: boolean;
};

export function renderCv({
  profile,
  tailored,
  template,
  watermark,
}: RenderInput): string {
  switch (template) {
    case "classic":
      return renderClassic(profile, tailored, !!watermark);
    case "creative":
      return renderCreative(profile, tailored, !!watermark);
    case "minimal":
      return renderMinimal(profile, tailored, !!watermark);
    case "modern":
    default:
      return renderModern(profile, tailored, !!watermark);
  }
}

export function templateLabel(t: TemplateId): string {
  return TEMPLATE_NAMES[t];
}

// ─── helpers ──────────────────────────────────────────────────────────────

function escapeHtml(s: string | null | undefined): string {
  if (s == null) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRange(start: string | null, end: string | null, current: boolean): string {
  const fmt = (d: string | null) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleString("en-US", { month: "short", year: "numeric" });
  };
  const s = fmt(start);
  const e = current ? "Present" : fmt(end);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

function htmlList(items: string[]): string {
  if (!items.length) return "";
  return `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

function watermarkBlock(show: boolean): string {
  if (!show) return "";
  return `<div class="watermark">Generated with Adam Careers — adamcareers.com</div>`;
}

// ─── Modern (two-column-ish, blue accent) ─────────────────────────────────

function renderModern(p: FullProfile, t: TailoredCV, wm: boolean): string {
  const expBlocks = matchExperiences(p, t)
    .map(
      (e) => `
      <article>
        <header class="exp-head">
          <div>
            <h3>${escapeHtml(e.title)}</h3>
            <p class="company">${escapeHtml(e.company)}${e.location ? ` · ${escapeHtml(e.location)}` : ""}</p>
          </div>
          <p class="dates">${escapeHtml(formatRange(e.start_date, e.end_date, e.current))}</p>
        </header>
        ${htmlList(e.bullets.length ? e.bullets : e.achievements)}
      </article>`,
    )
    .join("");

  const eduBlocks = p.education
    .map(
      (e) => `
      <article>
        <h3>${escapeHtml(e.school)}</h3>
        <p class="company">${escapeHtml([e.degree, e.field].filter(Boolean).join(" — "))}</p>
        <p class="dates">${escapeHtml(formatRange(e.start_date, e.end_date, false))}</p>
      </article>`,
    )
    .join("");

  const skillsByCategory = groupSkills(p.skills);
  const skillSections = Object.entries(skillsByCategory)
    .map(
      ([cat, names]) => `
      <div class="skill-group">
        <h4>${escapeHtml(cat)}</h4>
        <p>${names.map(escapeHtml).join(" · ")}</p>
      </div>`,
    )
    .join("");

  return baseDocument(
    p.basics.full_name ?? "CV",
    `
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; margin: 0; padding: 32px 40px; line-height: 1.45; }
    h1 { font-size: 30px; margin: 0 0 4px; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #2563eb; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #2563eb; }
    h3 { font-size: 15px; margin: 0; }
    h4 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin: 0 0 4px; }
    p { margin: 4px 0; }
    ul { margin: 6px 0 0 18px; padding: 0; }
    li { margin: 2px 0; font-size: 13.5px; }
    .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
    .head .meta { text-align: right; font-size: 12.5px; color: #475569; }
    .head .meta a { color: #2563eb; text-decoration: none; }
    .headline { font-size: 14px; color: #475569; margin: 0; }
    .summary { font-size: 13.5px; margin-top: 12px; }
    .exp-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
    .company { font-size: 13px; color: #475569; margin: 2px 0; }
    .dates { font-size: 12px; color: #64748b; white-space: nowrap; }
    article { margin-bottom: 14px; }
    .skill-group { margin-bottom: 8px; font-size: 13px; }
    .watermark { position: fixed; bottom: 16px; left: 0; right: 0; text-align: center; font-size: 10px; color: #94a3b8; }
    @media print { body { padding: 24px 28px; } .watermark { position: fixed; } }
    `,
    `
    <header class="head">
      <div>
        <h1>${escapeHtml(p.basics.full_name)}</h1>
        <p class="headline">${escapeHtml(t.tailored_headline || p.basics.headline)}</p>
      </div>
      <div class="meta">
        ${p.basics.email ? `<p>${escapeHtml(p.basics.email)}</p>` : ""}
        ${p.basics.location ? `<p>${escapeHtml(p.basics.location)}</p>` : ""}
        ${p.basics.linkedin_url ? `<p><a href="${escapeHtml(p.basics.linkedin_url)}">${escapeHtml(p.basics.linkedin_url.replace(/^https?:\/\//, ""))}</a></p>` : ""}
        ${p.links
          .map(
            (l) =>
              `<p><a href="${escapeHtml(l.url)}">${escapeHtml(l.label)}</a></p>`,
          )
          .join("")}
      </div>
    </header>
    ${t.tailored_summary ? `<p class="summary">${escapeHtml(t.tailored_summary)}</p>` : ""}
    ${expBlocks ? `<h2>Experience</h2>${expBlocks}` : ""}
    ${skillSections ? `<h2>Skills</h2>${skillSections}` : ""}
    ${eduBlocks ? `<h2>Education</h2>${eduBlocks}` : ""}
    ${watermarkBlock(wm)}
    `,
  );
}

// ─── Classic (centered, serif, very ATS-safe) ─────────────────────────────

function renderClassic(p: FullProfile, t: TailoredCV, wm: boolean): string {
  const expBlocks = matchExperiences(p, t)
    .map(
      (e) => `
      <article>
        <p class="role"><strong>${escapeHtml(e.title)}</strong>, ${escapeHtml(e.company)}${e.location ? ` — ${escapeHtml(e.location)}` : ""} <span class="dates">${escapeHtml(formatRange(e.start_date, e.end_date, e.current))}</span></p>
        ${htmlList(e.bullets.length ? e.bullets : e.achievements)}
      </article>`,
    )
    .join("");

  const eduBlocks = p.education
    .map(
      (e) => `
      <p><strong>${escapeHtml(e.school)}</strong> — ${escapeHtml([e.degree, e.field].filter(Boolean).join(", "))} <span class="dates">${escapeHtml(formatRange(e.start_date, e.end_date, false))}</span></p>`,
    )
    .join("");

  const skillBlock = p.skills.length
    ? `<p>${p.skills.map((s) => escapeHtml(s.name)).join(" · ")}</p>`
    : "";

  return baseDocument(
    p.basics.full_name ?? "CV",
    `
    body { font-family: 'Georgia', 'Times New Roman', serif; color: #111; margin: 0; padding: 36px 48px; line-height: 1.5; }
    h1 { font-size: 28px; text-align: center; margin: 0; letter-spacing: 0.04em; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.16em; text-align: center; margin: 24px 0 10px; border-top: 1px solid #111; border-bottom: 1px solid #111; padding: 4px 0; }
    p { margin: 4px 0; font-size: 13.5px; }
    ul { margin: 6px 0 8px 18px; }
    li { font-size: 13px; margin: 2px 0; }
    .meta { text-align: center; font-size: 12.5px; color: #444; margin: 4px 0 0; }
    .meta a { color: inherit; text-decoration: none; }
    .role { margin-top: 10px; }
    .dates { float: right; color: #555; font-style: italic; }
    .summary { margin: 14px 0 0; }
    .watermark { text-align: center; font-size: 10px; color: #999; margin-top: 24px; }
    @media print { body { padding: 24px 32px; } }
    `,
    `
    <h1>${escapeHtml(p.basics.full_name)}</h1>
    ${t.tailored_headline ? `<p class="meta">${escapeHtml(t.tailored_headline)}</p>` : ""}
    <p class="meta">
      ${[p.basics.email, p.basics.location].filter(Boolean).map(escapeHtml).join(" · ")}
      ${p.basics.linkedin_url ? ` · <a href="${escapeHtml(p.basics.linkedin_url)}">${escapeHtml(p.basics.linkedin_url.replace(/^https?:\/\//, ""))}</a>` : ""}
    </p>
    ${t.tailored_summary ? `<p class="summary">${escapeHtml(t.tailored_summary)}</p>` : ""}
    ${expBlocks ? `<h2>Professional Experience</h2>${expBlocks}` : ""}
    ${eduBlocks ? `<h2>Education</h2>${eduBlocks}` : ""}
    ${skillBlock ? `<h2>Skills</h2>${skillBlock}` : ""}
    ${watermarkBlock(wm)}
    `,
  );
}

// ─── Creative (sidebar accent) ────────────────────────────────────────────

function renderCreative(p: FullProfile, t: TailoredCV, wm: boolean): string {
  const expBlocks = matchExperiences(p, t)
    .map(
      (e) => `
      <article>
        <h3>${escapeHtml(e.title)} <span class="at">at ${escapeHtml(e.company)}</span></h3>
        <p class="dates">${escapeHtml(formatRange(e.start_date, e.end_date, e.current))}${e.location ? ` · ${escapeHtml(e.location)}` : ""}</p>
        ${htmlList(e.bullets.length ? e.bullets : e.achievements)}
      </article>`,
    )
    .join("");

  const eduBlocks = p.education
    .map(
      (e) => `
      <article>
        <h3>${escapeHtml(e.school)}</h3>
        <p class="dates">${escapeHtml([e.degree, e.field].filter(Boolean).join(" · "))} ${e.end_date ? "· " + escapeHtml(formatRange(e.start_date, e.end_date, false)) : ""}</p>
      </article>`,
    )
    .join("");

  const skillsBySection = groupSkills(p.skills);
  const skillBlocks = Object.entries(skillsBySection)
    .map(
      ([cat, names]) => `
      <div class="skill-pill-group">
        <h4>${escapeHtml(cat)}</h4>
        <div class="pills">${names.map((n) => `<span class="pill">${escapeHtml(n)}</span>`).join("")}</div>
      </div>`,
    )
    .join("");

  return baseDocument(
    p.basics.full_name ?? "CV",
    `
    body { font-family: 'Inter', sans-serif; color: #1f2937; margin: 0; padding: 0; line-height: 1.45; }
    .page { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
    .side { background: #1e293b; color: #e2e8f0; padding: 36px 22px; }
    .side h1 { color: #fff; font-size: 22px; margin: 0; }
    .side .headline { color: #93c5fd; font-size: 13px; margin: 4px 0 16px; }
    .side h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; margin: 18px 0 6px; }
    .side p { font-size: 12.5px; margin: 2px 0; word-break: break-word; }
    .side a { color: #bfdbfe; text-decoration: none; }
    .pills { display: flex; flex-wrap: wrap; gap: 4px; }
    .pill { background: #334155; color: #e2e8f0; font-size: 11px; padding: 3px 8px; border-radius: 999px; }
    .main { padding: 36px 40px; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #1e293b; margin: 0 0 10px; padding-bottom: 4px; border-bottom: 2px solid #1e293b; }
    h3 { font-size: 14.5px; margin: 14px 0 2px; }
    h3 .at { color: #64748b; font-weight: 500; }
    .dates { font-size: 12px; color: #64748b; margin: 0 0 4px; }
    ul { margin: 6px 0 0 18px; padding: 0; }
    li { font-size: 13px; margin: 2px 0; }
    .summary { font-size: 13.5px; margin-bottom: 14px; }
    article { margin-bottom: 12px; }
    .watermark { text-align: center; font-size: 10px; color: #94a3b8; margin: 20px 0 0; grid-column: 1 / -1; }
    @media print { .page { min-height: auto; } body { padding: 0; } }
    `,
    `
    <div class="page">
      <aside class="side">
        <h1>${escapeHtml(p.basics.full_name)}</h1>
        <p class="headline">${escapeHtml(t.tailored_headline || p.basics.headline)}</p>
        <h4>Contact</h4>
        ${p.basics.email ? `<p>${escapeHtml(p.basics.email)}</p>` : ""}
        ${p.basics.location ? `<p>${escapeHtml(p.basics.location)}</p>` : ""}
        ${p.basics.linkedin_url ? `<p><a href="${escapeHtml(p.basics.linkedin_url)}">${escapeHtml(p.basics.linkedin_url.replace(/^https?:\/\//, ""))}</a></p>` : ""}
        ${p.links
          .map(
            (l) =>
              `<p><a href="${escapeHtml(l.url)}">${escapeHtml(l.label)}</a></p>`,
          )
          .join("")}
        ${skillBlocks}
      </aside>
      <main class="main">
        ${t.tailored_summary ? `<h2>Profile</h2><p class="summary">${escapeHtml(t.tailored_summary)}</p>` : ""}
        ${expBlocks ? `<h2>Experience</h2>${expBlocks}` : ""}
        ${eduBlocks ? `<h2>Education</h2>${eduBlocks}` : ""}
      </main>
    </div>
    ${watermarkBlock(wm)}
    `,
  );
}

// ─── Minimal (super clean, lots of whitespace) ────────────────────────────

function renderMinimal(p: FullProfile, t: TailoredCV, wm: boolean): string {
  const expBlocks = matchExperiences(p, t)
    .map(
      (e) => `
      <article>
        <p class="role"><strong>${escapeHtml(e.title)}</strong> · ${escapeHtml(e.company)}</p>
        <p class="dates">${escapeHtml(formatRange(e.start_date, e.end_date, e.current))}${e.location ? ` · ${escapeHtml(e.location)}` : ""}</p>
        ${htmlList(e.bullets.length ? e.bullets : e.achievements)}
      </article>`,
    )
    .join("");

  const eduBlocks = p.education
    .map(
      (e) => `
      <p><strong>${escapeHtml(e.school)}</strong> · ${escapeHtml([e.degree, e.field].filter(Boolean).join(" · "))} <span class="dates">${escapeHtml(formatRange(e.start_date, e.end_date, false))}</span></p>`,
    )
    .join("");

  const skillBlock = p.skills.length
    ? `<p class="skills">${p.skills.map((s) => escapeHtml(s.name)).join(" · ")}</p>`
    : "";

  return baseDocument(
    p.basics.full_name ?? "CV",
    `
    body { font-family: 'Inter', sans-serif; color: #18181b; margin: 0; padding: 48px 56px; line-height: 1.55; max-width: 820px; }
    h1 { font-size: 26px; margin: 0; font-weight: 600; letter-spacing: -0.01em; }
    h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; color: #71717a; margin: 28px 0 10px; }
    p { margin: 4px 0; font-size: 13.5px; }
    ul { margin: 6px 0 0 16px; padding: 0; }
    li { font-size: 13px; margin: 2px 0; }
    .meta { color: #52525b; font-size: 13px; margin: 4px 0; }
    .meta a { color: inherit; text-decoration: underline; text-decoration-color: #d4d4d8; }
    .role { margin-top: 10px; }
    .dates { color: #71717a; font-size: 12.5px; margin: 0 0 4px; }
    .skills { color: #3f3f46; font-size: 13px; }
    .summary { margin: 12px 0 0; }
    article { margin-bottom: 14px; }
    .watermark { text-align: center; font-size: 10px; color: #a1a1aa; margin-top: 32px; }
    @media print { body { padding: 28px 32px; } }
    `,
    `
    <h1>${escapeHtml(p.basics.full_name)}</h1>
    <p class="meta">${escapeHtml(t.tailored_headline || p.basics.headline)}</p>
    <p class="meta">
      ${[p.basics.email, p.basics.location].filter(Boolean).map(escapeHtml).join(" · ")}
      ${p.basics.linkedin_url ? ` · <a href="${escapeHtml(p.basics.linkedin_url)}">${escapeHtml(p.basics.linkedin_url.replace(/^https?:\/\//, ""))}</a>` : ""}
    </p>
    ${t.tailored_summary ? `<p class="summary">${escapeHtml(t.tailored_summary)}</p>` : ""}
    ${expBlocks ? `<h2>Experience</h2>${expBlocks}` : ""}
    ${eduBlocks ? `<h2>Education</h2>${eduBlocks}` : ""}
    ${skillBlock ? `<h2>Skills</h2>${skillBlock}` : ""}
    ${watermarkBlock(wm)}
    `,
  );
}

// ─── shared helpers ───────────────────────────────────────────────────────

function baseDocument(title: string, css: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} — CV</title>
<style>${css}</style>
</head>
<body>
${body}
</body>
</html>`;
}

function matchExperiences(p: FullProfile, t: TailoredCV) {
  return p.experiences.map((e) => {
    const tailored = t.tailored_experiences.find(
      (te) =>
        te.company.toLowerCase() === e.company.toLowerCase() &&
        te.title.toLowerCase() === e.title.toLowerCase(),
    );
    return {
      ...e,
      bullets: tailored?.bullets ?? [],
    };
  });
}

function groupSkills(skills: { name: string; category: string | null }[]) {
  const out: Record<string, string[]> = {};
  for (const s of skills) {
    const cat = (s.category || "Skills").replace(/^./, (c) => c.toUpperCase());
    if (!out[cat]) out[cat] = [];
    out[cat].push(s.name);
  }
  return out;
}
