// Tailored CV generator. Takes a user's full profile and a job, asks the LLM
// for a tailored summary, tailored bullets per experience, a cover letter,
// and a match analysis. Returns structured data ready for the renderer.

import { generateJson, MODELS, AIError } from "@/lib/ai/openrouter";
import type { FullProfile } from "@/lib/profile/types";

export type JobInput = {
  title: string | null;
  company: string | null;
  location: string | null;
  description: string;
  requirements: string[];
  skills: string[];
  summary: string;
};

export type TailoredCV = {
  tailored_headline: string;
  tailored_summary: string;
  tailored_experiences: {
    company: string;
    title: string;
    bullets: string[];
  }[];
  cover_letter: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  recommended_skills_to_add: string[];
};

export type GenerateCvResult = {
  tailored: TailoredCV;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
};

export async function tailorCv(
  profile: FullProfile,
  job: JobInput,
  opts?: { model?: string },
): Promise<GenerateCvResult> {
  if (!profile.basics.full_name && !profile.basics.email) {
    throw new AIError(
      "Please complete your profile before generating a CV",
      400,
    );
  }

  const sys = `You are a senior career coach helping a candidate apply for a specific job.

You will receive the candidate's profile and a job posting. Your job is to:
1. Write a tailored 1-line headline matching the role
2. Write a tailored 2-3 sentence summary in the candidate's voice
3. For each of the candidate's experiences, rewrite 3-5 bullet points emphasising
   the skills and outcomes relevant to the job. Keep bullets truthful: only use
   information present in the profile. Quantify when the profile gives numbers,
   never invent metrics.
4. Write a 250-350 word cover letter in plain prose, warm and specific. It must
   reference the company and the role. Do NOT use a template "Dear Hiring Manager"
   if the company name is unknown — use "Dear ${job.company ?? "Hiring Team"}" only when known.
5. Score the match from 0 to 100 based on how well the candidate's skills and
   experience cover the job's requirements.
6. List the matched skills (skills the candidate has that the job needs) and the
   missing skills (skills the job needs that the candidate doesn't have).
7. Recommend up to 5 skills the candidate should add to their profile to improve
   future matches.

Return STRICT JSON, nothing else, with this shape:

{
  "tailored_headline": string,
  "tailored_summary": string,
  "tailored_experiences": [
    { "company": string, "title": string, "bullets": string[] }
  ],
  "cover_letter": string,
  "match_score": number,
  "matched_skills": string[],
  "missing_skills": string[],
  "recommended_skills_to_add": string[]
}`;

  const user = JSON.stringify(
    {
      candidate: {
        basics: profile.basics,
        skills: profile.skills.map((s) => s.name),
        experiences: profile.experiences.map((e) => ({
          company: e.company,
          title: e.title,
          location: e.location,
          start_date: e.start_date,
          end_date: e.end_date,
          current: e.current,
          description: e.description,
          achievements: e.achievements,
        })),
        education: profile.education.map((e) => ({
          school: e.school,
          degree: e.degree,
          field: e.field,
          start_date: e.start_date,
          end_date: e.end_date,
        })),
        links: profile.links,
      },
      job,
    },
    null,
    2,
  );

  const { data, raw } = await generateJson<TailoredCV>({
    model: opts?.model ?? MODELS.smart,
    temperature: 0.5,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
  });

  const matched = uniqueLower(data.matched_skills ?? []);
  const missing = uniqueLower(data.missing_skills ?? []);

  const tailored: TailoredCV = {
    tailored_headline: data.tailored_headline ?? profile.basics.headline ?? "",
    tailored_summary: data.tailored_summary ?? profile.basics.summary ?? "",
    tailored_experiences: Array.isArray(data.tailored_experiences)
      ? data.tailored_experiences
      : [],
    cover_letter: data.cover_letter ?? "",
    match_score: clamp(Number(data.match_score) || 0, 0, 100),
    matched_skills: matched,
    missing_skills: missing,
    recommended_skills_to_add: uniqueLower(
      data.recommended_skills_to_add ?? [],
    ),
  };

  return {
    tailored,
    model: raw.model,
    promptTokens: raw.promptTokens,
    completionTokens: raw.completionTokens,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function uniqueLower(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    if (typeof s !== "string") continue;
    const key = s.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(s.trim());
  }
  return out;
}
