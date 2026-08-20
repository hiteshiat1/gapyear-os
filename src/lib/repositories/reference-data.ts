import {
  gradeScale,
  referenceExamBoards,
  referenceSpecifications,
  referenceSubjects,
} from "@/data/reference/catalogue";
import { syllabusDefinitions } from "@/data/syllabuses";
import { getSupabaseForRead, requireUser } from "./common";
import { resolveProvisioningPlan, isSubjectSelectableFromPlan, type ProvisioningPlanEntry } from "./provisioning";

export type ReferenceSubjectOption = {
  id: string;
  slug: string;
  name: string;
  category: string;
  topicSupportStatus: "full" | "coming_soon" | "not_planned";
};

export type ReferenceBoardOption = {
  id: string;
  code: string;
  name: string;
  subjectId: string;
  topicSupportStatus: "full" | "coming_soon" | "not_planned";
};

export type ReferenceSpecificationOption = {
  id: string;
  examBoardId: string;
  subjectId: string;
  specificationCode: string;
  specificationName: string;
  topicSupportStatus: "full" | "coming_soon" | "not_planned";
};

export type ReferenceComponentOption = {
  id: string;
  specificationId: string;
  code: string;
  name: string;
  optionGroup: string | null;
  minSelect: number;
  maxSelect: number;
};

export type GradeOption = {
  grade: string;
  rank: number;
  isTargetSelectable: boolean;
};

export async function seedReferenceData() {
  const supabase = await getSupabaseForRead();
  await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  await supabase.from("exam_boards").upsert(
    referenceExamBoards.map((board) => ({
      code: board.code,
      name: board.name,
      official_name: board.officialName,
      country_scope: board.countryScope,
      website_url: board.websiteUrl,
      active: true,
      source_name: board.sourceName,
      source_url: board.sourceUrl,
      verified_at: "2026-08-18",
    })),
    { onConflict: "code" },
  ).throwOnError();

  await supabase.from("a_level_subjects").upsert(
    referenceSubjects.map((subject, index) => ({
      slug: subject.slug,
      name: subject.name,
      category: subject.category,
      active: true,
      sort_order: index + 1,
      topic_support_status: subject.topicSupportStatus,
      source_name: subject.sourceName,
      source_url: subject.sourceUrl,
      verified_at: "2026-08-18",
    })),
    { onConflict: "slug" },
  ).throwOnError();

  await supabase.from("grade_scales").upsert(
    gradeScale.map((grade) => ({
      qualification_type: "A Level",
      grade: grade.grade,
      rank: grade.rank,
      is_pass: grade.isPass,
      is_target_selectable: grade.isTargetSelectable,
    })),
    { onConflict: "qualification_type,grade" },
  ).throwOnError();

  const [boards, subjects] = await Promise.all([getExamBoards(), getReferenceSubjects()]);
  const boardByCode = new Map(boards.map((board) => [board.code, board]));
  const subjectBySlug = new Map(subjects.map((subject) => [subject.slug, subject]));

  for (const spec of referenceSpecifications) {
    const board = boardByCode.get(spec.boardCode);
    const subject = subjectBySlug.get(spec.subjectSlug);
    if (!board || !subject) continue;

    await supabase.from("board_subject_offerings").upsert(
      {
        exam_board_id: board.id,
        subject_id: subject.id,
        qualification_level: "A Level",
        available: true,
        coming_soon: spec.topicSupportStatus !== "full",
        topic_support_status: spec.topicSupportStatus,
        official_source_url: spec.officialSourceUrl,
        verified_at: "2026-08-18",
      },
      { onConflict: "exam_board_id,subject_id,qualification_level" },
    ).throwOnError();

    await supabase.from("specifications").upsert(
      {
        exam_board_id: board.id,
        subject_id: subject.id,
        qualification_type: "A Level",
        specification_code: spec.specificationCode,
        specification_name: spec.specificationName,
        version_name: spec.versionName ?? null,
        teaching_from: spec.teachingFrom ?? null,
        first_exam: spec.firstExam ?? null,
        active: true,
        topic_support_status: spec.topicSupportStatus,
        official_source_url: spec.officialSourceUrl,
        verified_at: "2026-08-18",
      },
      { onConflict: "exam_board_id,specification_code" },
    ).throwOnError();
  }

  const specifications = await getReferenceSpecifications();
  const specByCode = new Map(specifications.map((spec) => [`${spec.examBoardId}:${spec.specificationCode}`, spec]));

  for (const spec of referenceSpecifications) {
    const board = boardByCode.get(spec.boardCode);
    if (!board) continue;
    const persisted = specByCode.get(`${board.id}:${spec.specificationCode}`);
    if (!persisted) continue;

    if (spec.options?.length) {
      await supabase.from("specification_options").upsert(
        spec.options.map((option) => ({
          specification_id: persisted.id,
          code: option.code,
          name: option.name,
          option_group: option.optionGroup ?? null,
          required_or_optional: option.requiredOrOptional,
          min_select: option.minSelect,
          max_select: option.maxSelect,
          sort_order: option.sortOrder,
          active: true,
        })),
        { onConflict: "specification_id,code" },
      ).throwOnError();
    }

    if (spec.papers?.length) {
      await supabase.from("papers").upsert(
        spec.papers.map((paper) => ({
          specification_id: persisted.id,
          code: paper.code,
          name: paper.name,
          component_type: paper.componentType,
          weighting: paper.weighting ?? null,
          duration_minutes: paper.durationMinutes ?? null,
          max_marks: paper.maxMarks ?? null,
          sort_order: paper.sortOrder,
          active: true,
        })),
        { onConflict: "specification_id,code" },
      ).throwOnError();
    }
  }
}

export async function getReferenceSubjects(): Promise<ReferenceSubjectOption[]> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("a_level_subjects")
    .select("id,slug,name,category,topic_support_status")
    .eq("active", true)
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

export async function getGradeOptions(): Promise<GradeOption[]> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return gradeScale.map((grade) => ({
    grade: grade.grade,
    rank: grade.rank,
    isTargetSelectable: grade.isTargetSelectable,
  }));

  const { data, error } = await supabase
    .from("grade_scales")
    .select("grade,rank,is_target_selectable")
    .eq("qualification_type", "A Level")
    .order("rank", { ascending: false });

  if (error) {
    console.error("getGradeOptions failed", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    grade: row.grade,
    rank: row.rank,
    isTargetSelectable: row.is_target_selectable,
  }));
}

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
