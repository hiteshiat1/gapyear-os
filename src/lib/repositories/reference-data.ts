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

  const [boardsResult, subjectsResult] = await Promise.all([getExamBoards(), getReferenceSubjects()]);
  const boards = boardsResult.data;
  const subjects = subjectsResult.data;
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

  const specifications = (await getReferenceSpecifications()).data;
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

  const boards = (await getExamBoards()).data;
  const boardByCode = new Map(boards.map((board) => [board.code, board]));

  // Post-write outcomes, per board. Starts as a copy of the pre-computed plan
  // but is overridden to "error" below if that board's DB writes throw.
  // This is what actually gets persisted to subject_provisioning_status and
  // returned to callers, since the pre-computed plan is only a prediction —
  // it does not reflect whether the writes for that board actually succeeded.
  const outcomes: ProvisioningPlanEntry[] = [];

  for (const entry of plan) {
    const board = boardByCode.get(entry.boardCode);
    if (!board) continue;

    let outcome: ProvisioningPlanEntry = entry;

    try {
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

          const { data: persistedSpec, error: specError } = await supabase
            .from("specifications")
            .upsert(
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
            )
            .select("id")
            .single();
          if (specError) throw new Error(specError.message);

          if (spec.options?.length) {
            await supabase.from("specification_options").upsert(
              spec.options.map((option) => ({
                specification_id: persistedSpec.id,
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
                specification_id: persistedSpec.id,
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
    } catch (err) {
      // Partial failure isolation: an error writing this board's data must
      // not abort provisioning of the other board. Record this board's
      // outcome as "error" and continue the loop.
      const message = err instanceof Error ? err.message : String(err);
      outcome = {
        ...entry,
        status: "error",
        message,
      };
    }

    outcomes.push(outcome);

    const { error: statusError } = await supabase.from("subject_provisioning_status").upsert(
      {
        subject_id: subjectRow.id,
        board_code: outcome.boardCode,
        status: outcome.status,
        message: outcome.message,
        provisioned_at: new Date().toISOString(),
      },
      { onConflict: "subject_id,board_code" },
    );
    if (statusError) throw new Error(statusError.message);
  }

  // Selectability must reflect what actually got written, not the pre-write
  // prediction: a board that threw during its DB writes did not successfully
  // provision, so it should not count as "ready"/"coming_soon" here even if
  // the plan predicted it would.
  const selectable = isSubjectSelectableFromPlan(outcomes);

  await supabase.from("a_level_subjects").update({ student_selectable: selectable }).eq("id", subjectRow.id);

  await supabase.from("audit_log").insert({
    actor_id: user.id,
    action: "admin_provisioned_syllabus",
    entity_type: "a_level_subjects",
    entity_id: subjectRow.id,
    new_value: { plan: outcomes, selectable },
  });

  return { subjectId: subjectRow.id, subjectName: subjectRow.name, plan: outcomes, selectable };
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
