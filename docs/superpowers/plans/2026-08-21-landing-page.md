# Landing Page + Login Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give signed-out visitors a marketing landing page at `/` (built from the app's real feature set, styled with the `#30343F/#FAFAFF/#E4D9FF/#273469/#1E2749` palette), remove "Continue with Google" from `/login`, and restyle `/login` to match.

**Architecture:** `src/app/page.tsx` becomes a server component that branches on auth state: signed-in users redirect to `/dashboard` (unchanged), signed-out users render a new `LandingPage` component. The login page loses its Google form and gets an anchor id + new palette classes.

**Tech Stack:** Next.js 16 App Router, React server components, Tailwind CSS (utility classes, no new dependencies), Supabase auth (`@/lib/supabase/server`).

---

## Reference: palette

| Token | Hex | Role |
|---|---|---|
| ink | `#30343F` | primary text |
| paper | `#FAFAFF` | page background |
| lavender | `#E4D9FF` | soft section bg / badges / dividers |
| indigo | `#273469` | primary buttons / brand emphasis |
| indigo-dark | `#1E2749` | button hover / darker accents |

These are arbitrary values, not in the existing Tailwind slate/rose scale, so they'll be used via Tailwind's arbitrary-value syntax, e.g. `bg-[#273469]`, `text-[#30343F]`, `hover:bg-[#1E2749]`.

## File structure

- Create: `src/components/landing-page.tsx` — the marketing page content (hero, feature sections, closing CTA). Pure presentational component, no data fetching.
- Modify: `src/app/page.tsx` — branch on auth state, render `LandingPage` or redirect.
- Modify: `src/app/login/page.tsx` — remove Google form, add anchor id, apply new palette.

---

### Task 1: Build the `LandingPage` component

**Files:**
- Create: `src/components/landing-page.tsx`

- [ ] **Step 1: Write the component**

```tsx
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
          ALevels.io
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `landing-page.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing-page.tsx
git commit -m "Add marketing landing page component"
```

---

### Task 2: Wire `/` to branch on auth state

**Files:**
- Modify: `src/app/page.tsx`

Current content:
```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
```

- [ ] **Step 1: Replace with auth-branching version**

```tsx
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing-page";

export default async function RootPage() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
```

This mirrors the pattern already used in `requireUser()` (`src/lib/repositories/common.ts`) — `getAuthenticatedUser()` returns `null` when signed out or when Supabase isn't configured, so the landing page renders in both of those cases, which is correct (no env vars configured shouldn't crash the homepage).

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds; route table shows `ƒ /` (dynamic, because `getAuthenticatedUser` calls `cookies()`), not `○ /` (static).

- [ ] **Step 3: Manual check signed out**

Run: `npm run dev`, then open `http://localhost:3000/` in a browser without an active session (or in an incognito window).
Expected: landing page renders with hero, three feature columns, and two CTA sections.

- [ ] **Step 4: Manual check signed in**

While signed in (existing session/cookie), open `http://localhost:3000/`.
Expected: immediate redirect to `/dashboard`.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "Render landing page for signed-out visitors at /"
```

---

### Task 3: Remove Google sign-in and restyle `/login`

**Files:**
- Modify: `src/app/login/page.tsx`

Current content (for reference, full file):
```tsx
import { signInWithGoogleAction, signInWithPasswordAction, signUpWithPasswordAction } from "@/actions/auth-actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Card, PageHeader } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950">
      <div className="mx-auto max-w-md">
        <PageHeader
          title="Sign in"
          description="Private A-Level planning, assessment, progress, and evidence tracking for students."
        />
        {params.error ? (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {params.error}
          </div>
        ) : null}
        {params.message ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {params.message}
          </div>
        ) : null}
        {!isSupabaseConfigured ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Supabase is not configured yet. Add environment variables before login will work.
          </div>
        ) : null}
        <Card>
          <form action={signInWithPasswordAction} className="space-y-4">
            <label className="block text-sm font-medium">
              Email
              <input name="email" type="email" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input name="password" type="password" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <button className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              Sign in
            </button>
          </form>
          <form action={signInWithGoogleAction} className="mt-3">
            <button className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">
              Continue with Google
            </button>
          </form>
        </Card>
        <Card className="mt-4">
          <form action={signUpWithPasswordAction} className="space-y-4">
            <p className="text-sm font-medium">Create student account</p>
            <label className="block text-sm font-medium">
              Full name
              <input name="fullName" placeholder="Your name" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input name="email" type="email" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <button className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">
              Create account
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}
```

- [ ] **Step 1: Replace with the cleaned-up, restyled version**

```tsx
import { signInWithPasswordAction, signUpWithPasswordAction } from "@/actions/auth-actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Card, PageHeader } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#FAFAFF] px-4 py-10 text-[#30343F]">
      <div className="mx-auto max-w-md">
        <PageHeader
          title="Sign in"
          description="Private A-Level planning, assessment, progress, and evidence tracking for students."
        />
        {params.error ? (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {params.error}
          </div>
        ) : null}
        {params.message ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {params.message}
          </div>
        ) : null}
        {!isSupabaseConfigured ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Supabase is not configured yet. Add environment variables before login will work.
          </div>
        ) : null}
        <Card className="border-[#E4D9FF]">
          <form action={signInWithPasswordAction} className="space-y-4">
            <label className="block text-sm font-medium">
              Email
              <input name="email" type="email" required className="mt-1 w-full rounded-md border border-[#E4D9FF] px-3 py-2 focus:border-[#273469] focus:outline-none" />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input name="password" type="password" required className="mt-1 w-full rounded-md border border-[#E4D9FF] px-3 py-2 focus:border-[#273469] focus:outline-none" />
            </label>
            <button className="w-full rounded-md bg-[#273469] px-4 py-2 text-sm font-medium text-[#FAFAFF] transition hover:bg-[#1E2749]">
              Sign in
            </button>
          </form>
        </Card>
        <Card id="create-account" className="mt-4 border-[#E4D9FF] scroll-mt-10">
          <form action={signUpWithPasswordAction} className="space-y-4">
            <p className="text-sm font-medium">Create student account</p>
            <label className="block text-sm font-medium">
              Full name
              <input name="fullName" placeholder="Your name" className="mt-1 w-full rounded-md border border-[#E4D9FF] px-3 py-2 focus:border-[#273469] focus:outline-none" />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input name="email" type="email" required className="mt-1 w-full rounded-md border border-[#E4D9FF] px-3 py-2 focus:border-[#273469] focus:outline-none" />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-md border border-[#E4D9FF] px-3 py-2 focus:border-[#273469] focus:outline-none" />
            </label>
            <button className="w-full rounded-md border border-[#273469] px-4 py-2 text-sm font-medium text-[#273469] transition hover:bg-[#E4D9FF]">
              Create account
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}
```

Note: `Card` in `src/components/ui.tsx` currently accepts only `children` and `className` — it does not forward an `id` prop. Confirmed by inspection; Step 1a below is required, not conditional.

- [ ] **Step 1a: Add `id` support to `Card`**

Update `src/components/ui.tsx`:

```tsx
export function Card({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={clsx(
        "rounded-lg border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds, no unused-import warnings for `signInWithGoogleAction`.

- [ ] **Step 3: Manual check**

Run: `npm run dev`, open `http://localhost:3000/login`.
Expected: no "Continue with Google" button. Page uses the new palette (indigo buttons, lavender borders, off-white background).

Open `http://localhost:3000/login#create-account`.
Expected: page scrolls to the "Create student account" card.

- [ ] **Step 4: Commit**

```bash
git add src/app/login/page.tsx src/components/ui.tsx
git commit -m "Remove Google sign-in and restyle login page with new palette"
```

---

### Task 4: Final verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: all routes compile, `/` and `/login` show as dynamic (`ƒ`) in the route table (both call `cookies()` transitively).

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual end-to-end walk**

1. Sign out (or use incognito). Visit `/`. Confirm landing page renders, palette looks correct, no console errors.
2. Click "Sign in" → lands on `/login`, no Google button.
3. Go back to `/`, click "Create account" → lands on `/login#create-account`, scrolled to the signup card.
4. Sign in with a real test account. Confirm `redirectAfterAuth()` sends you to `/` and `/` immediately redirects to `/dashboard` (not to the landing page).

- [ ] **Step 4: Commit any final fixups**

```bash
git add -A
git commit -m "Fix up landing page verification issues"
```//only if there were fixups; skip if nothing changed
