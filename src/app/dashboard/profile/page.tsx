import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadFullProfile } from "@/lib/profile/load";
import { profileCompleteness } from "@/lib/profile/types";
import { ProfileEditor } from "@/components/profile-editor";

export const metadata = {
  title: "Your profile — Adam Careers",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await loadFullProfile(supabase, user.id);
  const completeness = profileCompleteness(profile);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>
          <p className="text-sm text-gray-600">
            The richer your profile, the better your tailored CVs.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm">
          <p className="text-gray-500">Completeness</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <span className="font-semibold text-gray-900">{completeness}%</span>
          </div>
        </div>
      </div>
      <ProfileEditor initial={profile} />
    </div>
  );
}
