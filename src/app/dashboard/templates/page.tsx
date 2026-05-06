import { createClient } from "@/lib/supabase/server";
import { TemplateSelector } from "@/components/template-selector";

export const metadata = { title: "Templates — Adam Careers" };

export default async function DashboardTemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: selected } = await supabase
    .from("cv_template_selections")
    .select("template_id")
    .eq("user_id", user?.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CV templates</h1>
        <p className="mt-1 text-sm text-gray-600">
          Pick the design used for your tailored CVs and motivation letters.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <TemplateSelector initialTemplate={selected?.template_id} />
      </div>
    </div>
  );
}
