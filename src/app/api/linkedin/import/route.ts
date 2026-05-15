import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type LinkedInProfile = {
  id?: string;
  sub?: string;
  name?: string;
  localizedFirstName?: string;
  localizedLastName?: string;
  headline?: string;
  localizedHeadline?: string;
  profileUrl?: string;
  vanityName?: string;
  summary?: string;
  email?: string;
  location?: { name?: string } | string;
};

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.COMPOSIO_API_KEY) {
    return NextResponse.json(
      { error: "LinkedIn import is not configured" },
      { status: 503 },
    );
  }

  let li: LinkedInProfile;
  try {
    const composioRes = await fetch(
      "https://connect.composio.dev/mcp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-consumer-api-key": process.env.COMPOSIO_API_KEY,
          "Accept": "application/json, text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "LINKEDIN_GET_MY_INFO",
            arguments: {},
          },
        }),
      },
    );

    if (!composioRes.ok) {
      const text = await composioRes.text();
      console.error("Composio error", composioRes.status, text);
      return NextResponse.json(
        { error: "LinkedIn provider failed. Make sure your LinkedIn account is connected." },
        { status: 502 },
      );
    }

    const composioData = await composioRes.json();
    // MCP format: result.content[0].text contains JSON data
    const resultText = composioData?.result?.content?.[0]?.text;
    if (resultText) {
      try {
        const parsed = JSON.parse(resultText);
        li = parsed as LinkedInProfile;
      } catch {
        li = (composioData?.data ?? composioData) as LinkedInProfile;
      }
    } else {
      li = (composioData?.data ?? composioData) as LinkedInProfile;
    }
  } catch (err) {
    console.error("Composio fetch failed", err);
    return NextResponse.json(
      { error: "Could not reach LinkedIn provider" },
      { status: 502 },
    );
  }

  const fullName = li.localizedFirstName
    ? `${li.localizedFirstName} ${li.localizedLastName ?? ""}`.trim()
    : (li.name ?? null);

  const linkedinUrl =
    li.profileUrl ??
    (li.vanityName ? `https://linkedin.com/in/${li.vanityName}` : null);

  const locationName =
    typeof li.location === "string" ? li.location : (li.location?.name ?? null);

  const profile = {
    id: user.id,
    full_name: fullName,
    email: li.email ?? user.email ?? null,
    headline: li.headline ?? li.localizedHeadline ?? null,
    linkedin_url: linkedinUrl,
    linkedin_id: li.id ?? li.sub ?? null,
    summary: li.summary ?? null,
    location: locationName,
    linkedin_raw: li,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" });

  if (upsertError) {
    console.error("Profile upsert failed", upsertError);
    return NextResponse.json(
      { error: "Could not save profile" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, profile });
}
