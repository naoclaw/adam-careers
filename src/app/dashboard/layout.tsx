import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSignOut } from "@/components/dashboard-signout";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/chat", label: "AI Chat" },
  { href: "/dashboard/documents", label: "My Files" },
  { href: "/dashboard/linkedin", label: "LinkedIn" },
  { href: "/dashboard/templates", label: "Templates" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-6">
            <p className="text-xl font-bold text-gray-900">Adam Careers</p>
            <p className="text-xs text-gray-500">AI Job Helper</p>
          </div>
          <nav className="space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="mb-3 text-xs text-gray-500">Signed in as</p>
            <p className="mb-3 truncate text-sm font-medium text-gray-700">
              {user.email}
            </p>
            <DashboardSignOut />
          </div>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
