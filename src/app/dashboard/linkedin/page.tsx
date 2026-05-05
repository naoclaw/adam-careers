import { createClient } from "@/lib/supabase/server";
import { LinkedInImport } from "@/components/linkedin-import";

type Profile = {
  full_name: string | null;
  email: string | null;
  headline: string | null;
  linkedin_url: string | null;
  summary: string | null;
  location: string | null;
};

const fields: { label: string; key: keyof Profile }[] = [
  { label: "Name", key: "full_name" },
  { label: "Email", key: "email" },
  { label: "Headline", key: "headline" },
  { label: "Location", key: "location" },
  { label: "LinkedIn URL", key: "linkedin_url" },
  { label: "Summary", key: "summary" },
];

export default async function DashboardLinkedInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,headline,linkedin_url,summary,location")
    .eq("id", user!.id)
    .maybeSingle<Profile>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">LinkedIn Import</h1>
        <p className="text-sm text-gray-600 mt-1">
          Import your LinkedIn profile to auto-fill your CV and personalise your
          AI career coach.
        </p>
      </div>

      <LinkedInImport alreadyImported={Boolean(profile?.linkedin_url)} />

      {profile && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            Saved profile data
          </h2>
          <dl className="grid gap-4 md:grid-cols-2">
            {fields.map(({ label, key }) => (
              <div key={key}>
                <dt className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">
                  {label}
                </dt>
                <dd className="text-sm text-gray-800 font-medium">
                  {key === "linkedin_url" && profile[key] ? (
                    <a
                      href={profile[key]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile[key]}
                    </a>
                  ) : (
                    profile[key] ?? (
                      <span className="text-gray-400 italic">Not set</span>
                    )
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
