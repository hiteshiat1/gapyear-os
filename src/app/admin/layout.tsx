import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireAdmin } from "@/lib/repositories/profiles";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/syllabuses", label: "Syllabuses" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/diagnostics", label: "Diagnostics" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap gap-2">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            {item.label}
          </Link>
        ))}
      </div>
      {children}
    </AppShell>
  );
}
