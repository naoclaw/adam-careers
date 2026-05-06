import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobUrlForm } from "@/components/job-url-form";
import { loadFullProfile } from "@/lib/profile/load";
import { isProfileComplete } from "@/lib/profile/types";

export const metadata = {
  title: "New job — Adam Careers",
  description: "Paste a job URL and get a tailored CV in seconds.",
};

export default async function NewJobPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await loadFullProfile(supabase, user.id);
  const ready = isProfileComplete(profile);

  const { data: tplRow } = await supabase
    .from("cv_template_selections")
    .select("template_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tailor your CV to a job
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Paste a link to any job posting. We&rsquo;ll extract what they need
          and tailor your CV to match.
        </p>
      </div>

      {!ready && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Your profile needs a few more details</p>
          <p className="mt-1">
            Add at least your name, one experience and three skills before
            generating a CV.
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-3 inline-block rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Complete your profile
          </Link>
        </div>
      )}

      <JobUrlForm defaultTemplate={tplRow?.template_id ?? "modern"} />
    </div>
  );
}
