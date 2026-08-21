# Surface reference-data query errors instead of silently swallowing them

## Problem

A migration adding `a_level_subjects.student_selectable` (and the `subject_provisioning_status`/`audit_log` tables) was never applied to the live database. This caused `/admin/subjects` to render an empty table and `/admin/diagnostics` to show "Total subjects: 0" — even though `a_level_subjects` actually had 38 rows. The real error (`column a_level_subjects.student_selectable does not exist`) only ever reached `console.error` in Vercel's server logs, never the UI, so it looked like a data problem ("subjects aren't seeded") when it was actually a schema/migration problem.

This is a systemic pattern across `src/lib/repositories/reference-data.ts`: every getter function catches its own Supabase errors, logs them server-side, and returns an empty array/null as if nothing were wrong. Any future schema drift or RLS misconfiguration will reproduce the exact same silent-failure symptom.

## Goals

- When a reference-data query fails, the failure must be visible somewhere a human will actually see it (an admin page, a student-facing form) — not only in server logs.
- Preserve existing behavior for the "genuinely zero rows" case (e.g., a subject catalog that hasn't been seeded yet) — that's a legitimate state with its own existing UI ("Load A Level Subjects" prompt), not an error.
- Don't let a validation function silently proceed with incomplete reference data and produce a misleading, unrelated error message (e.g., a DB outage during onboarding submission currently surfaces as "Invalid subject selection," which is wrong and confusing).

## Non-goals

- Not adding retry logic, circuit breakers, or any resilience behavior beyond making failures visible.
- Not changing the underlying RLS policies, schema, or migration tracking process (handled separately).
- Not touching functions that already throw on error (e.g., `getStudentOnboardingProfile`, most of `saveCanonicalOnboardingSubjects`) — only functions that currently catch-and-swallow.

## Design

### 1. Change the return contract of 5 shared getters in `src/lib/repositories/reference-data.ts`

`getReferenceSubjects`, `getExamBoards`, `getReferenceSpecifications`, `getReferenceOptions`, `getBoardOfferings` currently return `T[]` (empty array on error, logged via `console.error`). Change each to return `{ data: T[]; error: string | null }`, e.g.:

```ts
export type ReferenceSubjectsResult = { data: ReferenceSubjectOption[]; error: string | null };

export async function getReferenceSubjects(): Promise<ReferenceSubjectsResult> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return { data: [], error: null }; // "not configured" already has its own UI elsewhere, not a query error

  const { data, error } = await supabase
    .from("a_level_subjects")
    .select("id,slug,name,category,topic_support_status")
    .eq("active", true)
    .eq("student_selectable", true)
    .order("sort_order")
    .order("name");

  if (error) {
    console.error("getReferenceSubjects failed", error.message);
    return { data: [], error: error.message };
  }

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      topicSupportStatus: row.topic_support_status as ReferenceSubjectOption["topicSupportStatus"],
    })),
    error: null,
  };
}
```

Apply the same shape change to the other 4 getters, each keeping its own `console.error` call (for server-log visibility, unchanged) and adding `error: error.message` to the return.

Note: `getSupabaseForRead()` returning `null` (Supabase not configured) is a distinct, pre-existing condition with its own UI (`isSupabaseConfigured` banner on the login page) — it stays `{ data: [], error: null }`, not treated as a query error.

### 2. Update every caller to destructure `{ data, error }`

**`src/app/onboarding/page.tsx`** (lines 23-32): destructure each result, use `.data` for rendering, collect any errors into a combined banner. Add a new error banner above the existing `params.error` banner (reuse the identical `rounded-lg border border-red-200 bg-red-50 p-4` / `text-sm font-medium text-red-800` pattern already used there) when any reference-data query failed:

```tsx
const [
  { error: searchError },
  profile,
  subjects,
  referenceSubjectsResult,
  boardsResult,
  specificationsResult,
  optionsResult,
  grades,
] = await Promise.all([
  searchParams,
  getStudentOnboardingProfile().catch(() => null),
  getSubjects(),
  getReferenceSubjects(),
  getBoardOfferings(),
  getReferenceSpecifications(),
  getReferenceOptions(),
  getGradeOptions(),
]);

const referenceSubjects = referenceSubjectsResult.data;
const boards = boardsResult.data;
const specifications = specificationsResult.data;
const options = optionsResult.data;
const referenceDataError = referenceSubjectsResult.error ?? boardsResult.error ?? specificationsResult.error ?? optionsResult.error;
```

Render `referenceDataError` in a banner right after the existing `params.error` block, same visual style, message: `Couldn't load subject reference data: {referenceDataError}`.

**`src/app/settings/academic/page.tsx`** (lines 18-27): identical pattern — destructure `.data`/`.error` from the 4 reference-data results, add the same-style error banner after the existing `error` banner.

**`src/app/admin/syllabuses/page.tsx`** (lines 4-5): destructure `.data`/`.error` from `getReferenceSpecifications()` and `getExamBoards()`. This page currently has no error banner at all — add one using the same red-banner pattern (it doesn't have a `searchParams.error` today, so this is the first one on this page, placed right after `PageHeader`).

**`getGradeOptions`** is intentionally left unchanged (out of scope — it's not part of the reported failure pattern's root cause table, and widening further isn't needed for this fix). It keeps returning `T[]`.

### 3. `validateOnboardingSubjects` in `src/lib/repositories/onboarding.ts` (lines 43-92)

Currently calls `getReferenceSubjects()`, `getBoardOfferings()`, `getReferenceSpecifications()`, `getGradeOptions()` and assumes the results are complete. Update to check each result (except `getGradeOptions`, unchanged) for an error and throw immediately if any failed, before doing subject/grade validation:

```ts
const [referenceSubjectsResult, offeringsResult, specificationsResult, grades] = await Promise.all([
  getReferenceSubjects(),
  getBoardOfferings(),
  getReferenceSpecifications(),
  getGradeOptions(),
]);

if (referenceSubjectsResult.error || offeringsResult.error || specificationsResult.error) {
  throw new Error("Could not validate subjects — reference data is temporarily unavailable. Please try again shortly.");
}

const referenceSubjects = referenceSubjectsResult.data;
const offerings = offeringsResult.data;
const specifications = specificationsResult.data;
```

This throw surfaces through the existing `saveOnboardingAction` error-redirect path (`/onboarding?error=...` or `/settings/academic?error=...`, both of which already render `params.error` in a banner) — no new UI needed here, just a correct, non-misleading error message reaching that existing banner.

### 4. `getReferenceDiagnostics` and `getSubjectsForAdmin` in `src/lib/repositories/reference-data.ts`

**`getSubjectsForAdmin`** (lines 574-614): standalone query, no other callers. Change to:

```ts
export type SubjectAdminResult = { data: SubjectAdminRow[] | null; error: string | null };

export async function getSubjectsForAdmin(): Promise<SubjectAdminResult> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return { data: null, error: "Supabase is not configured." };

  const { data: subjects, error } = await supabase
    .from("a_level_subjects")
    .select("id,slug,name,category,active,student_selectable")
    .order("sort_order")
    .order("name");
  if (error) {
    console.error("getSubjectsForAdmin failed", error.message);
    return { data: null, error: error.message };
  }

  const { data: statusRows } = await supabase
    .from("subject_provisioning_status")
    .select("subject_id,board_code,status,message,specification_id");

  const statusBySubject = new Map<string, ProvisioningPlanEntry[]>();
  for (const row of statusRows ?? []) {
    const list = statusBySubject.get(row.subject_id) ?? [];
    list.push({
      boardCode: row.board_code as "AQA" | "EDEXCEL",
      status: row.status as ProvisioningPlanEntry["status"],
      specificationCode: null,
      specificationName: null,
      message: row.message,
    });
    statusBySubject.set(row.subject_id, list);
  }

  return {
    data: subjects.map((subject) => ({
      id: subject.id,
      slug: subject.slug,
      name: subject.name,
      category: subject.category,
      active: subject.active,
      studentSelectable: subject.student_selectable,
      provisioning: statusBySubject.get(subject.id) ?? [],
    })),
    error: null,
  };
}
```

`src/app/admin/subjects/page.tsx` (lines 5-6): destructure `{ data, error }`, render the existing red-banner pattern (new on this page, same style as elsewhere) if `error` is set, and render the table only when `data` is non-null (fall back to `data ?? []` for the `.map`).

**`getReferenceDiagnostics`** (lines 338-374): now that the 5 composed getters return `{ data, error }`, collect their errors instead of needing a try/catch (the earlier attempt tried wrapping `Promise.all` in try/catch, which doesn't work because the getters never throw — this is why the return-shape change in step 1 is required first):

```ts
export type ReferenceDiagnostics = {
  totalSubjects: number;
  aqaOfferings: number;
  edexcelOfferings: number;
  boards: number;
  specifications: number;
  options: number;
  fullTopicSpecifications: number;
  comingSoonSpecifications: number;
  subjectsWithNoVerifiedBoardOffering: number;
  duplicateSpecificationCodes: number;
};

export type ReferenceDiagnosticsResult = { data: ReferenceDiagnostics | null; error: string | null };

export async function getReferenceDiagnostics(): Promise<ReferenceDiagnosticsResult> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return { data: null, error: "Supabase is not configured." };

  const [subjectsResult, boardsResult, specificationsResult, optionsResult, offeringsResult] = await Promise.all([
    getReferenceSubjects(),
    getExamBoards(),
    getReferenceSpecifications(),
    getReferenceOptions(),
    getBoardOfferings(),
  ]);

  const errors = [subjectsResult.error, boardsResult.error, specificationsResult.error, optionsResult.error, offeringsResult.error].filter(
    (message): message is string => message !== null,
  );
  if (errors.length > 0) {
    return { data: null, error: `${errors.length} diagnostic check(s) failed: ${errors.join("; ")}` };
  }

  const subjects = subjectsResult.data;
  const boards = boardsResult.data;
  const specifications = specificationsResult.data;
  const options = optionsResult.data;
  const offerings = offeringsResult.data;

  const duplicateSpecificationCodes = specifications.length - new Set(specifications.map((spec) => `${spec.examBoardId}:${spec.specificationCode}`)).size;
  const fullTopicSpecifications = specifications.filter((spec) => spec.topicSupportStatus === "full").length;
  const comingSoonSpecifications = specifications.filter((spec) => spec.topicSupportStatus === "coming_soon").length;
  const subjectsWithOfferings = new Set(offerings.map((offering) => offering.subjectId));

  return {
    data: {
      totalSubjects: subjects.length,
      aqaOfferings: offerings.filter((offering) => offering.code === "AQA").length,
      edexcelOfferings: offerings.filter((offering) => offering.code === "EDEXCEL").length,
      boards: boards.length,
      specifications: specifications.length,
      options: options.length,
      fullTopicSpecifications,
      comingSoonSpecifications,
      subjectsWithNoVerifiedBoardOffering: subjects.filter((subject) => !subjectsWithOfferings.has(subject.id)).length,
      duplicateSpecificationCodes,
    },
    error: null,
  };
}
```

`src/app/admin/page.tsx` (lines 7-8) and `src/app/admin/diagnostics/page.tsx` (lines 5-6): both currently call `getReferenceDiagnostics().catch(() => null)` and use optional chaining (`diagnostics?.totalSubjects ?? 0`). Since `getReferenceDiagnostics` no longer throws, drop the `.catch(() => null)` and destructure `{ data: diagnostics, error }` instead. `admin/page.tsx` keeps using `diagnostics?.totalSubjects ?? 0` unchanged (it's a compact stat-card view, not the place for a full error banner — the full diagnostics page is one click away via the existing "Run Diagnostics" link, which will show the real error). `admin/diagnostics/page.tsx` adds the red-banner pattern when `error` is set, and keeps its existing "Reference tables are not available yet" fallback card for the `data === null` case without an error (shouldn't happen post-fix, but keep as a defensive fallback matching current behavior).

## Testing

- `npm run build` and `npx tsc --noEmit` after each file change — the return-type change is a breaking signature change, so TypeScript will catch any caller not yet updated.
- Manual: temporarily rename a column in a local/staging Supabase instance (or use the existing broken-migration state before applying the fix SQL) to confirm the error banner actually renders on `/onboarding`, `/settings/academic`, `/admin/subjects`, `/admin/syllabuses`, `/admin/diagnostics`.
- Manual: confirm the "subjects not yet seeded" empty state (genuinely zero rows, no error) still shows the existing "Load A Level Subjects" prompt on `/onboarding`, unchanged.
