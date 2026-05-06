"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  FullProfile,
  ProfileEducation,
  ProfileExperience,
  ProfileLink,
  ProfileSkill,
} from "@/lib/profile/types";

type TabId = "basics" | "experience" | "education" | "skills" | "links";

export function ProfileEditor({ initial }: { initial: FullProfile }) {
  const [tab, setTab] = useState<TabId>("basics");

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "basics", label: "Basics" },
    { id: "experience", label: "Experience", count: initial.experiences.length },
    { id: "education", label: "Education", count: initial.education.length },
    { id: "skills", label: "Skills", count: initial.skills.length },
    { id: "links", label: "Links", count: initial.links.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === t.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 text-xs text-gray-400">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "basics" && <BasicsForm initial={initial.basics} />}
      {tab === "experience" && <ExperienceList initial={initial.experiences} />}
      {tab === "education" && <EducationList initial={initial.education} />}
      {tab === "skills" && <SkillsList initial={initial.skills} />}
      {tab === "links" && <LinksList initial={initial.links} />}
    </div>
  );
}

// ─── Basics ────────────────────────────────────────────────────────────────

function BasicsForm({ initial }: { initial: FullProfile["basics"] }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/profile/basics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Save failed");
      setStatus("Saved.");
      router.refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
      <Field
        label="Full name"
        value={form.full_name ?? ""}
        onChange={(v) => setForm({ ...form, full_name: v })}
      />
      <Field
        label="Headline"
        placeholder="e.g. Senior Software Engineer"
        value={form.headline ?? ""}
        onChange={(v) => setForm({ ...form, headline: v })}
      />
      <Field
        label="Location"
        placeholder="e.g. Paris, France"
        value={form.location ?? ""}
        onChange={(v) => setForm({ ...form, location: v })}
      />
      <Field
        label="LinkedIn URL"
        placeholder="https://linkedin.com/in/yourname"
        value={form.linkedin_url ?? ""}
        onChange={(v) => setForm({ ...form, linkedin_url: v })}
      />
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Summary</label>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.summary ?? ""}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          placeholder="A few sentences about who you are professionally."
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save basics"}
        </button>
        {status && <p className="text-sm text-gray-600">{status}</p>}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

// ─── Experience ────────────────────────────────────────────────────────────

type ExpDraft = Omit<ProfileExperience, "id" | "order_index"> & { id?: string };

function ExperienceList({ initial }: { initial: ProfileExperience[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);

  function emptyDraft(): ExpDraft {
    return {
      company: "",
      title: "",
      location: null,
      start_date: null,
      end_date: null,
      current: false,
      description: null,
      achievements: [],
    };
  }

  async function handleSaved() {
    router.refresh();
  }

  async function deleteExp(id: string) {
    if (!confirm("Delete this experience?")) return;
    const res = await fetch(`/api/profile/experience?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(items.filter((i) => i.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {items.map((it) => (
        <ExperienceCard
          key={it.id}
          initial={it}
          onSaved={handleSaved}
          onDelete={() => deleteExp(it.id)}
        />
      ))}
      {adding ? (
        <ExperienceCard
          initial={{ id: "", order_index: 0, ...emptyDraft() }}
          isNew
          onSaved={() => {
            setAdding(false);
            router.refresh();
          }}
          onDelete={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-white p-4 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600"
        >
          + Add experience
        </button>
      )}
    </div>
  );
}

function ExperienceCard({
  initial,
  onSaved,
  onDelete,
  isNew = false,
}: {
  initial: ProfileExperience;
  onSaved: () => void;
  onDelete: () => void;
  isNew?: boolean;
}) {
  const [draft, setDraft] = useState<ProfileExperience>(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const url = "/api/profile/experience";
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, id: isNew ? undefined : draft.id }),
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Save failed");
      setStatus("Saved.");
      onSaved();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Job title"
          value={draft.title}
          onChange={(v) => setDraft({ ...draft, title: v })}
        />
        <Field
          label="Company"
          value={draft.company}
          onChange={(v) => setDraft({ ...draft, company: v })}
        />
        <Field
          label="Location"
          value={draft.location ?? ""}
          onChange={(v) => setDraft({ ...draft, location: v })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Start"
            type="month"
            value={(draft.start_date ?? "").slice(0, 7)}
            onChange={(v) => setDraft({ ...draft, start_date: v ? `${v}-01` : null })}
          />
          <Field
            label="End"
            type="month"
            value={draft.current ? "" : (draft.end_date ?? "").slice(0, 7)}
            onChange={(v) => setDraft({ ...draft, end_date: v ? `${v}-01` : null })}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={draft.current}
          onChange={(e) => setDraft({ ...draft, current: e.target.checked })}
        />
        I currently work here
      </label>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={draft.description ?? ""}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Achievements (one per line)
        </label>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={(draft.achievements ?? []).join("\n")}
          onChange={(e) =>
            setDraft({
              ...draft,
              achievements: e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder={"Led migration to Kubernetes, cutting deploy time 40%\nMentored 4 engineers"}
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : isNew ? "Add" : "Save"}
        </button>
        <div className="flex items-center gap-3">
          {status && <p className="text-xs text-gray-500">{status}</p>}
          <button
            type="button"
            onClick={onDelete}
            className="text-sm text-rose-600 hover:underline"
          >
            {isNew ? "Cancel" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Education ─────────────────────────────────────────────────────────────

function EducationList({ initial }: { initial: ProfileEducation[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);

  async function deleteEdu(id: string) {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/profile/education?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(items.filter((i) => i.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {items.map((it) => (
        <EducationCard
          key={it.id}
          initial={it}
          onSaved={() => router.refresh()}
          onDelete={() => deleteEdu(it.id)}
        />
      ))}
      {adding ? (
        <EducationCard
          isNew
          initial={{
            id: "",
            order_index: 0,
            school: "",
            degree: null,
            field: null,
            start_date: null,
            end_date: null,
            description: null,
          }}
          onSaved={() => {
            setAdding(false);
            router.refresh();
          }}
          onDelete={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-white p-4 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600"
        >
          + Add education
        </button>
      )}
    </div>
  );
}

function EducationCard({
  initial,
  onSaved,
  onDelete,
  isNew = false,
}: {
  initial: ProfileEducation;
  onSaved: () => void;
  onDelete: () => void;
  isNew?: boolean;
}) {
  const [draft, setDraft] = useState<ProfileEducation>(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/profile/education", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, id: isNew ? undefined : draft.id }),
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Save failed");
      onSaved();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="School"
          value={draft.school}
          onChange={(v) => setDraft({ ...draft, school: v })}
        />
        <Field
          label="Degree"
          value={draft.degree ?? ""}
          onChange={(v) => setDraft({ ...draft, degree: v })}
        />
        <Field
          label="Field of study"
          value={draft.field ?? ""}
          onChange={(v) => setDraft({ ...draft, field: v })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Start"
            type="month"
            value={(draft.start_date ?? "").slice(0, 7)}
            onChange={(v) => setDraft({ ...draft, start_date: v ? `${v}-01` : null })}
          />
          <Field
            label="End"
            type="month"
            value={(draft.end_date ?? "").slice(0, 7)}
            onChange={(v) => setDraft({ ...draft, end_date: v ? `${v}-01` : null })}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : isNew ? "Add" : "Save"}
        </button>
        <div className="flex items-center gap-3">
          {status && <p className="text-xs text-gray-500">{status}</p>}
          <button
            type="button"
            onClick={onDelete}
            className="text-sm text-rose-600 hover:underline"
          >
            {isNew ? "Cancel" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skills ────────────────────────────────────────────────────────────────

function SkillsList({ initial }: { initial: ProfileSkill[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("technical");

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const res = await fetch("/api/profile/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed, category }),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.id) {
        setItems([
          ...items,
          { id: data.id, name: trimmed, category, level: null },
        ]);
      }
      setName("");
      router.refresh();
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/profile/skills?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(items.filter((i) => i.id !== id));
      router.refresh();
    }
  }

  const grouped: Record<string, ProfileSkill[]> = {};
  for (const s of items) {
    const cat = s.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="e.g. TypeScript"
            className="min-w-[200px] flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="technical">Technical</option>
            <option value="tool">Tool</option>
            <option value="language">Language</option>
            <option value="soft">Soft skill</option>
          </select>
          <button
            type="button"
            onClick={add}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat} className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {cat}
          </p>
          <div className="flex flex-wrap gap-2">
            {list.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {s.name}
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  aria-label={`Remove ${s.name}`}
                  className="text-blue-400 hover:text-rose-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          No skills yet. Add at least 3 to start generating CVs.
        </p>
      )}
    </div>
  );
}

// ─── Links ─────────────────────────────────────────────────────────────────

function LinksList({ initial }: { initial: ProfileLink[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  async function add() {
    if (!label.trim() || !url.trim()) return;
    const res = await fetch("/api/profile/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, url }),
    });
    const data = await res.json();
    if (res.ok && data.id) {
      setItems([...items, { id: data.id, label, url }]);
      setLabel("");
      setUrl("");
      router.refresh();
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/profile/links?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(items.filter((i) => i.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 grid gap-3 sm:grid-cols-[140px_1fr_auto]">
        <input
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
        <input
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
        {items.length === 0 && (
          <li className="p-5 text-center text-sm text-gray-500">No links yet.</li>
        )}
        {items.map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{l.label}</p>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-sm text-blue-600 hover:underline"
              >
                {l.url}
              </a>
            </div>
            <button
              type="button"
              onClick={() => remove(l.id)}
              className="text-sm text-rose-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
