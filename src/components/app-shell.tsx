import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Home,
  Library,
  Lightbulb,
  LogOut,
  Map,
  NotebookPen,
  CircleUserRound,
  Settings,
  Target,
  TestTube2,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { signOutAction } from "@/actions/auth-actions";
import { getStudentOnboardingProfile } from "@/lib/repositories/onboarding";
import { getCurrentProfile } from "@/lib/repositories/profiles";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/onboarding", label: "Onboarding", icon: UserCheck },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/universities", label: "Universities", icon: GraduationCap },
  { href: "/careers", label: "Careers", icon: Users },
  { href: "/future-map", label: "Future Map", icon: Map },
  { href: "/subjects", label: "Subjects", icon: GraduationCap },
  { href: "/tests", label: "Assessments", icon: TestTube2 },
  { href: "/errors", label: "Error Log", icon: ClipboardCheck },
  { href: "/tutoring", label: "Tutoring", icon: Users },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/startup", label: "Evidence: Work", icon: Lightbulb },
  { href: "/projects", label: "Evidence: Projects", icon: Wrench },
  { href: "/events", label: "Evidence: Events", icon: Map },
  { href: "/library", label: "Library", icon: Library },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/profile", label: "Profile", icon: CircleUserRound },
  { href: "/settings/reference-data", label: "Reference Data", icon: Library },
  { href: "/settings/syllabus", label: "Syllabus", icon: BookOpen },
  { href: "/settings/import", label: "Import", icon: ClipboardCheck },
];

export async function AppShell({ children }: { children: ReactNode }) {
  const [profile, studentProfile] = await Promise.all([
    getCurrentProfile(),
    getStudentOnboardingProfile().catch(() => null),
  ]);
  const displayName = profile?.fullName ?? "Student";
  const initial = displayName.trim().charAt(0).toUpperCase() || "S";
  const tone = studentProfile?.visualTone ?? "masculine";
  const theme = tone === "feminine" ? feminineTheme : masculineTheme;

  return (
    <div className={`min-h-screen ${theme.view} text-slate-950`}>
      <aside className={`fixed inset-y-0 left-0 hidden w-72 border-r px-4 py-5 lg:block ${theme.menu}`}>
        <div className="group relative px-2">
          <div className="flex items-start gap-3">
            <button
              aria-label="Profile menu"
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${theme.avatar}`}
            >
              {initial}
            </button>
            <Link href="/" className="block min-w-0">
              <p className="text-lg font-semibold tracking-tight">ALevels.io</p>
              <p className={`mt-1 text-xs ${theme.subtle}`}>Plan. Study. Assess. Improve.</p>
            </Link>
          </div>
          <div className="pointer-events-none absolute left-2 top-12 z-20 flex translate-y-1 gap-2 opacity-0 transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <Link href="/settings/profile" className={`rounded-md px-3 py-1.5 text-xs font-medium shadow-sm ${theme.softButton}`}>
              Profile
            </Link>
            <form action={signOutAction}>
              <button className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium shadow-sm ${theme.softButton}`}>
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mt-10 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${theme.nav}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className={`sticky top-0 z-10 border-b px-4 py-3 backdrop-blur lg:hidden ${theme.menu}`}>
          <div className="group relative flex items-start gap-3">
            <button
              aria-label="Profile menu"
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${theme.avatar}`}
            >
              {initial}
            </button>
            <div className="min-w-0">
              <p className="text-base font-semibold">ALevels.io</p>
              <p className={`text-xs ${theme.subtle}`}>Plan. Study. Assess. Improve.</p>
            </div>
            <div className="pointer-events-none absolute left-0 top-12 z-20 flex translate-y-1 gap-2 opacity-0 transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <Link href="/settings/profile" className={`rounded-md px-3 py-1.5 text-xs font-medium shadow-sm ${theme.softButton}`}>
                Profile
              </Link>
              <form action={signOutAction}>
                <button className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium shadow-sm ${theme.softButton}`}>
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {navItems.slice(0, 8).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-sm ${theme.mobileNav}`}
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

const masculineTheme = {
  menu: "border-slate-800 bg-slate-950 text-white",
  view: "bg-slate-100",
  muted: "text-slate-300",
  subtle: "text-slate-400",
  avatar: "bg-slate-800 text-slate-100 hover:bg-slate-700",
  icon: "text-slate-100 hover:bg-slate-800",
  nav: "text-slate-300 hover:bg-slate-800 hover:text-white",
  softButton: "bg-slate-800 text-slate-100 hover:bg-slate-700",
  mobileNav: "border-slate-700 bg-slate-900 text-slate-100",
};

const feminineTheme = {
  menu: "border-rose-200 bg-rose-100 text-rose-950",
  view: "bg-orange-50",
  muted: "text-rose-700",
  subtle: "text-rose-500",
  avatar: "bg-white text-rose-900 hover:bg-rose-50",
  icon: "text-rose-900 hover:bg-rose-200",
  nav: "text-rose-800 hover:bg-rose-200 hover:text-rose-950",
  softButton: "bg-white/75 text-rose-900 hover:bg-white",
  mobileNav: "border-rose-200 bg-white/70 text-rose-900",
};
