import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendWelcomeEmail } from "@/lib/email/send";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    const user = data?.user;
    if (user) {
      const created = new Date(user.created_at).getTime();
      const isFresh = Date.now() - created < 60_000;
      if (isFresh) {
        const svc = createServiceClient();
        let alreadySent = false;
        if (svc) {
          const { data: prior } = await svc
            .from("email_log")
            .select("id")
            .eq("user_id", user.id)
            .eq("type", "welcome")
            .limit(1)
            .maybeSingle();
          alreadySent = !!prior;
        }
        if (!alreadySent) {
          sendWelcomeEmail({
            userId: user.id,
            toEmail: user.email ?? null,
            fullName:
              (user.user_metadata?.full_name as string | undefined) ??
              (user.user_metadata?.name as string | undefined) ??
              null,
          }).catch((err) => console.error("welcome email", err));
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
