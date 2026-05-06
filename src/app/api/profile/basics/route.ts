import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED = [
  "full_name",
  "headline",
  "summary",
  "location",
  "linkedin_url",
] as const;
type AllowedKey = (typeof ALLOWED)[number];

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: Partial<Record<AllowedKey, string | null>> = {};
  for (const k of ALLOWED) {
    if (k in body) {
      const raw = body[k];
      if (raw === null || raw === "") update[k] = null;
      else if (typeof raw === "string") update[k] = raw.slice(0, 2000);
      else
        return NextResponse.json(
          { error: `Field ${k} must be a string` },
          { status: 400 },
        );
    }
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, email: user.email ?? null, ...update, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
  if (error) {
    console.error("profile upsert", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
