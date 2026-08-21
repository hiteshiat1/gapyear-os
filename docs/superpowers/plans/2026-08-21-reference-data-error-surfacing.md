# Reference Data Error Surfacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change 5 shared reference-data getter functions (plus `getSubjectsForAdmin` and `getReferenceDiagnostics`) from silently swallowing Supabase errors to returning `{ data, error }`, and update every caller to show a visible error banner when a query fails, instead of a misleading empty state.

**Architecture:** Each getter in `src/lib/repositories/reference-data.ts` changes its return type from `T[]` to `{ data: T[]; error: string | null }` (or `T | null` for singular results). Callers destructure `.data` for existing rendering logic and `.error` for a new banner using the project's existing red-banner error pattern. `validateOnboardingSubjects` in `src/lib/repositories/onboarding.ts` throws a clear error instead of silently validating against incomplete data.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase JS client, React Server Components.

---

## File structure

- Modify: `src/lib/repositories/reference-data.ts` — 7 functions change return shape: `getReferenceSubjects`, `getExamBoards`, `getReferenceSpecifications`, `getReferenceOptions`, `getBoardOfferings`, `getSubjectsForAdmin`, `getReferenceDiagnostics`. (`getGradeOptions` is explicitly unchanged — out of scope per the approved spec.)
- Modify: `src/lib/repositories/onboarding.ts` — `validateOnboardingSubjects` updated to check for errors from the 3 getters it calls (not `getGradeOptions`) and throw a clear message.
- Modify: `src/app/onboarding/page.tsx` — destructure new result shapes, add error banner.
- Modify: `src/app/settings/academic/page.tsx` — destructure new result shapes, add error banner.
- Modify: `src/app/admin/syllabuses/page.tsx` — destructure new result shapes, add error banner (new on this page).
- Modify: `src/app/admin/subjects/page.tsx` — destructure new result shape from `getSubjectsForAdmin`, add error banner.
- Modify: `src/app/admin/page.tsx` — destructure new result shape from `getReferenceDiagnostics`, drop `.catch(() => null)`.
- Modify: `src/app/admin/diagnostics/page.tsx` — destructure new result shape, add error banner.

No new files. No test suite exists in this project (verification is via `npm run build` + `npx tsc --noEmit`, the project's established gate — confirmed in `package.json`, no `test` script wired to a runner beyond `vitest run` which has no test files currently).

---

### Task 1: Change the 5 shared getters to return `{ data, error }`

**Files:**
- Modify: `src/lib/repositories/reference-data.ts:186-336` (the 5 getter functions: `getReferenceSubjects`, `getExamBoards`, `getBoardOfferings`, `getReferenceSpecifications`, `getReferenceOptions`)

Current code for reference (lines 186-336):

```ts
export async function getReferenceSubjects(): Promise<ReferenceSubjectOption[]> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("a_level_subjects")
    .select("id,slug,name,category,topic_support_status")
    .eq("active", true)
    .eq("student_selectable", true)
    .order("sort_order")
    .order("name");

  if (error) {
    console.error("getReferenceSubjects failed", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    topicSupportStatus: row.topic_support_status as ReferenceSubjectOption["topicSupportStatus"],
  }));
}

export async function getExamBoards() {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("exam_boards")
    .select("id,code,name")
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("getExamBoards failed", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({ id: row.id, code: row.code, name: row.name }));
}

export async function getBoardOfferings(): Promise<ReferenceBoardOption[]> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("board_subject_offerings")
    .select("subject_id,topic_support_status,exam_boards(id,code,name)")
    .eq("available", true);

  if (error) {
    console.error("getBoardOfferings failed", error.message);
    return [];
  }

  return ((data ?? []) as Array<{
    subject_id: string;
    topic_support_status: string;
    exam_boards: { id: string; code: string; name: string } | Array<{ id: string; code: string; name: string }> | null;
  }>).flatMap((row) => {
    const board = Array.isArray(row.exam_boards) ? row.exam_boards[0] : row.exam_boards;
    if (!board) return [];
    return [{
      id: board.id,
      code: board.code,
      name: board.name,
      subjectId: row.subject_id,
      topicSupportStatus: row.topic_support_status as ReferenceBoardOption["topicSupportStatus"],
    }];
  });
}

export async function getReferenceSpecifications(): Promise<ReferenceSpecificationOption[]> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("specifications")
    .select("id,exam_board_id,subject_id,specification_code,specification_name,topic_support_status")
    .eq("active", true)
    .order("specification_code");

  if (error) {
    console.error("getReferenceSpecifications failed", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    examBoardId: row.exam_board_id,
    subjectId: row.subject_id,
    specificationCode: row.specification_code,
    specificationName: row.specification_name,
    topicSupportStatus: row.topic_support_status as ReferenceSpecificationOption["topicSupportStatus"],
  }));
}

export async function getReferenceOptions(): Promise<ReferenceComponentOption[]> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("specification_options")
    .select("id,specification_id,code,name,option_group,min_select,max_select")
    .eq("active", true)
    .order("sort_order");

  if (error) {
    console.error("getReferenceOptions failed", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    specificationId: row.specification_id,
    code: row.code,
    name: row.name,
    optionGroup: row.option_group,
    minSelect: row.min_select,
    maxSelect: row.max_select,
  }));
}
```

- [ ] **Step 1: Replace `getReferenceSubjects`**

```ts
export type ReferenceSubjectsResult = { data: ReferenceSubjectOption[]; error: string | null };

export async function getReferenceSubjects(): Promise<ReferenceSubjectsResult> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return { data: [], error: null };

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

- [ ] **Step 2: Replace `getExamBoards`**

```ts
export type ExamBoardsResult = { data: Array<{ id: string; code: string; name: string }>; error: string | null };

export async function getExamBoards(): Promise<ExamBoardsResult> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from("exam_boards")
    .select("id,code,name")
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("getExamBoards failed", error.message);
    return { data: [], error: error.message };
  }

  return { data: (data ?? []).map((row) => ({ id: row.id, code: row.code, name: row.name })), error: null };
}
```

- [ ] **Step 3: Replace `getBoardOfferings`**

```ts
export type BoardOfferingsResult = { data: ReferenceBoardOption[]; error: string | null };

export async function getBoardOfferings(): Promise<BoardOfferingsResult> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from("board_subject_offerings")
    .select("subject_id,topic_support_status,exam_boards(id,code,name)")
    .eq("available", true);

  if (error) {
    console.error("getBoardOfferings failed", error.message);
    return { data: [], error: error.message };
  }

  const rows = ((data ?? []) as Array<{
    subject_id: string;
    topic_support_status: string;
    exam_boards: { id: string; code: string; name: string } | Array<{ id: string; code: string; name: string }> | null;
  }>).flatMap((row) => {
    const board = Array.isArray(row.exam_boards) ? row.exam_boards[0] : row.exam_boards;
    if (!board) return [];
    return [{
      id: board.id,
      code: board.code,
      name: board.name,
      subjectId: row.subject_id,
      topicSupportStatus: row.topic_support_status as ReferenceBoardOption["topicSupportStatus"],
    }];
  });

  return { data: rows, error: null };
}
```

- [ ] **Step 4: Replace `getReferenceSpecifications`**

```ts
export type ReferenceSpecificationsResult = { data: ReferenceSpecificationOption[]; error: string | null };

export async function getReferenceSpecifications(): Promise<ReferenceSpecificationsResult> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from("specifications")
    .select("id,exam_board_id,subject_id,specification_code,specification_name,topic_support_status")
    .eq("active", true)
    .order("specification_code");

  if (error) {
    console.error("getReferenceSpecifications failed", error.message);
    return { data: [], error: error.message };
  }

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      examBoardId: row.exam_board_id,
      subjectId: row.subject_id,
      specificationCode: row.specification_code,
      specificationName: row.specification_name,
      topicSupportStatus: row.topic_support_status as ReferenceSpecificationOption["topicSupportStatus"],
    })),
    error: null,
  };
}
```

- [ ] **Step 5: Replace `getReferenceOptions`**

```ts
export type ReferenceOptionsResult = { data: ReferenceComponentOption[]; error: string | null };

export async function getReferenceOptions(): Promise<ReferenceOptionsResult> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from("specification_options")
    .select("id,specification_id,code,name,option_group,min_select,max_select")
    .eq("active", true)
    .order("sort_order");

  if (error) {
    console.error("getReferenceOptions failed", error.message);
    return { data: [], error: error.message };
  }

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      specificationId: row.specification_id,
      code: row.code,
      name: row.name,
      optionGroup: row.option_group,
      minSelect: row.min_select,
      maxSelect: row.max_select,
    })),
    error: null,
  };
}
```

- [ ] **Step 6: Leave `getGradeOptions` (lines 312-336) completely untouched.** Do not modify it — it's explicitly out of scope per the approved spec.

- [ ] **Step 7: Verify TypeScript compiles (expect errors — this is expected and fine)**

Run: `npx tsc --noEmit`
Expected: errors in every file that calls these 5 functions and destructures the old array shape directly (e.g. `referenceSubjects.length`, `.map(...)` on the raw result). This is expected — Tasks 2-6 fix each caller. Do NOT fix callers in this task; that's the point of splitting them out. Just confirm the errors are all in caller files, not inside `reference-data.ts` itself (the 5 functions you just edited should have zero internal type errors).

- [ ] **Step 8: Commit**

```bash
git add src/lib/repositories/reference-data.ts
git commit -m "Change 5 reference-data getters to return {data, error} instead of swallowing errors"
```

---

### Task 2: Update `validateOnboardingSubjects` to check for errors

**Files:**
- Modify: `src/lib/repositories/onboarding.ts:43-92`

Current code (lines 43-92):

```ts
export async function validateOnboardingSubjects(subjects: OnboardingSubjectInput[]) {
  const selected = subjects.filter((subject) => subject.referenceSubjectId);
  if (selected.length === 0) {
    throw new Error("Select at least one A-Level subject.");
  }

  const duplicateSubject = selected.find((subject, index) =>
    selected.some((item, itemIndex) => itemIndex !== index && item.referenceSubjectId === subject.referenceSubjectId),
  );
  if (duplicateSubject) {
    throw new Error("Duplicate subject selection is not allowed.");
  }

  const [referenceSubjects, offerings, specifications, grades] = await Promise.all([
    getReferenceSubjects(),
    getBoardOfferings(),
    getReferenceSpecifications(),
    getGradeOptions(),
  ]);
  const subjectIds = new Set(referenceSubjects.map((subject) => subject.id));
  const validGrades = new Set(["", "Not sure", "Not provided yet", ...grades.map((grade) => grade.grade)]);
  const targetGrades = new Set(["", "Not sure", ...grades.filter((grade) => grade.isTargetSelectable).map((grade) => grade.grade)]);

  for (const subject of selected) {
    if (!subject.referenceSubjectId || !subjectIds.has(subject.referenceSubjectId)) {
      throw new Error("Invalid subject selection.");
    }

    if (subject.examBoardId) {
      const validOffering = offerings.some(
        (offering) => offering.subjectId === subject.referenceSubjectId && offering.id === subject.examBoardId,
      );
      if (!validOffering) throw new Error("Invalid exam-board selection for subject.");
    }

    if (subject.specificationId) {
      const validSpecification = specifications.some(
        (spec) =>
          spec.id === subject.specificationId &&
          spec.subjectId === subject.referenceSubjectId &&
          (!subject.examBoardId || spec.examBoardId === subject.examBoardId),
      );
      if (!validSpecification) throw new Error("Invalid specification selection.");
    }

    if (!validGrades.has(subject.achievedGrade ?? "")) throw new Error("Invalid self-grade value.");
    if (!validGrades.has(subject.schoolPredictedGrade ?? "")) throw new Error("Invalid school-predicted grade value.");
    if (!targetGrades.has(subject.targetGrade ?? "")) throw new Error("Invalid target-grade value.");
  }
}
```

- [ ] **Step 1: Replace the function**

```ts
export async function validateOnboardingSubjects(subjects: OnboardingSubjectInput[]) {
  const selected = subjects.filter((subject) => subject.referenceSubjectId);
  if (selected.length === 0) {
    throw new Error("Select at least one A-Level subject.");
  }

  const duplicateSubject = selected.find((subject, index) =>
    selected.some((item, itemIndex) => itemIndex !== index && item.referenceSubjectId === subject.referenceSubjectId),
  );
  if (duplicateSubject) {
    throw new Error("Duplicate subject selection is not allowed.");
  }

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

  const subjectIds = new Set(referenceSubjects.map((subject) => subject.id));
  const validGrades = new Set(["", "Not sure", "Not provided yet", ...grades.map((grade) => grade.grade)]);
  const targetGrades = new Set(["", "Not sure", ...grades.filter((grade) => grade.isTargetSelectable).map((grade) => grade.grade)]);

  for (const subject of selected) {
    if (!subject.referenceSubjectId || !subjectIds.has(subject.referenceSubjectId)) {
      throw new Error("Invalid subject selection.");
    }

    if (subject.examBoardId) {
      const validOffering = offerings.some(
        (offering) => offering.subjectId === subject.referenceSubjectId && offering.id === subject.examBoardId,
      );
      if (!validOffering) throw new Error("Invalid exam-board selection for subject.");
    }

    if (subject.specificationId) {
      const validSpecification = specifications.some(
        (spec) =>
          spec.id === subject.specificationId &&
          spec.subjectId === subject.referenceSubjectId &&
          (!subject.examBoardId || spec.examBoardId === subject.examBoardId),
      );
      if (!validSpecification) throw new Error("Invalid specification selection.");
    }

    if (!validGrades.has(subject.achievedGrade ?? "")) throw new Error("Invalid self-grade value.");
    if (!validGrades.has(subject.schoolPredictedGrade ?? "")) throw new Error("Invalid school-predicted grade value.");
    if (!targetGrades.has(subject.targetGrade ?? "")) throw new Error("Invalid target-grade value.");
  }
}
```

Note: `getGradeOptions()` still returns a plain array (unchanged, per Task 1 Step 6) — `grades` is used directly, no `.data` needed for it.

- [ ] **Step 2: Verify TypeScript compiles for this file**

Run: `npx tsc --noEmit 2>&1 | grep "onboarding.ts"`
Expected: no output (no errors in this file). Errors in other files (page.tsx files not yet updated) are expected and fine at this point.

- [ ] **Step 3: Commit**

```bash
git add src/lib/repositories/onboarding.ts
git commit -m "Throw a clear error in validateOnboardingSubjects when reference-data queries fail"
```

---

### Task 3: Update `src/app/onboarding/page.tsx`

**Files:**
- Modify: `src/app/onboarding/page.tsx:23-58`

Current code (lines 23-58):

```tsx
  const [{ error }, profile, subjects, referenceSubjects, boards, specifications, options, grades] = await Promise.all([
    searchParams,
    getStudentOnboardingProfile().catch(() => null),
    getSubjects(),
    getReferenceSubjects(),
    getBoardOfferings(),
    getReferenceSpecifications(),
    getReferenceOptions(),
    getGradeOptions(),
  ]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Student Setup"
        title="Alevs.io Onboarding"
        description="Set the academic baseline once, then generate a starting plan from subjects, syllabus, goals, and available time."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          {error ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          ) : null}
          {!referenceSubjects.length ? (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <form action={seedReferenceDataAction}>
                <button type="submit" className="rounded-md bg-amber-900 px-4 py-2 text-sm font-medium text-white">
                  Load A Level Subjects (for our default subjects)
                </button>
              </form>
              <p className="mt-2 text-xs text-amber-700">Other subjects coming soon.</p>
            </div>
          ) : null}
```

- [ ] **Step 1: Replace the destructuring and add error banner**

```tsx
  const [
    { error },
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

  return (
    <AppShell>
      <PageHeader
        eyebrow="Student Setup"
        title="Alevs.io Onboarding"
        description="Set the academic baseline once, then generate a starting plan from subjects, syllabus, goals, and available time."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          {error ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          ) : null}
          {referenceDataError ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Couldn&apos;t load subject reference data: {referenceDataError}</p>
            </div>
          ) : null}
          {!referenceSubjects.length ? (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <form action={seedReferenceDataAction}>
                <button type="submit" className="rounded-md bg-amber-900 px-4 py-2 text-sm font-medium text-white">
                  Load A Level Subjects (for our default subjects)
                </button>
              </form>
              <p className="mt-2 text-xs text-amber-700">Other subjects coming soon.</p>
            </div>
          ) : null}
```

Everything below this point in the file (lines 59+) references `referenceSubjects`, `boards`, `specifications`, `options`, `subjects`, `grades`, `profile` exactly as before — no other changes needed since those are now plain arrays again after the `.data` destructuring above.

- [ ] **Step 2: Verify TypeScript compiles for this file**

Run: `npx tsc --noEmit 2>&1 | grep "onboarding/page.tsx"`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/onboarding/page.tsx
git commit -m "Show error banner on onboarding page when reference-data queries fail"
```

---

### Task 4: Update `src/app/settings/academic/page.tsx`

**Files:**
- Modify: `src/app/settings/academic/page.tsx` (full file, 56 lines)

Current code (full file):

```tsx
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";
import { getMyOnboardingSubjects, getStudentOnboardingProfile } from "@/lib/repositories/onboarding";
import {
  getBoardOfferings,
  getGradeOptions,
  getReferenceOptions,
  getReferenceSpecifications,
  getReferenceSubjects,
} from "@/lib/repositories/reference-data";
import { AcademicSetupForm } from "./academic-setup-form";

export default async function AcademicSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, profile, selectedSubjects, referenceSubjects, boards, specifications, options, grades] = await Promise.all([
    searchParams,
    getStudentOnboardingProfile().catch(() => null),
    getMyOnboardingSubjects(),
    getReferenceSubjects(),
    getBoardOfferings(),
    getReferenceSpecifications(),
    getReferenceOptions(),
    getGradeOptions(),
  ]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings"
        title="Academic Setup"
        description="Your subjects, grades, and study availability. Locked by default — enable editing to make changes."
      />
      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      ) : null}
      <Card>
        <AcademicSetupForm
          key={`${profile?.updatedAt ?? "new"}-${selectedSubjects.map((subject) => subject.id).join(",")}`}
          profile={profile}
          selectedSubjects={selectedSubjects}
          referenceSubjects={referenceSubjects}
          boards={boards}
          specifications={specifications}
          options={options}
          grades={grades}
        />
      </Card>
    </AppShell>
  );
}
```

- [ ] **Step 1: Replace the full file**

```tsx
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";
import { getMyOnboardingSubjects, getStudentOnboardingProfile } from "@/lib/repositories/onboarding";
import {
  getBoardOfferings,
  getGradeOptions,
  getReferenceOptions,
  getReferenceSpecifications,
  getReferenceSubjects,
} from "@/lib/repositories/reference-data";
import { AcademicSetupForm } from "./academic-setup-form";

export default async function AcademicSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [
    { error },
    profile,
    selectedSubjects,
    referenceSubjectsResult,
    boardsResult,
    specificationsResult,
    optionsResult,
    grades,
  ] = await Promise.all([
    searchParams,
    getStudentOnboardingProfile().catch(() => null),
    getMyOnboardingSubjects(),
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

  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings"
        title="Academic Setup"
        description="Your subjects, grades, and study availability. Locked by default — enable editing to make changes."
      />
      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      ) : null}
      {referenceDataError ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Couldn&apos;t load subject reference data: {referenceDataError}</p>
        </div>
      ) : null}
      <Card>
        <AcademicSetupForm
          key={`${profile?.updatedAt ?? "new"}-${selectedSubjects.map((subject) => subject.id).join(",")}`}
          profile={profile}
          selectedSubjects={selectedSubjects}
          referenceSubjects={referenceSubjects}
          boards={boards}
          specifications={specifications}
          options={options}
          grades={grades}
        />
      </Card>
    </AppShell>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles for this file**

Run: `npx tsc --noEmit 2>&1 | grep "settings/academic/page.tsx"`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/academic/page.tsx
git commit -m "Show error banner on academic settings page when reference-data queries fail"
```

---

### Task 5: Update `src/app/admin/syllabuses/page.tsx`

**Files:**
- Modify: `src/app/admin/syllabuses/page.tsx` (full file, 44 lines)

Current code (full file):

```tsx
import { Badge, Card, PageHeader } from "@/components/ui";
import { getReferenceSpecifications, getExamBoards } from "@/lib/repositories/reference-data";

export default async function AdminSyllabusesPage() {
  const [specifications, boards] = await Promise.all([getReferenceSpecifications(), getExamBoards()]);
  const boardById = new Map(boards.map((board) => [board.id, board]));

  return (
    <>
      <PageHeader
        eyebrow="Global Admin"
        title="Syllabuses"
        description="All provisioned specifications across enabled and disabled subjects."
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                <th className="py-2 pr-4">Board</th>
                <th className="py-2 pr-4">Specification</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {specifications.map((spec) => (
                <tr key={spec.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4">{boardById.get(spec.examBoardId)?.name ?? "Unknown"}</td>
                  <td className="py-3 pr-4">{spec.specificationCode} · {spec.specificationName}</td>
                  <td className="py-3 pr-4">
                    <Badge tone={spec.topicSupportStatus === "full" ? "green" : "amber"}>
                      {spec.topicSupportStatus === "full" ? "Ready" : "Coming soon"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
```

- [ ] **Step 1: Replace the full file**

```tsx
import { Badge, Card, PageHeader } from "@/components/ui";
import { getReferenceSpecifications, getExamBoards } from "@/lib/repositories/reference-data";

export default async function AdminSyllabusesPage() {
  const [specificationsResult, boardsResult] = await Promise.all([getReferenceSpecifications(), getExamBoards()]);
  const specifications = specificationsResult.data;
  const boards = boardsResult.data;
  const error = specificationsResult.error ?? boardsResult.error;
  const boardById = new Map(boards.map((board) => [board.id, board]));

  return (
    <>
      <PageHeader
        eyebrow="Global Admin"
        title="Syllabuses"
        description="All provisioned specifications across enabled and disabled subjects."
      />
      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Couldn&apos;t load syllabus data: {error}</p>
        </div>
      ) : null}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                <th className="py-2 pr-4">Board</th>
                <th className="py-2 pr-4">Specification</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {specifications.map((spec) => (
                <tr key={spec.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4">{boardById.get(spec.examBoardId)?.name ?? "Unknown"}</td>
                  <td className="py-3 pr-4">{spec.specificationCode} · {spec.specificationName}</td>
                  <td className="py-3 pr-4">
                    <Badge tone={spec.topicSupportStatus === "full" ? "green" : "amber"}>
                      {spec.topicSupportStatus === "full" ? "Ready" : "Coming soon"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles for this file**

Run: `npx tsc --noEmit 2>&1 | grep "admin/syllabuses/page.tsx"`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/syllabuses/page.tsx
git commit -m "Show error banner on admin syllabuses page when reference-data queries fail"
```

---

### Task 6: Update `getSubjectsForAdmin`, `getReferenceDiagnostics`, and their 3 callers

**Files:**
- Modify: `src/lib/repositories/reference-data.ts:338-374` (`getReferenceDiagnostics`) and `:574-614` (`getSubjectsForAdmin`)
- Modify: `src/app/admin/subjects/page.tsx` (full file, 77 lines)
- Modify: `src/app/admin/page.tsx` (full file, 44 lines)
- Modify: `src/app/admin/diagnostics/page.tsx` (full file, 47 lines)

Current code for `getReferenceDiagnostics` (lines 338-374):

```ts
export async function getReferenceDiagnostics() {
  const supabase = await getSupabaseForRead();
  if (!supabase) return null;

  const [
    subjects,
    boards,
    specifications,
    options,
    offerings,
  ] = await Promise.all([
    getReferenceSubjects(),
    getExamBoards(),
    getReferenceSpecifications(),
    getReferenceOptions(),
    getBoardOfferings(),
  ]);

  const duplicateSpecificationCodes = specifications.length - new Set(specifications.map((spec) => `${spec.examBoardId}:${spec.specificationCode}`)).size;
  const fullTopicSpecifications = specifications.filter((spec) => spec.topicSupportStatus === "full").length;
  const comingSoonSpecifications = specifications.filter((spec) => spec.topicSupportStatus === "coming_soon").length;

  const subjectsWithOfferings = new Set(offerings.map((offering) => offering.subjectId));

  return {
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
  };
}
```

Current code for `getSubjectsForAdmin` (lines 574-614):

```ts
export async function getSubjectsForAdmin(): Promise<SubjectAdminRow[]> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data: subjects, error } = await supabase
    .from("a_level_subjects")
    .select("id,slug,name,category,active,student_selectable")
    .order("sort_order")
    .order("name");
  if (error) {
    console.error("getSubjectsForAdmin failed", error.message);
    return [];
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

  return subjects.map((subject) => ({
    id: subject.id,
    slug: subject.slug,
    name: subject.name,
    category: subject.category,
    active: subject.active,
    studentSelectable: subject.student_selectable,
    provisioning: statusBySubject.get(subject.id) ?? [],
  }));
}
```

- [ ] **Step 1: Replace `getReferenceDiagnostics`**

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

  const errors = [
    subjectsResult.error,
    boardsResult.error,
    specificationsResult.error,
    optionsResult.error,
    offeringsResult.error,
  ].filter((message): message is string => message !== null);

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

- [ ] **Step 2: Replace `getSubjectsForAdmin`**

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

- [ ] **Step 3: Update `src/app/admin/subjects/page.tsx`** — replace the full file:

```tsx
import { disableSubjectAction, enableSubjectAction, reprovisionSubjectAction } from "@/actions/admin-subject-actions";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getSubjectsForAdmin } from "@/lib/repositories/reference-data";

export default async function AdminSubjectsPage() {
  const { data: subjects, error } = await getSubjectsForAdmin();

  return (
    <>
      <PageHeader
        eyebrow="Global Admin"
        title="Subjects"
        description="Enable subjects for student selection. Enabling provisions AQA and Pearson Edexcel reference data where officially available."
      />
      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Couldn&apos;t load subjects: {error}</p>
        </div>
      ) : null}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                <th className="py-2 pr-4">Student Visible</th>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">AQA</th>
                <th className="py-2 pr-4">Edexcel</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(subjects ?? []).map((subject) => {
                const aqa = subject.provisioning.find((entry) => entry.boardCode === "AQA");
                const edexcel = subject.provisioning.find((entry) => entry.boardCode === "EDEXCEL");
                return (
                  <tr key={subject.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4">
                      <Badge tone={subject.studentSelectable ? "green" : "slate"}>
                        {subject.studentSelectable ? "Enabled" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 font-medium">{subject.name}</td>
                    <td className="py-3 pr-4 text-slate-500">{subject.category}</td>
                    <td className="py-3 pr-4"><StatusBadge status={aqa?.status} /></td>
                    <td className="py-3 pr-4"><StatusBadge status={edexcel?.status} /></td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        {subject.studentSelectable ? (
                          <form action={disableSubjectAction}>
                            <input type="hidden" name="subjectId" value={subject.id} />
                            <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium">
                              Disable
                            </button>
                          </form>
                        ) : (
                          <form action={enableSubjectAction}>
                            <input type="hidden" name="subjectId" value={subject.id} />
                            <button type="submit" className="rounded-md bg-slate-950 px-3 py-1.5 text-xs font-medium text-white">
                              Enable
                            </button>
                          </form>
                        )}
                        <form action={reprovisionSubjectAction}>
                          <input type="hidden" name="subjectId" value={subject.id} />
                          <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium">
                            Re-provision
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <Badge tone="slate">Not checked</Badge>;
  if (status === "ready") return <Badge tone="green">Ready</Badge>;
  if (status === "coming_soon") return <Badge tone="amber">Coming soon</Badge>;
  if (status === "not_offered") return <Badge tone="slate">Not offered</Badge>;
  return <Badge tone="red">Error</Badge>;
}
```

- [ ] **Step 4: Update `src/app/admin/page.tsx`** — replace the full file:

```tsx
import Link from "next/link";
import { Card, DataRow, PageHeader } from "@/components/ui";
import { getReferenceDiagnostics } from "@/lib/repositories/reference-data";
import { listAllProfiles } from "@/lib/repositories/profiles";

export default async function AdminOverviewPage() {
  const [{ data: diagnostics }, profiles] = await Promise.all([
    getReferenceDiagnostics(),
    listAllProfiles(),
  ]);

  const students = profiles.filter((profile) => profile.role === "student").length;
  const admins = profiles.filter((profile) => profile.role === "admin").length;

  return (
    <>
      <PageHeader
        eyebrow="Global Admin"
        title="Admin Overview"
        description="Manage subject visibility, syllabus provisioning, users, and canonical reference data."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><DataRow label="Total users" value={profiles.length} /></Card>
        <Card><DataRow label="Students" value={students} /></Card>
        <Card><DataRow label="Admins" value={admins} /></Card>
        <Card><DataRow label="Total subjects" value={diagnostics?.totalSubjects ?? 0} /></Card>
        <Card><DataRow label="AQA offerings" value={diagnostics?.aqaOfferings ?? 0} /></Card>
        <Card><DataRow label="Edexcel offerings" value={diagnostics?.edexcelOfferings ?? 0} /></Card>
        <Card><DataRow label="Full-topic specifications" value={diagnostics?.fullTopicSpecifications ?? 0} /></Card>
        <Card><DataRow label="Coming-soon specifications" value={diagnostics?.comingSoonSpecifications ?? 0} /></Card>
      </div>
      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Quick links</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/subjects" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Manage Subjects</Link>
          <Link href="/admin/syllabuses" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">Syllabus Status</Link>
          <Link href="/admin/users" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">Manage Users</Link>
          <Link href="/admin/diagnostics" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">Run Diagnostics</Link>
        </div>
      </Card>
    </>
  );
}
```

(Only change from the original: `getReferenceDiagnostics().catch(() => null)` → `getReferenceDiagnostics()` destructured as `{ data: diagnostics }`. No error banner added here per the approved spec — this page stays a compact stat view; the full error shows on `/admin/diagnostics`.)

- [ ] **Step 5: Update `src/app/admin/diagnostics/page.tsx`** — replace the full file:

```tsx
import { seedReferenceDataAction } from "@/actions/reference-actions";
import { Card, DataRow, PageHeader } from "@/components/ui";
import { getReferenceDiagnostics } from "@/lib/repositories/reference-data";

export default async function AdminDiagnosticsPage() {
  const { data: diagnostics, error } = await getReferenceDiagnostics();

  return (
    <>
      <PageHeader
        eyebrow="Global Admin"
        title="Diagnostics"
        description="Load or repair the base reference catalogue (exam boards, subjects, grade scales)."
      />
      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold">Reference Import</h2>
          <p className="mt-2 text-sm text-slate-500">Idempotent. Safe to re-run.</p>
          <form action={seedReferenceDataAction} className="mt-4">
            <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              Load / repair reference data
            </button>
          </form>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Diagnostics</h2>
          {diagnostics ? (
            <div className="mt-4">
              <DataRow label="Total subjects" value={diagnostics.totalSubjects} />
              <DataRow label="Exam boards" value={diagnostics.boards} />
              <DataRow label="AQA offerings" value={diagnostics.aqaOfferings} />
              <DataRow label="Edexcel offerings" value={diagnostics.edexcelOfferings} />
              <DataRow label="Specifications" value={diagnostics.specifications} />
              <DataRow label="Specification options" value={diagnostics.options} />
              <DataRow label="Full-topic specifications" value={diagnostics.fullTopicSpecifications} />
              <DataRow label="Coming-soon specifications" value={diagnostics.comingSoonSpecifications} />
              <DataRow label="Subjects with no verified offering" value={diagnostics.subjectsWithNoVerifiedBoardOffering} />
              <DataRow label="Duplicate board/spec codes" value={diagnostics.duplicateSpecificationCodes} />
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Reference tables are not available yet. Run the migration and load reference data.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
```

(Note: the `!error` "Reference tables are not available yet" fallback now only shows when `diagnostics` is null AND there's no error — e.g. the genuine "Supabase not configured" case. When there IS an error, the new banner shows the actual reason instead of the generic fallback message. Both can theoretically render together if `diagnostics` is null for a non-error reason — that's fine and matches the note in the spec about keeping this as a defensive fallback.)

- [ ] **Step 6: Verify full project compiles clean now**

Run: `npx tsc --noEmit`
Expected: zero errors, in any file. This is the first point in the plan where the whole project should compile — Tasks 1-5 intentionally leave the project in a partially-broken state (expected, tracked in each task's own verification step) until this task's changes land.

- [ ] **Step 7: Run the build**

Run: `npm run build`
Expected: build succeeds, all routes compile.

- [ ] **Step 8: Commit**

```bash
git add src/lib/repositories/reference-data.ts src/app/admin/subjects/page.tsx src/app/admin/page.tsx src/app/admin/diagnostics/page.tsx
git commit -m "Surface reference-data errors on admin subjects, overview, and diagnostics pages"
```

---

### Task 7: Final verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: all routes compile successfully, no errors.

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Manual verification that the original bug is actually fixed**

Since the live database now has the missing migration applied (done manually via SQL Editor prior to this plan), the specific `column ... does not exist` error can't be reproduced live anymore. Instead, verify behavior by code inspection and a positive-path check:

1. Run `npm run dev`, sign in as the admin account, visit `/admin/subjects`. Confirm the 38 subjects render (this confirms `getSubjectsForAdmin`'s new `{ data, error }` shape works end-to-end with real data, not just types).
2. Visit `/admin/diagnostics`. Confirm the diagnostic counts render with no error banner (confirms `getReferenceDiagnostics`'s new shape works with real data).
3. Visit `/admin/syllabuses`. Confirm specifications render with no error banner.
4. Visit `/settings/academic` and `/onboarding` as a student account (or the admin account, since admin also has a profile). Confirm no error banner appears and subject data renders normally.

- [ ] **Step 4: Commit any final fixups**

```bash
git add -A
git commit -m "Fix up reference-data error surfacing verification issues"
```
(only if there were fixups; skip if nothing changed)
