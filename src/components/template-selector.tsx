"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean two-column design for tech and startups.",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional ATS-friendly professional layout.",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Stylish visual template for design and marketing roles.",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant format focused on content.",
  },
] as const;

export function TemplateSelector({
  initialTemplate,
}: {
  initialTemplate?: string | null;
}) {
  const [selected, setSelected] = useState<string>(initialTemplate || "modern");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveTemplate() {
    setSaving(true);
    setStatus("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("cv_template_selections").upsert(
        {
          user_id: user.id,
          template_id: selected,
          template_data: { updated_at: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (error) throw error;
      setStatus("Template saved successfully.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <button
            type="button"
            key={template.id}
            onClick={() => setSelected(template.id)}
            className={`rounded-2xl border p-5 text-left transition ${
              selected === template.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <p className="text-base font-semibold text-gray-900">
              {template.name}
            </p>
            <p className="mt-1 text-sm text-gray-600">{template.description}</p>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={saveTemplate}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Template Choice"}
        </button>
        {status && <p className="text-sm text-gray-600">{status}</p>}
      </div>
      <p className="text-sm text-gray-500">
        PDF export hook is prepared; next step is adding generation with
        `react-pdf` or server-side rendering.
      </p>
    </div>
  );
}
