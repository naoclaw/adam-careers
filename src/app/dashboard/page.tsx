import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadFullProfile } from "@/lib/profile/load";
import { profileCompleteness } from "@/lib/profile/types";
import { checkCvQuota } from "@/lib/quota/check";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, quota, recentRes] = await Promise.all([
    loadFullProfile(supabase, user.id),
    checkCvQuota(supabase, user.id),
    supabase
      .from("generations")
      .select(
        "id, template_id, match_score, created_at, jobs ( title, company )",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  type Recent = {
    id: string;
    template_id: string;
    match_score: number | null;
    created_at: string;
    jobs: { title: string | null; company: string | null } | { title: string | null; company: string | null }[] | null;
  };
  const recents = ((recentRes.data ?? []) as unknown as Recent[]).map((r) => ({
    ...r,
    jobs: Array.isArray(r.jobs) ? r.jobs[0] ?? null : r.jobs,
  }));
  const completeness = profileCompleteness(profile);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Hi{profile.basics.full_name ? `, ${profile.basics.full_name.split(" ")[0]}` : ""}.
            </h1>
            <p className="mt-1 text-sm text-blue-100">
              Paste a job URL and get a tailored CV + cover letter in under a minute.
            </p>
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            Tailor a CV →
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/profile"
          className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Profile
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {completeness}%
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">complete</p>
        </Link>

        <Link
          href="/dashboard/billing"
          className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            This month
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {quota.used} {quota.limit === null ? "" : `/ ${quota.limit}`}
          </p>
          <p className="text-xs text-gray-500">
            CVs on the {quota.plan} plan
          </p>
        </Link>

        <Link
          href="/dashboard/jobs"
          className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            CVs generated
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {recents.length === 5 ? "5+" : recents.length}
          </p>
          <p className="text-xs text-gray-500">View all →</p>
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Recent CVs</h2>
          <Link
            href="/dashboard/jobs"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        {recents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            No CVs yet.{" "}
            <Link
              href="/dashboard/jobs/new"
              className="font-medium text-blue-600 hover:underline"
            >
              Paste a job URL
            </Link>{" "}
            to make your first one.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recents.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/dashboard/generations/${g.id}`}
                  className="flex items-center justify-between gap-3 py-3 hover:bg-gray-50 -mx-3 px-3 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {g.jobs?.title ?? "Untitled"}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {g.jobs?.company ?? "—"} · {formatDate(g.created_at)}
                    </p>
                  </div>
                  {typeof g.match_score === "number" && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {g.match_score}%
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

