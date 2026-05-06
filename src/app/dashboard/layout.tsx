import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardSignOut } from "@/components/dashboard-signout";
import { MobileNavToggle } from "@/components/mobile-nav-toggle";
import { Logo } from "@/components/logo";

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
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Logo size="sm" href="/dashboard" />
          <MobileNavToggle />
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside
          id="sidebar"
          className="hidden rounded-2xl border border-gray-200 bg-white p-4 lg:block"
        >
          <Link href="/dashboard" className="mb-6 block">
            <Logo size="md" href={null} withTag />
          </Link>
          <DashboardNav />
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs text-gray-500">Signed in as</p>
            <p className="mb-3 truncate text-sm font-medium text-gray-700">
              {user.email}
            </p>
            <DashboardSignOut />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
