import { createClient } from "@/lib/supabase/server";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: docs } = await supabase
    .from("documents")
    .select("id")
    .eq("user_id", user?.id);

  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("user_id", user?.id);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to Adam Careers
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Use AI chat, upload your CV, and generate motivation letters from
          professional templates.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Files</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {docs?.length ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Chat Sessions</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {sessions?.length ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Templates</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">4</p>
        </div>
      </div>
    </div>
  );
}
