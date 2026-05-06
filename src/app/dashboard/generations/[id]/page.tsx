import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GenerationView } from "@/components/generation-view";

export const metadata = {
  title: "Your tailored CV — Adam Careers",
};

export default async function GenerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: gen } = await supabase
    .from("generations")
    .select(
      "id, template_id, cover_letter_md, match_score, matched_skills, missing_skills, jobs ( id, title, company, source_url )",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!gen) notFound();

  type JobRow = {
    id: string;
    title: string | null;
    company: string | null;
    source_url: string | null;
  };
  const rawJob = (gen.jobs ?? null) as unknown as JobRow | JobRow[] | null;
  const job: JobRow | null = Array.isArray(rawJob)
    ? (rawJob[0] ?? null)
    : rawJob;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {job?.title ?? "Your CV"}
        </h1>
        <p className="text-sm text-gray-600">
          {job?.company ? `Tailored for ${job.company}` : "Tailored CV"}
        </p>
      </div>
      <GenerationView
        generationId={gen.id}
        initialTemplate={gen.template_id ?? "modern"}
        coverLetter={gen.cover_letter_md ?? ""}
        matchScore={gen.match_score ?? 0}
        matchedSkills={gen.matched_skills ?? []}
        missingSkills={gen.missing_skills ?? []}
        job={job}
      />
    </div>
  );
}
