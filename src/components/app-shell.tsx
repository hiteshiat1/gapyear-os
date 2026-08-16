import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Home,
  Library,
  Lightbulb,
  Map,
  NotebookPen,
  Settings,
  Target,
  TestTube2,
  Users,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/subjects", label: "Subjects", icon: GraduationCap },
  { href: "/tests", label: "Tests & Mocks", icon: TestTube2 },
  { href: "/errors", label: "Error Log", icon: ClipboardCheck },
  { href: "/tutoring", label: "Tutoring", icon: Users },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/startup", label: "Startup", icon: Lightbulb },
  { href: "/projects", label: "Projects", icon: Wrench },
  { href: "/events", label: "NYC / Events", icon: Map },
  { href: "/library", label: "Library", icon: Library },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <Link href="/" className="block px-2">
          <p className="text-lg font-semibold tracking-tight">Sachith Gap-Year OS</p>
          <p className="mt-1 text-sm text-slate-500">Learn. Test. Analyse. Demonstrate.</p>
        </Link>
        <nav className="mt-7 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <p className="text-base font-semibold">Sachith Gap-Year OS</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {navItems.slice(0, 8).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
