import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = {
  id?: string;
  name?: string;
  category?: string | null;
  level?: string | null;
};

function clean(b: Body) {
  return {
    name: (b.name ?? "").trim().slice(0, 80),
    category: b.category ? b.category.trim().slice(0, 40) : null,
    level: b.level ? b.level.trim().slice(0, 40) : null,
  };
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profile_skills")
    .insert({ user_id: user.id, ...clean(body) })
    .select("id")
    .single();

  if (error) {
    // 23505 = unique violation: skill already exists, just return ok
    if (error.code === "23505") return NextResponse.json({ id: null, duplicate: true });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
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
    .from("profile_skills")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
