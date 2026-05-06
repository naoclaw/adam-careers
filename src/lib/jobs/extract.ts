// Job-posting extractor: fetch a URL, strip HTML to text, ask the LLM
// to return a structured job record. Best-effort — if a site blocks us,
// the caller should fall back to a "paste the description" textarea.

import { generateJson, MODELS, AIError } from "@/lib/ai/openrouter";

export type ExtractedJob = {
  title: string | null;
  company: string | null;
  location: string | null;
  employment_type: string | null;
  salary_text: string | null;
  description: string;
  requirements: string[];
  skills: string[];
  summary: string;
};

const MAX_BODY_BYTES = 500 * 1024;
const MAX_TEXT_CHARS = 18_000;
const FETCH_TIMEOUT_MS = 12_000;

export async function fetchJobText(url: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new AIError("Invalid URL", 400);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new AIError("URL must be http(s)", 400);
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
  } catch (err) {
    clearTimeout(timer);
    const aborted =
      typeof err === "object" && err !== null && "name" in err && (err as { name: string }).name === "AbortError";
    throw new AIError(
      aborted ? "Timed out fetching the page" : "Could not reach that URL",
      502,
    );
  }
  clearTimeout(timer);

  if (!res.ok) {
    throw new AIError(`Fetch failed (${res.status})`, 502);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new AIError("Empty response body", 502);

  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BODY_BYTES) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.byteLength;
    }
  }
  await reader.cancel().catch(() => undefined);

  const buf = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(buf);
}

export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>(?=\s*<)/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractJobFromText(
  text: string,
  hint?: { url?: string },
): Promise<ExtractedJob> {
  const trimmed = text.slice(0, MAX_TEXT_CHARS);
  const sys = `You are a job-posting parser. Given the raw text of a job listing,
return STRICT JSON with the following shape and nothing else:

{
  "title": string | null,
  "company": string | null,
  "location": string | null,
  "employment_type": string | null,
  "salary_text": string | null,
  "description": string,
  "requirements": string[],
  "skills": string[],
  "summary": string
}

Rules:
- "skills" is a flat list of concrete hard skills, tools, languages, frameworks,
  certifications. Do not include soft skills like "team player".
- "requirements" is the explicit must-have/nice-to-have list as bullets.
- "summary" is 1-2 sentences describing the role for a candidate.
- "description" is the cleaned full description (markdown allowed, no HTML).
- If a field is unknown, return null (or [] for arrays). Never invent.
`;

  const user = `Source URL: ${hint?.url ?? "(unknown)"}

Job posting text:
"""
${trimmed}
"""`;

  const { data } = await generateJson<ExtractedJob>({
    model: MODELS.cheap,
    temperature: 0.1,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
  });

  return {
    title: data.title ?? null,
    company: data.company ?? null,
    location: data.location ?? null,
    employment_type: data.employment_type ?? null,
    salary_text: data.salary_text ?? null,
    description: data.description ?? "",
    requirements: Array.isArray(data.requirements) ? data.requirements : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    summary: data.summary ?? "",
  };
}

export async function extractJobFromUrl(url: string): Promise<{
  job: ExtractedJob;
  rawText: string;
}> {
  const html = await fetchJobText(url);
  const text = htmlToText(html);
  if (text.length < 200) {
    throw new AIError(
      "That page does not look like a job posting (too little text).",
      422,
    );
  }
  const job = await extractJobFromText(text, { url });
  return { job, rawText: text };
}
