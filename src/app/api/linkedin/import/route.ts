import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Calls Composio's LinkedIn MCP to fetch the authenticated user's LinkedIn profile
// and saves it to the profiles table in Supabase.
export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Call Composio LinkedIn MCP endpoint to get current user's profile
    const composioRes = await fetch(
      "https://connect.composio.dev/mcp/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.COMPOSIO_API_KEY ?? ""}`,
        },
        body: JSON.stringify({
          toolkit: "linkedin",
          tool: "LINKEDIN_GET_MY_INFO",
          arguments: {},
        }),
      }
    );

    if (!composioRes.ok) {
      throw new Error(`Composio responded with ${composioRes.status}`);
    }

    const composioData = await composioRes.json();
    const li = composioData?.data ?? composioData;

    // Map LinkedIn fields to our profiles schema
    const update: Record<string, string | null> = {
      full_name: li.localizedFirstName
        ? `${li.localizedFirstName} ${li.localizedLastName ?? ""}`.trim()
        : li.name ?? null,
      headline: li.headline ?? li.localizedHeadline ?? null,
      linkedin_url: li.profileUrl ?? li.vanityName
        ? `https://linkedin.com/in/${li.vanityName}`
        : null,
      linkedin_id: li.id ?? li.sub ?? null,
      summary: li.summary ?? null,
      location: li.location?.name ?? null,
      linkedin_raw: JSON.stringify(li),
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", user.id);

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, profile: update });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
