import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Jobs & CVs — Adam Careers",
  description: "All the jobs you've tailored a CV for.",
};

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: gens } = await supabase
    .from("generations")
    .select(
      "id, template_id, match_score, created_at, jobs ( id, title, company, location )",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  type GenRow = {
    id: string;
    template_id: string;
    match_score: number | null;
    created_at: string;
    jobs:
      | { title: string | null; company: string | null; location: string | null }
      | { title: string | null; company: string | null; location: string | null }[]
      | null;
  };
  const rawItems = (gens ?? []) as unknown as GenRow[];
  const items = rawItems.map((r) => ({
    ...r,
    jobs: Array.isArray(r.jobs) ? (r.jobs[0] ?? null) : r.jobs,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your CVs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Every CV you&rsquo;ve generated, ready to open and download.
          </p>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New CV from job URL
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm text-gray-600">
            You haven&rsquo;t generated any CVs yet.
          </p>
          <Link
            href="/dashboard/jobs/new"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Paste your first job URL
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((g) => (
            <Link
              key={g.id}
              href={`/dashboard/generations/${g.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">
                  {g.jobs?.title ?? "Untitled role"}
                </p>
                <p className="truncate text-sm text-gray-600">
                  {[g.jobs?.company, g.jobs?.location].filter(Boolean).join(" · ") ||
                    "Pasted description"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {formatDate(g.created_at)} · {g.template_id}
                </p>
              </div>
              {typeof g.match_score === "number" && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {g.match_score}%
                  </p>
                  <p className="text-xs text-gray-500">match</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
