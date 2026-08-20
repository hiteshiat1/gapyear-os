# Admin Control Plane, Subject Provisioning, Strict Onboarding, Dashboard (GitHub Issue #4)

## Context

ALevels.io currently has:
- `profiles.role` (`student | parent | tutor | mentor | admin`) — existing role mechanism, already used to gate a single flat `/admin` page.
- `a_level_subjects` / `exam_boards` / `board_subject_offerings` / `specifications` / `specification_options` / `papers` / `grade_scales` — canonical reference tables, admin-write-only via RLS (`is_admin()` policies added in a prior session).
- `student_subjects` — student-owned selections (subject, board, spec, grades), written during onboarding. `/subjects` already reads from this table (rebuilt in a prior session), not the legacy `subjects` table.
- A **separate legacy system**: per-user `subjects` table + `syllabus_topics` + `topic_progress`, powering `/today`, `/analytics`, and the planner. Bridged to `student_subjects` only by matching subject name string (`seedAllSyllabuses` in `src/lib/repositories/syllabus.ts`). This split is not being closed in this issue (confirmed with user) — it's flagged as known follow-up.
- `src/data/syllabuses/` — 16 hand-authored syllabus definitions (8 subjects × 2 boards) with real topic trees, matched by `subjectName`.
- `src/data/reference/catalogue.ts` — the static seed data (`referenceSubjects`, `referenceExamBoards`, `referenceSpecifications`) that `seedReferenceData()` upserts into the DB.
- Middleware (`src/lib/supabase/middleware.ts`) already redirects any signed-in user whose `student_profiles.onboarding_completed` is false to `/onboarding`, exempting `/onboarding`, `/settings*`, `/admin`, `/logout`, `/api*`.
- Onboarding (`src/app/onboarding/page.tsx` + `reference-subject-selector.tsx`) already shows only subjects with at least one board offering (`board_subject_offerings`), greys out the rest.

## Decisions from clarification

1. **Syllabus provisioning does not do live web lookups.** For a subject Admin enables, provisioning verifies/writes reference rows (`board_subject_offerings`, `specifications`, `specification_options`, `papers`) from the existing static catalogue (`referenceSpecifications` in `catalogue.ts`) and links syllabus topics from `src/data/syllabuses/` where a matching definition exists. If no specification or syllabus file exists for a board, that board is reported as `not_offered` / `coming_soon` — no new content is authored on click. Building new syllabus content for more subjects stays a separate, deliberate task.
2. **Lock/edit/save flow lives on a new `/settings/academic` page**, separate from the onboarding wizard.
3. **Reuse `student_profiles.onboarding_completed`** as the strict first-login gate; no new `onboarding_completed_at` column.
4. **Keep the legacy `subjects`/`syllabus_topics` bridge as-is.** Dashboard reads student-selected subjects from `student_subjects` (canonical) and, where available, joins progress via the existing name-matched legacy bridge — same pattern `/subjects` already uses.
5. **`a_level_subjects.student_selectable`** is an independent boolean, defaults `false`, decoupled from whether a board offering currently exists. Admin can enable a subject with zero offerings; provisioning then attempts to create/verify them from the static catalogue and reports what's missing. Onboarding only ever shows a subject if it is both `student_selectable = true` AND has at least one resolved board offering after provisioning.

## Schema changes

New migration `supabase/migrations/20260820_admin_subject_provisioning.sql`:

```sql
alter table public.a_level_subjects
  add column if not exists student_selectable boolean not null default false;

create table if not exists public.subject_provisioning_status (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.a_level_subjects(id) on delete cascade,
  board_code text not null check (board_code in ('AQA', 'EDEXCEL')),
  status text not null check (status in ('ready', 'coming_soon', 'not_offered', 'error')),
  specification_id uuid references public.specifications(id) on delete set null,
  message text,
  provisioned_at timestamptz not null default now(),
  unique(subject_id, board_code)
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);
```

RLS: `subject_provisioning_status` — admin-only read/write (mirrors existing `is_admin()` pattern). `audit_log` — admin-only read (`is_admin(auth.uid())`); insert policy requires `auth.uid() = actor_id`, so any authenticated user (admin or student) can only ever insert a row attributing the action to themselves — students can write their own `student unlocked academic setup` / `student changed grades` entries this way, but can never read the log or write as another user.

Both tables are additive; no existing table is altered destructively beyond the one new nullable-defaulted column.

## 1–2. Admin route tree + subject enable/disable

Replace the single `/admin` page with a route group:

- `/admin` — overview (issue §8 cards + quick links)
- `/admin/subjects` — table with `student_selectable` checkbox per subject, columns from issue §2/§9, search/filter by category/enabled/syllabus status, row actions (Enable, Disable, Re-provision, View syllabus)
- `/admin/syllabuses` — read-only drill-down of provisioned specifications (issue §10)
- `/admin/users` — role table, already-existing `updateUserRoleAction` reused (issue §11)
- `/admin/diagnostics` — existing `getReferenceDiagnostics()` output, moved here from the old flat page

A shared `requireAdmin()` server helper (`src/lib/repositories/profiles.ts`) centralizes the guard: unauthenticated → the existing middleware already redirects to `/login` before any admin page renders; authenticated non-admin → `redirect("/")`. Each `/admin/*` page calls this at the top, same pattern as the current `/admin` page already uses — just factored out so it's not copy-pasted five times.

Admin nav: a new collapsible "Admin" section in `app-shell.tsx`'s nav (same `AppNav` collapsible pattern already used for A Levels/Progress/etc.), shown only when `profile.role === "admin"`, replacing the single `/admin` link.

## 3. Syllabus provisioning service

New `provisionSubject(subjectId: string)` in `src/lib/repositories/reference-data.ts` (extends the existing `seedReferenceData` machinery rather than duplicating it):

For each board (`AQA`, `EDEXCEL`):
1. Look up `referenceSpecifications` in `catalogue.ts` for `(boardCode, subjectSlug)`.
2. If none found → write `subject_provisioning_status` row `status: 'not_offered'`.
3. If found → upsert `board_subject_offerings`, `specifications`, `specification_options`, `papers` (idempotent, same `onConflict` keys as `seedReferenceData` already uses).
4. Check `src/data/syllabuses/index.ts` for a `SyllabusDefinition` whose `subjectName`/`examBoard` matches. If found → status `ready` (syllabus topics get linked when the student actually selects it, via the existing per-user `seedAllSyllabuses` bridge — provisioning itself doesn't write `syllabus_topics`, since that table is per-user, not global). If the spec exists but no syllabus file → status `coming_soon`.
5. Any unexpected DB error on this board → status `error`, message stored, **and provisioning continues for the other board** (partial failure doesn't abort the whole subject, per issue §2).

After both boards processed, set `a_level_subjects.student_selectable = true` only if at least one board resolved to `ready` or `coming_soon` (not `not_offered`/`error` on both). If both boards fail, the subject is not exposed and the admin UI shows "Needs Attention."

Write an `audit_log` row (`admin_enabled_subject` / `admin_provisioned_syllabus`) after provisioning completes.

Idempotency: re-running `provisionSubject` on an already-provisioned subject is safe — all upserts use stable `onConflict` keys already established in the current `seedReferenceData` code; `subject_provisioning_status` upserts on `(subject_id, board_code)`.

Disable action: sets `student_selectable = false` only. No data deleted. Existing `student_subjects` rows referencing this subject are untouched and continue to render normally everywhere (dashboard, plan, analytics) since those pages query `student_subjects`, not the enabled-subjects list.

## 4. Strict onboarding gate

No new gate logic needed — the existing middleware check already satisfies issue §4 (server-side, redirects on direct URL navigation, exempts `/onboarding` itself). The only change: `getReferenceSubjects()` (used by the onboarding subject selector) adds `.eq("student_selectable", true)` to its query, so onboarding only ever offers admin-enabled subjects. `/admin/subjects` disable action does not retroactively affect students who already selected a since-disabled subject (their `student_subjects` row stays; only *new* selections are blocked).

## 5. Dashboard subject scoping

No architectural change needed — `/subjects` already reads `student_subjects` exclusively (prior session). This issue's dashboard rebuild (§6 below) uses the same `getMyOnboardingSubjects()` repository function already built.

## 6. Dashboard (replaces Home)

- New route `/dashboard` — `src/app/dashboard/page.tsx`. `/` becomes a redirect to `/dashboard` (`src/app/page.tsx` replaced with a `redirect("/dashboard")`, current dashboard content moves to the new route).
- Nav: rename "Home" → "Dashboard", `href: "/dashboard"`.
- Content, reusing existing data sources:
  - Header: student name (`getCurrentProfile`), school + stage (`getStudentOnboardingProfile`).
  - Subjects table: `getMyOnboardingSubjects()` (already returns Subject/Board/Self/School/Target grade/Progress — same shape `/subjects` uses), plus a "Next Assessment" and "Current Priority" column added by joining `getExams()` and the existing topic-priority calculation, filtered to the legacy-bridged subject.
  - Plan: reuse `getDailyPlan()` (already powers `/today`) — today's tasks summary + CTA link to `/today`.
  - Simple analytics: study hours this week, tasks completed, topics needing attention — computed from data already fetched for `/analytics`, trimmed to a few numbers (no new calculation logic, just a smaller read of existing `calculations.ts` outputs).
- Progress labels use the qualitative scale from issue §6 (`Not assessed / Early evidence / Developing / On track / Needs attention`) instead of a raw percentage where evidence is thin (topic count below a threshold) — a small new mapping function in `calculations.ts`.

## 7. Post-onboarding lock/edit/save

New `/settings/academic` page:
- Server-rendered, defaults to **locked**: all fields read-only, values from `getStudentOnboardingProfile()` + `getMyOnboardingSubjects()`.
- Client component wraps the form with local `isEditing` state (`useState`, default `false`). "Enable Editing" button flips it; fields become editable inputs bound to the same shape onboarding already collects (profile fields, per-subject board/spec/options/grades, study availability).
- "Save Changes" submits a new server action `updateAcademicSetupAction` — validates (reuses `validateOnboardingSubjects`-equivalent logic factored out of `onboarding-actions.ts`), writes via existing `upsertStudentOnboardingProfile` / `saveCanonicalOnboardingSubjects` / `saveStudyAvailability`, writes `audit_log` rows per changed field (old/new value diff), then calls `revalidatePath("/settings/academic")` and `redirect("/settings/academic")`. The redirect forces a full new navigation to the client component, which remounts with `isEditing` defaulting to `false` again — this is what actually re-locks the form, not a client-side state flip after save.
- "Cancel Changes" (a `type="button"`, not a submit) just calls `setIsEditing(false)` — since fields are uncontrolled `defaultValue`-based (same pattern the onboarding form already uses) and sourced from the server-fetched profile/subjects data (not client state), switching back to the read-only view re-renders those same server values with no separate restore step needed.
- Subject removal: sets `student_subjects.active = false` (already a column) after a confirm dialog; does not touch `syllabus_topics`/`topic_progress`/assessments.
- Subject/spec change: writes a new `grade_history` row (already supported) and updates `student_subjects.specification_id`; does not delete prior `topic_progress` rows tied to the old specification — they remain queryable as historical (no new "unmapped" flag column needed for this pass, since the legacy bridge already keys progress by subject *name*, which doesn't change when only the specification changes).

## Testing

Extend `vitest` suite (currently 5 files / 26 tests, fast unit-level, no live Supabase) with:
- `provisionSubject` idempotency and partial-failure behavior — tested against mocked Supabase client (matching existing test patterns in the repo, if any exist) or as a pure-function extraction (`resolveProvisioningPlan(subjectSlug, catalogue)`) that's independently testable without hitting the DB, with a thin repository wrapper around it.
- `requireAdmin()` redirect behavior — unit test on the helper function directly (redirect target given role).
- Onboarding subject list filtering — pure function test on "only student_selectable + resolved board" filtering logic.
- Lock/edit form state transitions — if using plain `useState`, a component-level test is possible only if the repo already has React Testing Library set up; if not, skip component tests and rely on the manual QA the issue's Definition of Done implies, noting this as a limitation in the final report.

Run `npm run lint`, `npm run build`, `npx vitest run` before declaring any phase done, per issue instructions.

## Explicitly out of scope (flagged, not silently dropped)

- Merging the legacy `subjects`/`syllabus_topics` system into `student_subjects` — kept as-is per user decision.
- Live web-search-based syllabus content authoring during provisioning — provisioning only wires up what's already in `catalogue.ts`/`src/data/syllabuses/`.
- New `profiles.onboarding_completed_at` column — existing boolean gate reused.
