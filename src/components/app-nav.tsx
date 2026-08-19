"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Home,
  Library,
  Lightbulb,
  Map,
  NotebookPen,
  Settings,
  ShieldCheck,
  Target,
  TestTube2,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";

const ICONS = {
  BarChart3,
  BookOpen,
  CalendarDays,
  CircleUserRound,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Home,
  Library,
  Lightbulb,
  Map,
  NotebookPen,
  Settings,
  ShieldCheck,
  Target,
  TestTube2,
  UserCheck,
  Users,
  Wrench,
} as const;

export type NavIconName = keyof typeof ICONS;

export type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export type NavEntry =
  | { kind: "item"; item: NavItem }
  | { kind: "section"; section: NavSection };

export function AppNav({
  entries,
  navClassName,
  sectionTitleClassName,
}: {
  entries: NavEntry[];
  navClassName: string;
  sectionTitleClassName: string;
}) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const entry of entries) {
      if (entry.kind === "section") {
        initial[entry.section.title] = entry.section.items.some((item) => isActive(pathname, item.href));
      }
    }
    return initial;
  });

  return (
    <nav className="mt-10 space-y-1">
      {entries.map((entry) => {
        if (entry.kind === "item") {
          return <NavLink key={entry.item.href} item={entry.item} active={isActive(pathname, entry.item.href)} className={navClassName} />;
        }

        const { section } = entry;
        const isOpen = openSections[section.title] ?? false;

        return (
          <div key={section.title}>
            <button
              type="button"
              onClick={() => setOpenSections((current) => ({ ...current, [section.title]: !current[section.title] }))}
              aria-expanded={isOpen}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${sectionTitleClassName}`}
            >
              {section.title}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen ? (
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} className={navClassName} />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

function NavLink({ item, active, className }: { item: NavItem; active: boolean; className: string }) {
  const Icon = ICONS[item.icon];
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${className} ${active ? "font-semibold" : ""}`}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
