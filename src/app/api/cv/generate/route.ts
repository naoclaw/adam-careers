import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadFullProfile } from "@/lib/profile/load";
import { tailorCv } from "@/lib/cv/generate";
import { isTemplateId } from "@/lib/cv/render";
import { checkCvQuota } from "@/lib/quota/check";
import { AIError, MODELS } from "@/lib/ai/openrouter";
import { sendCvReadyEmail } from "@/lib/email/send";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { job_id?: string; template_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const jobId = typeof body.job_id === "string" ? body.job_id : "";
  const templateId = isTemplateId(body.template_id) ? body.template_id : "modern";
  if (!jobId) {
    return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
  }

  const quota = await checkCvQuota(supabase, user.id);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: "Monthly CV limit reached",
        upgrade_required: true,
        used: quota.used,
        limit: quota.limit,
        plan: quota.plan,
      },
      { status: 402 },
    );
  }

  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .select(
      "id, title, company, location, description, requirements, skills, summary",
    )
    .eq("id", jobId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (jobErr || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const profile = await loadFullProfile(supabase, user.id);
  if (!profile.basics.full_name) {
    return NextResponse.json(
      { error: "Please add your full name to your profile first." },
      { status: 400 },
    );
  }

  let result;
  try {
    result = await tailorCv(
      profile,
      {
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description ?? "",
        requirements: Array.isArray(job.requirements) ? (job.requirements as string[]) : [],
        skills: Array.isArray(job.skills) ? job.skills : [],
        summary: job.summary ?? "",
      },
      { model: quota.plan === "unlimited" ? MODELS.smart : MODELS.smart },
    );
  } catch (err) {
    if (err instanceof AIError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("tailorCv error", err);
    return NextResponse.json(
      { error: "Could not generate CV" },
      { status: 500 },
    );
  }

  // Render is done lazily by /api/cv/[id]/html so we can re-render any
  // template without regenerating. Persist tailored payload as JSON inside
  // the cv_html column-adjacent field via cover_letter_md (cover letter)
  // and matched/missing skills, plus a snapshot of tailored experiences in
  // the cv_html column.
  const tailoredSnapshot = JSON.stringify({
    headline: result.tailored.tailored_headline,
    summary: result.tailored.tailored_summary,
    experiences: result.tailored.tailored_experiences,
  });

  const { data: gen, error: genErr } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      job_id: jobId,
      template_id: templateId,
      cv_html: tailoredSnapshot,
      cover_letter_md: result.tailored.cover_letter,
      match_score: result.tailored.match_score,
      matched_skills: result.tailored.matched_skills,
      missing_skills: result.tailored.missing_skills,
      ai_model: result.model,
      prompt_tokens: result.promptTokens ?? null,
      completion_tokens: result.completionTokens ?? null,
    })
    .select("id")
    .single();

  if (genErr || !gen) {
    console.error("generations insert error", genErr);
    return NextResponse.json(
      { error: "Could not save generation" },
      { status: 500 },
    );
  }

  // Bump usage counter (best-effort).
  await supabase.rpc("increment_cv_usage", { p_user_id: user.id });

  // Fire-and-forget email.
  sendCvReadyEmail({
    userId: user.id,
    toEmail: user.email ?? null,
    generationId: gen.id,
    jobTitle: job.title,
    company: job.company,
  }).catch((e) => console.error("email send failed", e));

  return NextResponse.json({
    generation_id: gen.id,
    match_score: result.tailored.match_score,
    matched_skills: result.tailored.matched_skills,
    missing_skills: result.tailored.missing_skills,
    recommended_skills: result.tailored.recommended_skills_to_add,
  });
}
