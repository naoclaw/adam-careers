import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = {
  id?: string;
  school?: string;
  degree?: string | null;
  field?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
};

function clean(b: Body) {
  return {
    school: (b.school ?? "").trim().slice(0, 200),
    degree: b.degree ? b.degree.trim().slice(0, 200) : null,
    field: b.field ? b.field.trim().slice(0, 200) : null,
    start_date: b.start_date || null,
    end_date: b.end_date || null,
    description: b.description ? b.description.slice(0, 2000) : null,
  };
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.school) {
    return NextResponse.json({ error: "school is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profile_education")
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
    .from("profile_education")
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
    .from("profile_education")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
