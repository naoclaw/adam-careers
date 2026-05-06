"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/jobs/new", label: "Tailor a CV", primary: true },
  { href: "/dashboard/jobs", label: "My CVs" },
  { href: "/dashboard/profile", label: "My Profile" },
  { href: "/dashboard/chat", label: "AI Coach" },
  { href: "/dashboard/documents", label: "Files" },
  { href: "/dashboard/linkedin", label: "LinkedIn Import" },
  { href: "/dashboard/templates", label: "Templates" },
  { href: "/dashboard/billing", label: "Billing" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === item.href
            : item.href === "/dashboard/jobs"
              ? pathname === "/dashboard/jobs" ||
                pathname.startsWith("/dashboard/generations")
              : pathname.startsWith(item.href);
        const base = "block rounded-lg px-3 py-2 text-sm transition";
        if (item.primary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${base} font-semibold ${
                active
                  ? "bg-blue-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              + {item.label}
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? `${base} bg-blue-50 font-semibold text-blue-700`
                : `${base} font-medium text-gray-700 hover:bg-gray-50`
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
