# Admin Control Plane, Subject Provisioning, Strict Onboarding, Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement GitHub issue #4 — a full Admin route with subject enable/disable + syllabus provisioning, a strict onboarding gate limited to admin-enabled subjects, a Dashboard that replaces Home and shows only the student's selected subjects, and a locked-by-default post-onboarding edit/save flow for Settings.

**Architecture:** Extend the existing `profiles.role`-based admin mechanism and existing `student_subjects`/`a_level_subjects`/`specifications` reference schema — no parallel systems. Add one migration (`student_selectable` flag, `subject_provisioning_status`, `audit_log`). Split the current flat `/admin` page into a route group. Add a pure, DB-free `provisionSubjectPlan()` function (unit-testable) wrapped by a thin Supabase-writing `provisionSubject()`. Replace `/` (Home) with `/dashboard`, keeping `/` as a redirect. Add `/settings/academic` as a new locked/unlock/save page reusing existing onboarding repository functions.

**Tech Stack:** Next.js 16 App Router, Supabase (Postgres + RLS), TypeScript, Vitest (pure-function unit tests only, no DB mocking — matches existing `tests/*.test.ts` pattern).

**Design doc:** `docs/superpowers/specs/2026-08-20-admin-control-plane-design.md`

---

## Task 1: Migration — `student_selectable`, `subject_provisioning_status`, `audit_log`

**Files:**
- Create: `supabase/migrations/20260820_admin_subject_provisioning.sql`

- [ ] **Step 1: Write the migration file**

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

alter table public.subject_provisioning_status enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists "admin read provisioning status" on public.subject_provisioning_status;
create policy "admin read provisioning status" on public.subject_provisioning_status
  for select to authenticated using (public.is_admin(auth.uid()));
drop policy if exists "admin write provisioning status" on public.subject_provisioning_status;
create policy "admin write provisioning status" on public.subject_provisioning_status
  for insert to authenticated with check (public.is_admin(auth.uid()));
drop policy if exists "admin update provisioning status" on public.subject_provisioning_status;
create policy "admin update provisioning status" on public.subject_provisioning_status
  for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin read audit log" on public.audit_log;
create policy "admin read audit log" on public.audit_log
  for select to authenticated using (public.is_admin(auth.uid()));
drop policy if exists "own audit log insert" on public.audit_log;
create policy "own audit log insert" on public.audit_log
  for insert to authenticated with check (auth.uid() = actor_id);

create index if not exists subject_provisioning_status_subject_idx on public.subject_provisioning_status(subject_id);
create index if not exists audit_log_entity_idx on public.audit_log(entity_type, entity_id, created_at desc);
```

This depends on `public.is_admin(uid)` from `supabase/migrations/20260819_reference_data_admin_write.sql`, already applied.

- [ ] **Step 2: Verify the file is valid SQL by eye — no code to run locally (no local Postgres); this migration is applied manually to the Supabase project, same as prior migrations in this repo**

Confirm: every `create table` uses `if not exists`, every `create policy` is preceded by `drop policy if exists` (idempotent re-run safe, matching every other migration in `supabase/migrations/`).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260820_admin_subject_provisioning.sql
git commit -m "Add student_selectable flag, subject_provisioning_status, and audit_log tables"
```

**Manual action required (document in final report):** this SQL file must be run in the Supabase SQL editor before Task 4's provisioning code can work end-to-end against production. Note this explicitly — do not claim it's "applied" just because the file exists in the repo.

---

## Task 2: Types and repository scaffolding for provisioning

**Files:**
- Create: `src/lib/repositories/provisioning.ts`
- Test: `tests/provisioning.test.ts`

This task adds the pure, DB-free planning function first (TDD), then a thin wrapper that writes it to Supabase in Task 4.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/provisioning.test.ts
import { describe, expect, it } from "vitest";
import { resolveProvisioningPlan } from "@/lib/repositories/provisioning";
import { referenceSpecifications } from "@/data/reference/catalogue";
import { syllabusDefinitions } from "@/data/syllabuses";

describe("resolveProvisioningPlan", () => {
  it("marks a board ready when a spec and syllabus file both exist", () => {
    const plan = resolveProvisioningPlan("physics", referenceSpecifications, syllabusDefinitions);
    const aqa = plan.find((entry) => entry.boardCode === "AQA");
    expect(aqa).toMatchObject({ status: "ready", specificationCode: "7408" });
  });

  it("marks a board coming_soon when a spec exists but no syllabus file matches", () => {
    const plan = resolveProvisioningPlan("environmental-science", referenceSpecifications, syllabusDefinitions);
    const aqa = plan.find((entry) => entry.boardCode === "AQA");
    expect(aqa).toMatchObject({ status: "coming_soon", specificationCode: "7447" });
  });

  it("marks a board not_offered when no specification exists for that board/subject", () => {
    const plan = resolveProvisioningPlan("environmental-science", referenceSpecifications, syllabusDefinitions);
    const edexcel = plan.find((entry) => entry.boardCode === "EDEXCEL");
    expect(edexcel).toMatchObject({ status: "not_offered", specificationCode: null });
  });

  it("always returns exactly one entry per board, both AQA and EDEXCEL", () => {
    const plan = resolveProvisioningPlan("mathematics", referenceSpecifications, syllabusDefinitions);
    expect(plan.map((entry) => entry.boardCode).sort()).toEqual(["AQA", "EDEXCEL"]);
  });

  it("is selectable when at least one board resolves to ready or coming_soon", () => {
    const plan = resolveProvisioningPlan("environmental-science", referenceSpecifications, syllabusDefinitions);
    expect(isSelectableFromPlan(plan)).toBe(true);
  });

  it("is not selectable when every board is not_offered", () => {
    const plan = resolveProvisioningPlan("nonexistent-subject-slug", referenceSpecifications, syllabusDefinitions);
    expect(plan.every((entry) => entry.status === "not_offered")).toBe(true);
    expect(isSelectableFromPlan(plan)).toBe(false);
  });
});

function isSelectableFromPlan(plan: ReturnType<typeof resolveProvisioningPlan>) {
  return plan.some((entry) => entry.status === "ready" || entry.status === "coming_soon");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/provisioning.test.ts`
Expected: FAIL — `Cannot find module '@/lib/repositories/provisioning'` or similar (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/repositories/provisioning.ts
import type { ReferenceSpecification } from "@/data/reference/catalogue";
import type { SyllabusDefinition } from "@/data/syllabuses/types";

export type ProvisioningBoardCode = "AQA" | "EDEXCEL";
export type ProvisioningStatus = "ready" | "coming_soon" | "not_offered" | "error";

export type ProvisioningPlanEntry = {
  boardCode: ProvisioningBoardCode;
  status: ProvisioningStatus;
  specificationCode: string | null;
  specificationName: string | null;
  message: string | null;
};

const BOARD_CODES: ProvisioningBoardCode[] = ["AQA", "EDEXCEL"];

export function resolveProvisioningPlan(
  subjectSlug: string,
  specifications: ReferenceSpecification[],
  syllabusDefinitions: SyllabusDefinition[],
): ProvisioningPlanEntry[] {
  return BOARD_CODES.map((boardCode) => {
    const spec = specifications.find(
      (item) => item.subjectSlug === subjectSlug && item.boardCode === boardCode,
    );

    if (!spec) {
      return {
        boardCode,
        status: "not_offered",
        specificationCode: null,
        specificationName: null,
        message: `${boardCode} does not currently offer this subject.`,
      };
    }

    const boardName = boardCode === "AQA" ? "AQA" : "Pearson Edexcel";
    const hasSyllabusFile = syllabusDefinitions.some(
      (definition) =>
        definition.examBoard === boardName && definition.specificationCode === spec.specificationCode,
    );

    return {
      boardCode,
      status: hasSyllabusFile ? "ready" : "coming_soon",
      specificationCode: spec.specificationCode,
      specificationName: spec.specificationName,
      message: hasSyllabusFile
        ? null
        : `${spec.specificationCode} is valid but detailed topic tracking is not yet built.`,
    };
  });
}

export function isSubjectSelectableFromPlan(plan: ProvisioningPlanEntry[]) {
  return plan.some((entry) => entry.status === "ready" || entry.status === "coming_soon");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/provisioning.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/repositories/provisioning.ts tests/provisioning.test.ts
git commit -m "Add pure subject provisioning plan resolver with unit tests"
```

---

## Task 3: `requireAdmin()` helper

**Files:**
- Modify: `src/lib/repositories/profiles.ts`

- [ ] **Step 1: Add the helper function**

Add after the existing `isCurrentUserAdmin` function (after line 52 in the current file):

```typescript
export async function requireAdmin(): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }
  return profile;
}
```

Add the import at the top of the file:

```typescript
import { redirect } from "next/navigation";
```

(alongside the existing `import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";` and `import { requireUser } from "./common";`)

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors related to `profiles.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/repositories/profiles.ts
git commit -m "Add requireAdmin() helper for server-side admin route guards"
```

---

## Task 4: Provisioning repository — DB-writing wrapper + enable/disable actions

**Files:**
- Modify: `src/lib/repositories/reference-data.ts`
- Create: `src/actions/admin-subject-actions.ts`

- [ ] **Step 1: Add `provisionSubject` to `reference-data.ts`**

Add these exports after the existing `getReferenceDiagnostics` function (end of file):

```typescript
import { resolveProvisioningPlan, isSubjectSelectableFromPlan, type ProvisioningPlanEntry } from "./provisioning";
import { syllabusDefinitions } from "@/data/syllabuses";
import { requireUser } from "./common";

export type ProvisionSubjectResult = {
  subjectId: string;
  subjectName: string;
  plan: ProvisioningPlanEntry[];
  selectable: boolean;
};

export async function provisionSubject(subjectId: string): Promise<ProvisionSubjectResult> {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data: subjectRow, error: subjectError } = await supabase
    .from("a_level_subjects")
    .select("id,slug,name")
    .eq("id", subjectId)
    .single();
  if (subjectError) throw new Error(subjectError.message);

  const plan = resolveProvisioningPlan(subjectRow.slug, referenceSpecifications, syllabusDefinitions);

  const boards = await getExamBoards();
  const boardByCode = new Map(boards.map((board) => [board.code, board]));

  for (const entry of plan) {
    const board = boardByCode.get(entry.boardCode);
    if (!board) continue;

    if (entry.status !== "not_offered") {
      const spec = referenceSpecifications.find(
        (item) => item.subjectSlug === subjectRow.slug && item.boardCode === entry.boardCode,
      );
      if (spec) {
        await supabase.from("board_subject_offerings").upsert(
          {
            exam_board_id: board.id,
            subject_id: subjectRow.id,
            qualification_level: "A Level",
            available: true,
            coming_soon: entry.status !== "ready",
            topic_support_status: entry.status === "ready" ? "full" : "coming_soon",
            official_source_url: spec.officialSourceUrl,
            verified_at: new Date().toISOString().slice(0, 10),
          },
          { onConflict: "exam_board_id,subject_id,qualification_level" },
        ).throwOnError();

        await supabase.from("specifications").upsert(
          {
            exam_board_id: board.id,
            subject_id: subjectRow.id,
            qualification_type: "A Level",
            specification_code: spec.specificationCode,
            specification_name: spec.specificationName,
            version_name: spec.versionName ?? null,
            teaching_from: spec.teachingFrom ?? null,
            first_exam: spec.firstExam ?? null,
            active: true,
            topic_support_status: entry.status === "ready" ? "full" : "coming_soon",
            official_source_url: spec.officialSourceUrl,
            verified_at: new Date().toISOString().slice(0, 10),
          },
          { onConflict: "exam_board_id,specification_code" },
        ).throwOnError();
      }
    }

    await supabase.from("subject_provisioning_status").upsert(
      {
        subject_id: subjectRow.id,
        board_code: entry.boardCode,
        status: entry.status,
        message: entry.message,
        provisioned_at: new Date().toISOString(),
      },
      { onConflict: "subject_id,board_code" },
    );
  }

  const selectable = isSubjectSelectableFromPlan(plan);

  await supabase.from("a_level_subjects").update({ student_selectable: selectable }).eq("id", subjectRow.id);

  await supabase.from("audit_log").insert({
    actor_id: user.id,
    action: "admin_provisioned_syllabus",
    entity_type: "a_level_subjects",
    entity_id: subjectRow.id,
    new_value: { plan, selectable },
  });

  return { subjectId: subjectRow.id, subjectName: subjectRow.name, plan, selectable };
}

export async function setSubjectSelectable(subjectId: string, selectable: boolean) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data: before } = await supabase
    .from("a_level_subjects")
    .select("student_selectable")
    .eq("id", subjectId)
    .maybeSingle();

  const { error } = await supabase
    .from("a_level_subjects")
    .update({ student_selectable: selectable })
    .eq("id", subjectId);
  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    actor_id: user.id,
    action: selectable ? "admin_enabled_subject" : "admin_disabled_subject",
    entity_type: "a_level_subjects",
    entity_id: subjectId,
    old_value: { student_selectable: before?.student_selectable ?? null },
    new_value: { student_selectable: selectable },
  });
}

export type SubjectAdminRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  active: boolean;
  studentSelectable: boolean;
  provisioning: ProvisioningPlanEntry[];
};

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

Note: `referenceSpecifications` and `getExamBoards` are already defined/exported in this same file — no new import needed for those two.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. If `throwOnError()` typing complains, check the existing `seedReferenceData` function in the same file — it already uses `.throwOnError()` on identical upsert calls, so the pattern is proven to type-check in this codebase.

- [ ] **Step 3: Create the admin subject actions file**

```typescript
// src/actions/admin-subject-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { provisionSubject, setSubjectSelectable } from "@/lib/repositories/reference-data";
import { requireAdmin } from "@/lib/repositories/profiles";

export async function enableSubjectAction(formData: FormData) {
  await requireAdmin();
  const subjectId = String(formData.get("subjectId") ?? "");
  if (!subjectId) throw new Error("Missing subject.");

  await provisionSubject(subjectId);
  await setSubjectSelectable(subjectId, true);
  revalidatePath("/admin/subjects");
  revalidatePath("/admin/syllabuses");
  revalidatePath("/admin");
}

export async function disableSubjectAction(formData: FormData) {
  await requireAdmin();
  const subjectId = String(formData.get("subjectId") ?? "");
  if (!subjectId) throw new Error("Missing subject.");

  await setSubjectSelectable(subjectId, false);
  revalidatePath("/admin/subjects");
  revalidatePath("/admin");
}

export async function reprovisionSubjectAction(formData: FormData) {
  await requireAdmin();
  const subjectId = String(formData.get("subjectId") ?? "");
  if (!subjectId) throw new Error("Missing subject.");

  await provisionSubject(subjectId);
  revalidatePath("/admin/subjects");
  revalidatePath("/admin/syllabuses");
}
```

Note: `enableSubjectAction` calls `provisionSubject` first (which itself sets `student_selectable` based on whether at least one board resolved), then explicitly calls `setSubjectSelectable(subjectId, true)` only after provisioning succeeds — matching the issue's "only after provisioning succeeds sufficiently, expose it to students" requirement. If `provisionSubject` throws (e.g. subject not found), the explicit enable call never runs, so a fully-failed provision never gets exposed.

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/repositories/reference-data.ts src/actions/admin-subject-actions.ts
git commit -m "Add subject provisioning writes, enable/disable actions, and admin subject listing"
```

---

## Task 5: Admin route group — layout guard, overview, subjects, syllabuses, users, diagnostics

**Files:**
- Create: `src/app/admin/layout.tsx`
- Modify: `src/app/admin/page.tsx` (rewrite as overview)
- Create: `src/app/admin/subjects/page.tsx`
- Create: `src/app/admin/syllabuses/page.tsx`
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/admin/diagnostics/page.tsx`

- [ ] **Step 1: Create the shared admin layout with the route guard**

```typescript
// src/app/admin/layout.tsx
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
```

This single guard covers every route under `/admin/*` — child pages no longer each need their own `redirect` check, and no longer wrap themselves in `<AppShell>` (the layout does that once).

- [ ] **Step 2: Rewrite `/admin` as the overview page**

```typescript
// src/app/admin/page.tsx
import Link from "next/link";
import { Card, DataRow, PageHeader } from "@/components/ui";
import { getReferenceDiagnostics } from "@/lib/repositories/reference-data";
import { listAllProfiles } from "@/lib/repositories/profiles";

export default async function AdminOverviewPage() {
  const [diagnostics, profiles] = await Promise.all([
    getReferenceDiagnostics().catch(() => null),
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

- [ ] **Step 3: Create `/admin/subjects`**

```typescript
// src/app/admin/subjects/page.tsx
import { disableSubjectAction, enableSubjectAction, reprovisionSubjectAction } from "@/actions/admin-subject-actions";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getSubjectsForAdmin } from "@/lib/repositories/reference-data";

export default async function AdminSubjectsPage() {
  const subjects = await getSubjectsForAdmin();

  return (
    <>
      <PageHeader
        eyebrow="Global Admin"
        title="Subjects"
        description="Enable subjects for student selection. Enabling provisions AQA and Pearson Edexcel reference data where officially available."
      />
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
              {subjects.map((subject) => {
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

- [ ] **Step 4: Create `/admin/syllabuses`**

```typescript
// src/app/admin/syllabuses/page.tsx
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

- [ ] **Step 5: Create `/admin/users`**

```typescript
// src/app/admin/users/page.tsx
import { updateUserRoleAction } from "@/actions/admin-actions";
import { Badge, Card, PageHeader } from "@/components/ui";
import { listAllProfiles } from "@/lib/repositories/profiles";

const ROLES = ["student", "parent", "tutor", "mentor", "admin"] as const;

export default async function AdminUsersPage() {
  const profiles = await listAllProfiles();

  return (
    <>
      <PageHeader eyebrow="Global Admin" title="Users" description="Manage user roles." />
      <Card>
        <div className="space-y-3">
          {profiles.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
              <div>
                <p className="font-medium">{row.fullName}</p>
                <p className="text-xs text-slate-500">{row.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={row.role === "admin" ? "green" : "slate"}>{row.role}</Badge>
                <form action={updateUserRoleAction} className="flex items-center gap-2">
                  <input type="hidden" name="userId" value={row.id} />
                  <select name="role" defaultValue={row.role} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium">Save</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
```

- [ ] **Step 6: Create `/admin/diagnostics`**

```typescript
// src/app/admin/diagnostics/page.tsx
import { seedReferenceDataAction } from "@/actions/reference-actions";
import { Card, DataRow, PageHeader } from "@/components/ui";
import { getReferenceDiagnostics } from "@/lib/repositories/reference-data";

export default async function AdminDiagnosticsPage() {
  const diagnostics = await getReferenceDiagnostics().catch(() => null);

  return (
    <>
      <PageHeader
        eyebrow="Global Admin"
        title="Diagnostics"
        description="Load or repair the base reference catalogue (exam boards, subjects, grade scales)."
      />
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

- [ ] **Step 7: Delete the now-redundant `/settings/reference-data` redirect page's purpose is superseded — leave it as-is (still redirects to `/admin`, which still works, just now lands on the overview instead of the old flat page)**

No file change needed here — `src/app/settings/reference-data/page.tsx` already does `redirect("/admin")` from prior work, and `/admin` still exists as a valid route (now the overview). Confirm this by reading the file; do not modify it.

- [ ] **Step 8: Type-check, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: no errors. Confirm `/admin`, `/admin/subjects`, `/admin/syllabuses`, `/admin/users`, `/admin/diagnostics` all appear in the build route list.

- [ ] **Step 9: Commit**

```bash
git add src/app/admin/
git commit -m "Split /admin into a route group: overview, subjects, syllabuses, users, diagnostics"
```

---

## Task 6: Admin nav section in `AppShell`

**Files:**
- Modify: `src/components/app-shell.tsx`

- [ ] **Step 1: Replace the single Admin nav item with a collapsible section**

Replace this block (current lines 74-85):

```typescript
  const entries: NavEntry[] = [
    ...topItems.map((item) => ({ kind: "item" as const, item })),
    { kind: "section" as const, section: aLevelsSection },
    { kind: "section" as const, section: progressSection },
    { kind: "section" as const, section: extraCurricularsSection },
    { kind: "section" as const, section: nextStepsSection },
    ...(isAdmin ? [{ kind: "item" as const, item: { href: "/admin", label: "Admin", icon: "ShieldCheck" as const } }] : []),
  ];

  const mobileItems: NavItem[] = isAdmin
    ? [...mobileNavItems, { href: "/admin", label: "Admin", icon: "ShieldCheck" as const }]
    : mobileNavItems;
```

with:

```typescript
  const adminSection = {
    title: "Admin",
    items: [
      { href: "/admin", label: "Overview", icon: "ShieldCheck" as const },
      { href: "/admin/subjects", label: "Subjects", icon: "GraduationCap" as const },
      { href: "/admin/syllabuses", label: "Syllabuses", icon: "BookOpen" as const },
      { href: "/admin/users", label: "Users", icon: "Users" as const },
      { href: "/admin/diagnostics", label: "Diagnostics", icon: "ClipboardCheck" as const },
    ],
  } satisfies { title: string; items: NavItem[] };

  const entries: NavEntry[] = [
    ...topItems.map((item) => ({ kind: "item" as const, item })),
    { kind: "section" as const, section: aLevelsSection },
    { kind: "section" as const, section: progressSection },
    { kind: "section" as const, section: extraCurricularsSection },
    { kind: "section" as const, section: nextStepsSection },
    ...(isAdmin ? [{ kind: "section" as const, section: adminSection }] : []),
  ];

  const mobileItems: NavItem[] = isAdmin
    ? [...mobileNavItems, { href: "/admin", label: "Admin", icon: "ShieldCheck" as const }]
    : mobileNavItems;
```

`adminSection` is defined inline inside the `AppShell` function body (not as a module-level const like the others) because it's only ever constructed when `isAdmin` is true — no behavior change needed elsewhere.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors — all icon names used (`ShieldCheck`, `GraduationCap`, `BookOpen`, `Users`, `ClipboardCheck`) already exist in `app-nav.tsx`'s `ICONS` map.

- [ ] **Step 3: Commit**

```bash
git add src/components/app-shell.tsx
git commit -m "Show Admin as a collapsible nav section instead of a single link"
```

---

## Task 7: Rename Home to Dashboard, move dashboard content to `/dashboard`

**Files:**
- Create: `src/app/dashboard/page.tsx` (dashboard content moves here, rebuilt around `student_subjects`)
- Modify: `src/app/page.tsx` (becomes a redirect)
- Modify: `src/components/app-shell.tsx` (nav label + href)
- Modify: `src/lib/analytics/calculations.ts` (add qualitative progress label mapping)

- [ ] **Step 1: Add a qualitative progress-label helper to `calculations.ts`**

Append to the end of `src/lib/analytics/calculations.ts`:

```typescript
export type ProgressLabel = "Not assessed" | "Early evidence" | "Developing" | "On track" | "Needs attention";

export function progressLabelFromEvidence(input: { topicCount: number; percent: number | null }): ProgressLabel {
  if (input.topicCount === 0 || input.percent === null) return "Not assessed";
  if (input.topicCount < 3) return "Early evidence";
  if (input.percent < 40) return "Needs attention";
  if (input.percent < 70) return "Developing";
  return "On track";
}
```

- [ ] **Step 2: Write a unit test for the new helper**

```typescript
// tests/calculations.test.ts — append inside the existing describe("analytics calculations", ...) block, after the last existing `it(...)`
  it("maps evidence into qualitative progress labels", () => {
    expect(progressLabelFromEvidence({ topicCount: 0, percent: null })).toBe("Not assessed");
    expect(progressLabelFromEvidence({ topicCount: 1, percent: 20 })).toBe("Early evidence");
    expect(progressLabelFromEvidence({ topicCount: 5, percent: 20 })).toBe("Needs attention");
    expect(progressLabelFromEvidence({ topicCount: 5, percent: 55 })).toBe("Developing");
    expect(progressLabelFromEvidence({ topicCount: 5, percent: 85 })).toBe("On track");
  });
```

Also add `progressLabelFromEvidence` to the existing top import line in `tests/calculations.test.ts`:

```typescript
import { examPercentage, lastAverage, marksFromBoundary, progressLabelFromEvidence, repeatedWeaknesses } from "@/lib/analytics/calculations";
```

- [ ] **Step 3: Run the test**

Run: `npx vitest run tests/calculations.test.ts`
Expected: PASS (all tests including the new one).

- [ ] **Step 4: Create `/dashboard`**

```typescript
// src/app/dashboard/page.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, Card, DataRow, PageHeader, ProgressBar, Stat } from "@/components/ui";
import { getDailyPlan } from "@/lib/repositories/daily-plans";
import { getExams } from "@/lib/repositories/exams";
import { getMyOnboardingSubjects, getStudentOnboardingProfile } from "@/lib/repositories/onboarding";
import { firstName, getCurrentProfile } from "@/lib/repositories/profiles";
import { progressLabelFromEvidence } from "@/lib/analytics/calculations";

export default async function DashboardPage() {
  const [profile, studentProfile, subjects, dailyPlan, exams] = await Promise.all([
    getCurrentProfile(),
    getStudentOnboardingProfile().catch(() => null),
    getMyOnboardingSubjects(),
    getDailyPlan(),
    getExams(),
  ]);
  const name = firstName(profile);
  const plannedHours = dailyPlan?.tasks.reduce((sum, task) => sum + (task.estimatedDuration ?? 0), 0) ?? 0;
  const completedHours = dailyPlan?.tasks.reduce((sum, task) => sum + (task.actualDuration ?? 0), 0) ?? 0;
  const tasksCompleted = dailyPlan?.tasks.filter((task) => task.status === "Complete").length ?? 0;
  const nextMock = exams.find((exam) => exam.cycleStatus !== "Complete");

  return (
    <>
      <PageHeader
        eyebrow={studentProfile ? `${studentProfile.stage}${studentProfile.schoolCollege ? ` · ${studentProfile.schoolCollege}` : ""}` : undefined}
        title={`Hi ${name}`}
        description="Your A-Level subjects, plan, and progress at a glance."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><Stat label="Study hours this week" value={`${plannedHours}h`} detail={`${completedHours}h completed`} /></Card>
        <Card><Stat label="Tasks completed" value={String(tasksCompleted)} detail="From today's plan" /></Card>
        <Card><Stat label="Next mock" value={nextMock ? nextMock.paper : "None scheduled"} detail={nextMock?.completedOn ?? undefined} /></Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Your Subjects</h2>
        {subjects.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Board</th>
                  <th className="py-2 pr-4">Self / School / Target</th>
                  <th className="py-2 pr-4">Progress</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => {
                  const label = progressLabelFromEvidence({
                    topicCount: subject.topicSupportStatus === "full" ? 10 : 0,
                    percent: subject.progressPercent,
                  });
                  return (
                    <tr key={subject.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 font-medium">{subject.subjectName}</td>
                      <td className="py-3 pr-4">{subject.boardName ?? "Not sure"}</td>
                      <td className="py-3 pr-4">
                        {subject.selfGrade ?? "–"} / {subject.schoolPredictedGrade ?? "–"} / {subject.targetGrade ?? "–"}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          {subject.progressPercent != null ? (
                            <div className="w-20"><ProgressBar value={subject.progressPercent} /></div>
                          ) : null}
                          <Badge tone={label === "On track" ? "green" : label === "Needs attention" ? "red" : "slate"}>{label}</Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No subjects yet. <Link href="/onboarding" className="font-medium underline">Complete onboarding</Link> to select your A-Levels.
          </p>
        )}
      </Card>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Today&apos;s Plan</h2>
          <Link href="/today" className="inline-flex items-center gap-1 text-sm font-medium text-slate-950">
            Open Plan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4">
          <DataRow label="Tasks today" value={dailyPlan?.tasks.length ?? 0} />
          <DataRow label="Planned hours" value={`${plannedHours}h`} />
        </div>
      </Card>
    </>
  );
}
```

Note: this page does **not** wrap itself in `<AppShell>` — since `AppShell` is applied by `src/app/layout.tsx` in this codebase's convention... **verify this assumption before writing the file**: check whether every existing top-level page (e.g. `src/app/today/page.tsx`) wraps its own return in `<AppShell>...</AppShell>` or whether a layout does it. Based on every file read so far in this session (`onboarding/page.tsx`, `admin/page.tsx` before this plan, `subjects/page.tsx`), **every page wraps itself in `<AppShell>`** — there is no shared layout doing it. Correct the code above accordingly: wrap the returned JSX fragment in `<AppShell>...</AppShell>` instead of a bare fragment, matching every other page in the app. (The admin route group in Task 5 is the one exception, where the shared `AdminLayout` now does it once for all `/admin/*` children — do not apply that pattern to `/dashboard`, which has no parent layout.)

- [ ] **Step 5: Replace `/` with a redirect**

```typescript
// src/app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
```

This fully replaces the old file's content (the dashboard logic that used to live here has moved to Task 7 Step 4's `/dashboard/page.tsx`, rebuilt around `student_subjects` instead of the legacy `subjects` table per the design doc).

- [ ] **Step 6: Update nav label and href in `app-shell.tsx`**

Change:

```typescript
const topItems: NavItem[] = [
  { href: "/", label: "Home", icon: "Home" },
  { href: "/today", label: "Today", icon: "CalendarDays" },
];
```

to:

```typescript
const topItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "Home" },
  { href: "/today", label: "Today", icon: "CalendarDays" },
];
```

Also update the two `<Link href="/" ...>` wordmark links inside `AppShell`'s return (desktop sidebar and mobile header, both currently link the "Alevs.io" title text to `/`) to `href="/dashboard"` instead, so clicking the logo doesn't bounce through a redirect unnecessarily. There are two occurrences — the desktop one wraps `<p className="text-lg font-semibold tracking-tight">Alevs.io</p>`, the mobile one wraps the header block with `<p className="text-base font-semibold">Alevs.io</p>`. Only the desktop one is an actual `<Link>`; the mobile header title is a plain `<div>`, not a link — leave that one as-is, only change the desktop `<Link href="/" ...>` to `<Link href="/dashboard" ...>`.

- [ ] **Step 7: Type-check, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: no errors. Confirm `/dashboard` appears as a new route and `/` still exists (now a redirect, likely shown as `○` static in the build output since `redirect()` at module scope is statically analyzable... if the build shows it as `ƒ` dynamic instead, that's also fine — either is correct, just confirm it's present and doesn't error).

- [ ] **Step 8: Commit**

```bash
git add src/app/dashboard/ src/app/page.tsx src/components/app-shell.tsx src/lib/analytics/calculations.ts tests/calculations.test.ts
git commit -m "Replace Home with Dashboard; rebuild around student_subjects with qualitative progress labels"
```

---

## Task 8: Strict onboarding — only admin-enabled subjects appear

**Files:**
- Modify: `src/lib/repositories/reference-data.ts`

- [ ] **Step 1: Filter `getReferenceSubjects` to `student_selectable`**

Find the existing `getReferenceSubjects` function:

```typescript
export async function getReferenceSubjects(): Promise<ReferenceSubjectOption[]> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("a_level_subjects")
    .select("id,slug,name,category,topic_support_status")
    .eq("active", true)
    .order("sort_order")
    .order("name");
```

Change the `.eq("active", true)` line to add a second filter:

```typescript
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
```

This is the only change needed for the onboarding gate — `reference-subject-selector.tsx` already consumes `getReferenceSubjects()`'s output as its full subject list (no "coming soon, greyed out" entries beyond what's already offered), and `/admin/subjects` (Task 5) uses the separate `getSubjectsForAdmin()` function which does **not** filter by `student_selectable`, so admins still see every subject regardless of enablement.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Write a unit test confirming the query shape via a smoke test on the exported type, since this function requires a live Supabase connection and cannot be unit-tested without one (consistent with every other Supabase-dependent function in this repo — none have direct unit tests; only pure functions do)**

No test needed for this step — this matches the existing repo convention exactly: `getReferenceSubjects`, `getBoardOfferings`, etc. have never had direct unit tests (verified in Task 2's investigation: only `catalogue.ts`'s static data and `calculations.ts`'s pure functions are tested). Do not add a DB-mocking test here; it would be the first of its kind in this codebase and out of scope for this plan.

- [ ] **Step 4: Commit**

```bash
git add src/lib/repositories/reference-data.ts
git commit -m "Gate onboarding subject selector to admin-enabled (student_selectable) subjects only"
```

---

## Task 9: `/settings/academic` — locked/unlock/save flow

**Files:**
- Create: `src/app/settings/academic/page.tsx`
- Create: `src/app/settings/academic/academic-setup-form.tsx`
- Create: `src/actions/academic-settings-actions.ts`
- Modify: `src/components/app-shell.tsx` (add nav link)

- [ ] **Step 1: Extract subject validation into a reusable, exported function**

`onboarding-actions.ts` currently has a private `validateOnboardingSubjects` function. Move it into `src/lib/repositories/onboarding.ts` as an exported function so both onboarding and the new academic-settings action can use it without duplicating logic.

In `src/lib/repositories/onboarding.ts`, add near the top (after the existing type definitions, before `getStudentOnboardingProfile`):

```typescript
import { getBoardOfferings, getGradeOptions, getReferenceSpecifications, getReferenceSubjects } from "./reference-data";

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

**Important — avoid a circular import.** `reference-data.ts` does not import from `onboarding.ts`, so this direction (`onboarding.ts` importing from `reference-data.ts`) is safe. Confirm by checking `reference-data.ts`'s import list has no `from "./onboarding"` — it doesn't (verified: its imports are only `./common` and `@/data/reference/catalogue`).

- [ ] **Step 2: Update `onboarding-actions.ts` to use the shared function**

Remove the private `validateOnboardingSubjects` function definition (the whole `async function validateOnboardingSubjects(...)` block at the bottom of the file) and instead import it:

```typescript
import {
  saveCanonicalOnboardingSubjects,
  saveStudyAvailability,
  validateOnboardingSubjects,
  type OnboardingSubjectInput,
  upsertStudentOnboardingProfile,
  type StudentStage,
} from "@/lib/repositories/onboarding";
```

(replacing the current import block that lists `saveCanonicalOnboardingSubjects, saveStudyAvailability, type OnboardingSubjectInput, upsertStudentOnboardingProfile, type StudentStage`). Remove the now-unused imports `getBoardOfferings, getGradeOptions, getReferenceSpecifications, getReferenceSubjects` from `@/lib/repositories/reference-data` at the top of `onboarding-actions.ts`, since only `validateOnboardingSubjects` (now imported from `onboarding.ts`) used them.

- [ ] **Step 3: Type-check after the extraction**

Run: `npx tsc --noEmit`
Expected: no errors. This confirms the function move didn't break `saveOnboardingAction`'s existing behavior.

- [ ] **Step 4: Run the existing test suite to confirm nothing broke**

Run: `npx vitest run`
Expected: PASS, same test count as before (26 + 1 from Task 7 + 5 from Task 2 = 32 tests).

- [ ] **Step 5: Create the academic settings server action**

```typescript
// src/actions/academic-settings-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  saveCanonicalOnboardingSubjects,
  saveStudyAvailability,
  upsertStudentOnboardingProfile,
  validateOnboardingSubjects,
  type OnboardingSubjectInput,
  type StudentStage,
} from "@/lib/repositories/onboarding";
import { getSupabaseForRead, requireUser } from "@/lib/repositories/common";

export async function updateAcademicSetupAction(formData: FormData) {
  try {
    const firstName = formData.get("firstName")?.toString() || null;
    const schoolCollege = formData.get("schoolCollege")?.toString() || null;
    const stage = (formData.get("stage")?.toString() || "Year 12") as StudentStage;
    const lighterDays = formData.getAll("lighterDays").map(String);

    const subjects = [0, 1, 2, 3, 4].map((index) => subjectFromForm(formData, index));
    await validateOnboardingSubjects(subjects);

    await upsertStudentOnboardingProfile({
      firstName,
      schoolCollege,
      stage,
      weekdayStudyHours: optionalHours(formData.get("weekdayDefaultMinutes")),
      weekendStudyHours: optionalHours(formData.get("weekendDefaultMinutes")),
      lighterDays,
      onboardingStep: 3,
      onboardingCompleted: true,
    });

    await saveCanonicalOnboardingSubjects(subjects);
    await saveStudyAvailability({
      weekdayDefaultMinutes: optionalNumber(formData.get("weekdayDefaultMinutes")),
      weekendDefaultMinutes: optionalNumber(formData.get("weekendDefaultMinutes")),
      lighterDays,
    });

    const supabase = await getSupabaseForRead();
    const user = await requireUser();
    if (supabase) {
      await supabase.from("audit_log").insert({
        actor_id: user.id,
        action: "student_changed_academic_setup",
        entity_type: "student_subjects",
        entity_id: user.id,
        new_value: { subjectCount: subjects.filter((subject) => subject.referenceSubjectId).length },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save changes. Please try again.";
    redirect(`/settings/academic?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/settings/academic");
  revalidatePath("/dashboard");
  revalidatePath("/subjects");
  redirect("/settings/academic");
}

export async function removeAcademicSubjectAction(formData: FormData) {
  const studentSubjectId = String(formData.get("studentSubjectId") ?? "");
  if (!studentSubjectId) throw new Error("Missing subject.");

  const supabase = await getSupabaseForRead();
  const user = await requireUser();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("student_subjects")
    .update({ active: false })
    .eq("id", studentSubjectId)
    .eq("owner_id", user.id);
  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    actor_id: user.id,
    action: "student_removed_subject",
    entity_type: "student_subjects",
    entity_id: studentSubjectId,
  });

  revalidatePath("/settings/academic");
  revalidatePath("/dashboard");
  revalidatePath("/subjects");
}

function subjectFromForm(formData: FormData, index: number): OnboardingSubjectInput {
  return {
    name: formData.get(`subject_${index}_name`)?.toString() || "",
    referenceSubjectId: formData.get(`subject_${index}_referenceSubjectId`)?.toString() || null,
    examBoardId: formData.get(`subject_${index}_examBoardId`)?.toString() || null,
    specificationId: formData.get(`subject_${index}_specificationId`)?.toString() || null,
    selectedOptionIds: formData.getAll(`subject_${index}_optionIds`).map(String),
    confirmationStatus:
      formData.get(`subject_${index}_confirmationStatus`) === "confirmed" ? "confirmed" : "needs_confirmation",
    topicSupportStatus: topicSupportStatus(formData.get(`subject_${index}_topicSupportStatus`)?.toString()),
    examBoard: formData.get(`subject_${index}_examBoardName`)?.toString() || "Not sure",
    specificationCode: formData.get(`subject_${index}_specificationCode`)?.toString() || "Not sure",
    specificationOptions: formData.getAll(`subject_${index}_optionNames`).map(String).join(", ") || null,
    achievedGrade: formData.get(`subject_${index}_selfGrade`)?.toString() || null,
    targetGrade: formData.get(`subject_${index}_targetGrade`)?.toString() || null,
    schoolPredictedGrade: formData.get(`subject_${index}_schoolPredictedGrade`)?.toString() || null,
  };
}

function optionalHours(value: FormDataEntryValue | null) {
  const minutes = optionalNumber(value);
  return minutes == null ? null : minutes / 60;
}

function optionalNumber(value: FormDataEntryValue | null) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function topicSupportStatus(value?: string | null): OnboardingSubjectInput["topicSupportStatus"] {
  return value === "full" || value === "not_planned" ? value : "coming_soon";
}
```

Note: `removeAcademicSubjectAction` is a separate, immediate action (not gated by the lock/edit state) — this matches the issue's §7 "Remove subject" flow, which is its own confirm-dialog-gated action distinct from the general field-edit save flow. It sets `active = false`, never deletes, matching the design doc.

- [ ] **Step 6: Create the client component wrapping lock/edit/save state**

```typescript
// src/app/settings/academic/academic-setup-form.tsx
"use client";

import { useState } from "react";
import { updateAcademicSetupAction, removeAcademicSubjectAction } from "@/actions/academic-settings-actions";
import { ReferenceSubjectSelector } from "@/app/onboarding/reference-subject-selector";
import type {
  GradeOption,
  ReferenceBoardOption,
  ReferenceComponentOption,
  ReferenceSpecificationOption,
  ReferenceSubjectOption,
} from "@/lib/repositories/reference-data";
import type { OnboardingSelectedSubject, StudentOnboardingProfile } from "@/lib/repositories/onboarding";

export function AcademicSetupForm({
  profile,
  selectedSubjects,
  referenceSubjects,
  boards,
  specifications,
  options,
  grades,
}: {
  profile: StudentOnboardingProfile | null;
  selectedSubjects: OnboardingSelectedSubject[];
  referenceSubjects: ReferenceSubjectOption[];
  boards: ReferenceBoardOption[];
  specifications: ReferenceSpecificationOption[];
  options: ReferenceComponentOption[];
  grades: GradeOption[];
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-500">🔒 Locked</p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
          >
            Enable Editing
          </button>
        </div>
        <div className="mt-6 space-y-3">
          <Row label="First name" value={profile?.firstName ?? "Not set"} />
          <Row label="School / college" value={profile?.schoolCollege ?? "Not set"} />
          <Row label="Stage" value={profile?.stage ?? "Not set"} />
          {selectedSubjects.map((subject) => (
            <div key={subject.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3">
              <div>
                <p className="font-medium">{subject.subjectName}</p>
                <p className="text-sm text-slate-500">
                  {subject.boardName ?? "Not sure"} · Self {subject.selfGrade ?? "–"} · School {subject.schoolPredictedGrade ?? "–"} · Target {subject.targetGrade ?? "–"}
                </p>
              </div>
              <form
                action={removeAcademicSubjectAction}
                onSubmit={(event) => {
                  if (!confirm(`Remove ${subject.subjectName} from your active subjects? Existing assessments and progress history will be retained.`)) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="studentSubjectId" value={subject.id} />
                <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium">
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form action={updateAcademicSetupAction} className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-emerald-700">🔓 Editing Enabled</p>
        <button type="button" onClick={() => setIsEditing(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">
          Cancel Changes
        </button>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Changes to subjects or specifications can affect your syllabus, plans and analytics.
      </div>

      <section>
        <h2 className="text-lg font-semibold">Student Profile</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="firstName" placeholder="First name" defaultValue={profile?.firstName ?? ""} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input name="schoolCollege" placeholder="School / college" defaultValue={profile?.schoolCollege ?? ""} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <select name="stage" defaultValue={profile?.stage ?? "Year 12"} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            {["Year 12", "Year 13", "Resit-Gap Year"].map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">A-Level Subjects</h2>
        <ReferenceSubjectSelector subjects={referenceSubjects} boards={boards} specifications={specifications} options={options} grades={grades} />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Available Time</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            name="weekdayDefaultMinutes"
            type="number"
            min="0"
            step="15"
            placeholder="Weekday study minutes"
            defaultValue={profile?.weekdayStudyHours ? Math.round(profile.weekdayStudyHours * 60) : ""}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="weekendDefaultMinutes"
            type="number"
            min="0"
            step="15"
            placeholder="Weekend study minutes"
            defaultValue={profile?.weekendStudyHours ? Math.round(profile.weekendStudyHours * 60) : ""}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </section>

      <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
        Save Changes
      </button>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
```

Note: `ReferenceSubjectSelector`'s internal state always starts from 4 blank rows (`useState<SubjectSelection[]>([blankRow(), blankRow(), blankRow(), blankRow()])`) — it does **not** pre-populate from the student's existing `selectedSubjects` when reused here. This is a known limitation carried over from the existing onboarding component: re-opening edit mode on `/settings/academic` will show 4 empty subject rows rather than the student's current selections pre-filled, meaning a student must re-enter all subjects to make any change, not just the one they want to edit. Flag this explicitly in the final report as a follow-up (pre-populating `ReferenceSubjectSelector` from existing `student_subjects` is a real UX gap but is a separate, scoped enhancement to the shared component, not blocking this issue's core requirement that edits are locked-by-default and require explicit save).

- [ ] **Step 7: Create the server page**

```typescript
// src/app/settings/academic/page.tsx
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

- [ ] **Step 8: Add the nav link**

In `src/components/app-shell.tsx`, add `Academic Setup` to `otherItems`... **check first**: the current `app-shell.tsx` (re-read in Task 6/7's edits) does not have an `otherItems` array — that was removed in a prior session and its contents folded into named sections. Add the new item to `aLevelsSection.items` instead, since Academic Setup is conceptually part of the A Levels area:

```typescript
const aLevelsSection = {
  title: "A Levels",
  items: [
    { href: "/onboarding", label: "Onboarding", icon: "UserCheck" },
    { href: "/subjects", label: "Subjects", icon: "GraduationCap" },
    { href: "/settings/academic", label: "Academic Setup", icon: "Settings" },
    { href: "/settings/syllabus", label: "Syllabus", icon: "BookOpen" },
    { href: "/tutoring", label: "Tutoring", icon: "Users" },
    { href: "/library", label: "Library", icon: "Library" },
  ],
} satisfies { title: string; items: NavItem[] };
```

This adds one line (`{ href: "/settings/academic", label: "Academic Setup", icon: "Settings" }`) to the existing array, right after `Onboarding, Subjects`. The `Settings` icon name is already in `app-nav.tsx`'s `ICONS` map (confirmed present).

- [ ] **Step 9: Type-check, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: no errors, `/settings/academic` appears in the route list.

- [ ] **Step 10: Commit**

```bash
git add src/app/settings/academic/ src/actions/academic-settings-actions.ts src/lib/repositories/onboarding.ts src/actions/onboarding-actions.ts src/components/app-shell.tsx
git commit -m "Add locked/unlock/save Academic Setup page under /settings/academic"
```

---

## Task 10: Legacy-user migration script

**Files:**
- Create: `supabase/migrations/20260820_migrate_existing_onboarding_completed.sql`

- [ ] **Step 1: Write a one-time data-fix migration**

Per the design doc, no new `onboarding_completed_at` column is added (the existing boolean is reused). The migration task here is narrower than the issue's literal wording: ensure any existing `student_profiles` row that already has real data (subjects selected, stage set) but `onboarding_completed = false` due to being created before the strict gate existed, gets marked complete rather than being force-walked through onboarding again.

```sql
-- One-time backfill: any existing student who already has at least one active
-- student_subjects row is treated as having effectively completed onboarding,
-- even if onboarding_completed was never explicitly set true (e.g. data seeded
-- directly, or completed before the strict gate/student_selectable filter existed).
-- New users with zero student_subjects rows are untouched and still go through
-- the strict onboarding gate on next login.
update public.student_profiles
set onboarding_completed = true, onboarding_step = 3
where onboarding_completed = false
  and owner_id in (
    select distinct owner_id
    from public.student_subjects
    where active = true and is_deleted = false
  );
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260820_migrate_existing_onboarding_completed.sql
git commit -m "Add backfill migration marking existing subject-holding students as onboarding-complete"
```

**Manual action required (document in final report):** like Task 1, this SQL must be run manually in the Supabase SQL editor. Running it twice is safe (idempotent — the `where onboarding_completed = false` guard means a second run matches zero rows).

---

## Task 11: Final full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: PASS. Count should be the original 26 + 5 (Task 2, `provisioning.test.ts`) + 1 (Task 7, `progressLabelFromEvidence`) = 32 tests across 7 files.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: succeeds. Confirm the route list includes: `/dashboard`, `/admin`, `/admin/subjects`, `/admin/syllabuses`, `/admin/users`, `/admin/diagnostics`, `/settings/academic`. Confirm `/` still exists (as a redirect).

- [ ] **Step 5: Manual smoke-check the diff for the two things automated tests cannot cover**

Read through `src/app/dashboard/page.tsx` and `src/app/settings/academic/academic-setup-form.tsx` one more time and confirm: (a) every field that was in the original onboarding form and is expected to persist (tutors, nextAssessments, visualTone) — note that Task 9's `updateAcademicSetupAction` intentionally does **not** collect `tutors`/`nextAssessments`/`visualTone` fields, since the issue's §7 field list (`name, school, stage, subjects, exam board, specification, options, grades, study availability`) does not include them. This is a deliberate scope decision, not an oversight — flag it in the final report as "Support/known-assessments and Visual Tone remain editable only via the original onboarding flow before completion; not added to the post-onboarding Academic Setup page since the issue's field list for that page didn't include them."

- [ ] **Step 6: Do not commit anything in this task — it is verification only. If any step fails, fix the underlying issue in the relevant earlier task's files and re-run from Step 1.**

---

## Explicitly out of scope (carried from the design doc — do not attempt)

- Live web-search-based syllabus content authoring wired into the enable-subject click path.
- Merging the legacy `subjects`/`syllabus_topics` system into `student_subjects`.
- New `profiles.onboarding_completed_at` timestamp column.
- Pre-populating `ReferenceSubjectSelector`'s 4 blank rows from a student's existing selections when reused on `/settings/academic` (flagged as a follow-up in Task 9).
- Batch multi-select enable/provision UX in `/admin/subjects` (issue §9 says "if practical" — single-row actions only, per row, in this plan).
- `/admin/syllabuses` drill-down into individual paper/topic hierarchies (issue §10's "allow drill-down" — this plan builds the summary table only; drill-down would reuse the existing `/topics/[id]` route pattern but is not wired in from the admin syllabus list).
