"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/jobs/new", label: "+ Tailor a CV", primary: true },
  { href: "/dashboard/jobs", label: "My CVs" },
  { href: "/dashboard/profile", label: "My Profile" },
  { href: "/dashboard/chat", label: "AI Coach" },
  { href: "/dashboard/documents", label: "Files" },
  { href: "/dashboard/linkedin", label: "LinkedIn Import" },
  { href: "/dashboard/templates", label: "Templates" },
  { href: "/dashboard/billing", label: "Billing" },
];

export function MobileNavToggle() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Menu
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-gray-900/50"
          />
          <nav className="absolute right-0 top-0 h-full w-72 max-w-[85%] overflow-y-auto bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold text-gray-900">Menu</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-2xl leading-none text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="space-y-1">
              {items.map((it) => {
                const active = pathname.startsWith(it.href) && it.href !== "/dashboard"
                  || pathname === it.href;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className={
                      it.primary
                        ? "block rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
                        : active
                          ? "block rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                          : "block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    }
                  >
                    {it.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
