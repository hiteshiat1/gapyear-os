import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Compass,
  GraduationCap,
  Map,
  NotebookPen,
  Target,
  TestTube2,
} from "lucide-react";

const featureGroups = [
  {
    title: "A-Levels",
    description: "Everything your subjects need, in one place.",
    items: [
      { icon: GraduationCap, label: "Subject tracking", detail: "Self, school, and target grades side by side." },
      { icon: BookOpen, label: "Syllabus coverage", detail: "See exactly what's left to learn per topic." },
      { icon: Compass, label: "Tutoring & library", detail: "Bring outside support and resources into your plan." },
    ],
  },
  {
    title: "Progress",
    description: "Know where you actually stand, not just where you hope you are.",
    items: [
      { icon: TestTube2, label: "Assessments", detail: "Log mocks and papers as evidence, not guesswork." },
      { icon: Target, label: "Goals", detail: "Set targets per subject and track the gap." },
      { icon: BarChart3, label: "Analytics", detail: "Qualitative, honest progress labels — not vanity charts." },
    ],
  },
  {
    title: "Evidence & extracurriculars",
    description: "Build your UCAS case as you go, not the week before deadlines.",
    items: [
      { icon: NotebookPen, label: "Journal", detail: "Capture reflections while they're still fresh." },
      { icon: Map, label: "Work, projects & events", detail: "Turn what you're already doing into evidence." },
    ],
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFF] text-[#30343F]">
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center sm:pt-28">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#273469]">
          Alevs.io
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Plan. Study. Assess. Improve.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#30343F]/70">
          Private A-Level planning, assessment, progress, and evidence tracking for students —
          one place to see your subjects, your daily plan, and how far you've actually come.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-md bg-[#273469] px-6 py-3 text-sm font-semibold text-[#FAFAFF] transition hover:bg-[#1E2749]"
          >
            Sign in
          </Link>
          <Link
            href="/login#create-account"
            className="rounded-md border border-[#273469] px-6 py-3 text-sm font-semibold text-[#273469] transition hover:bg-[#E4D9FF]"
          >
            Create account
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {featureGroups.map((group) => (
            <div key={group.title} className="rounded-2xl border border-[#E4D9FF] bg-white p-6">
              <h2 className="text-lg font-semibold text-[#1E2749]">{group.title}</h2>
              <p className="mt-1 text-sm text-[#30343F]/60">{group.description}</p>
              <ul className="mt-5 space-y-4">
                {group.items.map((item) => (
                  <li key={item.label} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E4D9FF] text-[#273469]">
                      <item.icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-sm text-[#30343F]/60">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#E4D9FF] bg-[#E4D9FF]/40">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold text-[#1E2749]">
            Ready to see your subjects clearly?
          </h2>
          <p className="mt-3 text-base text-[#30343F]/70">
            Create a free student account and start tracking today's plan in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-md bg-[#273469] px-6 py-3 text-sm font-semibold text-[#FAFAFF] transition hover:bg-[#1E2749]"
            >
              Sign in
            </Link>
            <Link
              href="/login#create-account"
              className="rounded-md border border-[#273469] px-6 py-3 text-sm font-semibold text-[#273469] transition hover:bg-white"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
