import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadFullProfile } from "@/lib/profile/load";
import { renderCv, isTemplateId, type TemplateId } from "@/lib/cv/render";
import type { TailoredCV } from "@/lib/cv/generate";

export const runtime = "nodejs";

type Snapshot = {
  headline: string;
  summary: string;
  experiences: { company: string; title: string; bullets: string[] }[];
};

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const url = new URL(req.url);
  const overrideTemplate = url.searchParams.get("template");
  const download = url.searchParams.get("download") === "1";

  const { data: gen, error } = await supabase
    .from("generations")
    .select(
      "id, template_id, cv_html, cover_letter_md, match_score, matched_skills, missing_skills",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !gen) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const profile = await loadFullProfile(supabase, user.id);

  let snapshot: Snapshot = { headline: "", summary: "", experiences: [] };
  try {
    snapshot = JSON.parse(gen.cv_html ?? "{}") as Snapshot;
  } catch {
    // leave empty
  }

  const tailored: TailoredCV = {
    tailored_headline: snapshot.headline ?? "",
    tailored_summary: snapshot.summary ?? "",
    tailored_experiences: snapshot.experiences ?? [],
    cover_letter: gen.cover_letter_md ?? "",
    match_score: gen.match_score ?? 0,
    matched_skills: gen.matched_skills ?? [],
    missing_skills: gen.missing_skills ?? [],
    recommended_skills_to_add: [],
  };

  const template: TemplateId = isTemplateId(overrideTemplate)
    ? overrideTemplate
    : isTemplateId(gen.template_id)
      ? gen.template_id
      : "modern";

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id, status")
    .eq("user_id", user.id)
    .maybeSingle();
  const watermark =
    !sub ||
    sub.plan_id === "free" ||
    sub.status === "canceled" ||
    sub.status === "incomplete";

  const html = renderCv({ profile, tailored, template, watermark });

  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "private, no-store",
  };
  if (download) {
    const safeName = (profile.basics.full_name ?? "cv")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase();
    headers["Content-Disposition"] = `attachment; filename="${safeName}-cv.html"`;
  }
  return new NextResponse(html, { headers });
}
