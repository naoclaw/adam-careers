import { createClient } from "@/lib/supabase/server";

export default async function DashboardLinkedInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,headline,linkedin_url,summary,location")
    .eq("id", user?.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">LinkedIn Import</h1>
        <p className="text-sm text-gray-600">
          Your account is linked via LinkedIn OAuth. This page displays imported
          profile fields.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Name
            </dt>
            <dd className="text-sm text-gray-900">
              {profile?.full_name || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Email
            </dt>
            <dd className="text-sm text-gray-900">
              {profile?.email || user?.email || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Headline
            </dt>
            <dd className="text-sm text-gray-900">
              {profile?.headline || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Location
            </dt>
            <dd className="text-sm text-gray-900">
              {profile?.location || "-"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              LinkedIn URL
            </dt>
            <dd className="text-sm text-gray-900">
              {profile?.linkedin_url || "-"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Summary
            </dt>
            <dd className="text-sm text-gray-900">{profile?.summary || "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
