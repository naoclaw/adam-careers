import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = {
  id?: string;
  company?: string;
  title?: string;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  current?: boolean;
  description?: string | null;
  achievements?: string[];
};

function clean(b: Body) {
  return {
    company: (b.company ?? "").trim().slice(0, 200),
    title: (b.title ?? "").trim().slice(0, 200),
    location: b.location ? b.location.trim().slice(0, 200) : null,
    start_date: b.start_date || null,
    end_date: b.current ? null : b.end_date || null,
    current: !!b.current,
    description: b.description ? b.description.slice(0, 4000) : null,
    achievements: Array.isArray(b.achievements)
      ? b.achievements.filter((a) => typeof a === "string").slice(0, 20).map((a) => a.slice(0, 500))
      : [],
  };
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.company || !body.title) {
    return NextResponse.json({ error: "company and title are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profile_experiences")
    .insert({ user_id: user.id, ...clean(body) })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("profile_experiences")
    .update({ ...clean(body), updated_at: new Date().toISOString() })
    .eq("id", body.id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("profile_experiences")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
