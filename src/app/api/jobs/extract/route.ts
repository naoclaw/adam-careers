import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractJobFromUrl, extractJobFromText } from "@/lib/jobs/extract";
import { AIError } from "@/lib/ai/openrouter";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { url?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!url && text.length < 200) {
    return NextResponse.json(
      { error: "Provide a job URL or paste a description (min 200 chars)" },
      { status: 400 },
    );
  }

  try {
    const extracted = url
      ? await extractJobFromUrl(url)
      : { job: await extractJobFromText(text), rawText: text };

    const { data: inserted, error } = await supabase
      .from("jobs")
      .insert({
        user_id: user.id,
        source_url: url || null,
        title: extracted.job.title,
        company: extracted.job.company,
        location: extracted.job.location,
        employment_type: extracted.job.employment_type,
        salary_text: extracted.job.salary_text,
        description: extracted.job.description,
        requirements: extracted.job.requirements,
        skills: extracted.job.skills,
        summary: extracted.job.summary,
        raw_text: extracted.rawText.slice(0, 50_000),
      })
      .select("id")
      .single();

    if (error) {
      console.error("jobs insert error", error);
      return NextResponse.json(
        { error: "Could not save job" },
        { status: 500 },
      );
    }

    return NextResponse.json({ job_id: inserted.id, job: extracted.job });
  } catch (err) {
    if (err instanceof AIError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("extract route error", err);
    return NextResponse.json(
      { error: "Could not extract job posting" },
      { status: 500 },
    );
  }
}
