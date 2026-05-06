import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FullProfile,
  ProfileBasics,
  ProfileEducation,
  ProfileExperience,
  ProfileLink,
  ProfileSkill,
} from "./types";

export async function loadFullProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<FullProfile> {
  const [basicsRes, expRes, eduRes, skillRes, linkRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, headline, location, summary, linkedin_url")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("profile_experiences")
      .select(
        "id, company, title, location, start_date, end_date, current, description, achievements, order_index",
      )
      .eq("user_id", userId)
      .order("current", { ascending: false })
      .order("end_date", { ascending: false, nullsFirst: false })
      .order("order_index", { ascending: true }),
    supabase
      .from("profile_education")
      .select(
        "id, school, degree, field, start_date, end_date, description, order_index",
      )
      .eq("user_id", userId)
      .order("end_date", { ascending: false, nullsFirst: false })
      .order("order_index", { ascending: true }),
    supabase
      .from("profile_skills")
      .select("id, name, category, level")
      .eq("user_id", userId)
      .order("category", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("profile_links")
      .select("id, label, url")
      .eq("user_id", userId)
      .order("label", { ascending: true }),
  ]);

  const basics: ProfileBasics = {
    full_name: basicsRes.data?.full_name ?? null,
    email: basicsRes.data?.email ?? null,
    headline: basicsRes.data?.headline ?? null,
    location: basicsRes.data?.location ?? null,
    summary: basicsRes.data?.summary ?? null,
    linkedin_url: basicsRes.data?.linkedin_url ?? null,
  };

  return {
    basics,
    experiences: (expRes.data ?? []) as ProfileExperience[],
    education: (eduRes.data ?? []) as ProfileEducation[],
    skills: (skillRes.data ?? []) as ProfileSkill[],
    links: (linkRes.data ?? []) as ProfileLink[],
  };
}
