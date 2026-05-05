"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/chat", label: "AI Chat" },
  { href: "/dashboard/documents", label: "My Files" },
  { href: "/dashboard/linkedin", label: "LinkedIn" },
  { href: "/dashboard/templates", label: "Templates" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "block rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                : "block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
