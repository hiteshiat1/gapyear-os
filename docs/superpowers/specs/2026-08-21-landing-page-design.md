# Landing page + login cleanup

## Problem

`/` currently redirects unconditionally to `/dashboard`, so signed-out visitors land straight on the sign-in form with no marketing context. The login page also offers a non-functional/unwanted "Continue with Google" option, and there's no dedicated entry point that sells the product before asking for credentials.

## Goals

- Give signed-out visitors a real landing page at `/` describing what Alevs.io does, built from the app's actual feature set.
- Remove "Continue with Google" from the login page entirely.
- Provide two clear calls to action (SIGN IN / CREATE ACCOUNT) that route into the existing `/login` page.
- Apply the palette `#30343F / #FAFAFF / #E4D9FF / #273469 / #1E2749` to the landing page, and restyle `/login` to match so the two pages feel like one experience.

## Non-goals

- No new `/signup` route — sign-up stays as the second form on `/login`.
- No changes to the Supabase auth actions themselves (`signInWithPasswordAction`, `signUpWithPasswordAction`) beyond removing the Google form's usage.
- No changes to the in-app dashboard theme (`app-shell.tsx` masculine/feminine themes) — this is scoped to the signed-out marketing surface only.

## Design

### Routing (`src/app/page.tsx`)

Currently:
```ts
export default function RootPage() {
  redirect("/dashboard");
}
```

New behavior:
- Server component checks the current user via the existing auth helper (`getAuthenticatedUser` from `@/lib/supabase/server`, the same one `requireUser` uses).
- Signed in → `redirect("/dashboard")` (unchanged behavior).
- Signed out (or Supabase not configured) → render the new `LandingPage`.

This keeps `/` as a single route with conditional rendering rather than a separate `/welcome` path, so existing links to `/` keep working for logged-in users.

### Landing page content

Sourced from the real nav structure in `src/components/app-shell.tsx`, not invented features:

- **Hero**: "Alevs.io" wordmark, tagline "Plan. Study. Assess. Improve.", one-paragraph description ("Private A-Level planning, assessment, progress, and evidence tracking for students."), SIGN IN + CREATE ACCOUNT buttons.
- **Feature groups**, mirroring the app's own sidebar sections:
  - *A-Levels*: subject tracking, syllabus coverage, tutoring, library resources.
  - *Progress*: assessments, goals, error log, analytics.
  - *Evidence & extracurriculars*: journal, work/project/event evidence tracking (UCAS-relevant).
  - *Next steps*: explore, careers, universities, future map.
- **Closing CTA band** repeating SIGN IN / CREATE ACCOUNT.

### Visual style

- Background `#FAFAFF`, primary text `#30343F`.
- Primary buttons / hero emphasis in `#273469`, hover/darker state `#1E2749`.
- `#E4D9FF` used sparingly for soft section backgrounds, badges, and dividers — not as a dominant fill.
- Distinct from the in-app slate/rose dashboard theme so the landing page reads as marketing rather than app chrome.
- Built directly with Tailwind utility classes (project convention — no CSS-in-JS or new component library).

### Login page (`src/app/login/page.tsx`)

- Remove the `signInWithGoogleAction` form and button entirely (import of `signInWithGoogleAction` removed too).
- Add `id="create-account"` to the sign-up `Card` so `/login#create-account` scroll-anchors to it.
- Restyle to the new palette (currently plain `slate-*` Tailwind classes) so it visually matches the landing page. Structure/behavior of the two forms (sign in, create account) stays the same — this is a palette/visual pass only, not a UX rework.

### Button targets

- Landing page **SIGN IN** → `/login`
- Landing page **CREATE ACCOUNT** → `/login#create-account`

## Testing

- `npm run build` to confirm `/` still compiles and correctly branches on auth state (dynamic rendering, not static — it reads cookies).
- Manual check: visiting `/` while signed out shows the landing page; visiting while signed in redirects to `/dashboard` (can verify via existing session or by temporarily forcing the signed-out branch).
- Manual check: `/login` no longer shows the Google button; `/login#create-account` scrolls to the sign-up card.
