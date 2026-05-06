import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = {
  id?: string;
  label?: string;
  url?: string;
};

function clean(b: Body) {
  return {
    label: (b.label ?? "").trim().slice(0, 80),
    url: (b.url ?? "").trim().slice(0, 500),
  };
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.label || !body?.url) {
    return NextResponse.json({ error: "label and url are required" }, { status: 400 });
  }
  const c = clean(body);
  try {
    new URL(c.url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profile_links")
    .insert({ user_id: user.id, ...c })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
    .from("profile_links")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
