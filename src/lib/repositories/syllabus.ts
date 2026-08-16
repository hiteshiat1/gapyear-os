import { syllabusDefinitions } from "@/data/syllabuses";
import type { SyllabusDefinition } from "@/data/syllabuses/types";
import { calculateTopicPriority } from "@/lib/planner/priority";
import { useMockData } from "@/lib/supabase/config";
import type {
  Subject,
  SyllabusTopic,
  TopicDiagnostic,
  TopicProgress,
  TopicStatus,
  TopicWithProgress,
} from "@/types/domain";
import { getExams } from "./exams";
import { getSupabaseForRead, requireUser, todayIso } from "./common";
import { getSubjects } from "./subjects";

type SyllabusTopicRow = {
  id: string;
  subject_id: string;
  parent_topic_id: string | null;
  stable_code: string;
  name: string;
  specification_code: string;
  specification_ref: string;
  paper_code: string;
  paper_name: string;
  topic_level: SyllabusTopic["topicLevel"];
  sort_order: number;
  is_optional: boolean;
  active: boolean;
};

type TopicProgressRow = {
  id: string;
  owner_id: string;
  syllabus_topic_id: string;
  status: TopicStatus;
  confidence: number | null;
  accuracy: number | null;
  priority: TopicProgress["priority"];
  last_revised: string | null;
  notes: string | null;
  tutor_feedback: string | null;
  retest_date: string | null;
  tutor_flag: boolean;
};

type TopicDiagnosticRow = {
  id: string;
  owner_id: string;
  subject_id: string;
  syllabus_topic_id: string;
  diagnostic_date: string;
  questions_attempted: number | null;
  correct: number | null;
  marks_scored: number;
  marks_available: number;
  percentage: number;
  confidence_before: number | null;
  confidence_after: number | null;
  notes: string | null;
};

export async function seedAllSyllabuses() {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const result: Array<{ subject: string; topics: number }> = [];

  for (const definition of syllabusDefinitions) {
    const subject = await ensureSubject(definition);
    const topicRows = definition.topics.map((topic) => ({
      subject_id: subject.id,
      stable_code: topic.code,
      name: topic.name,
      specification_code: definition.specificationCode,
      specification_ref: topic.specificationRef,
      paper_code: topic.paperCode,
      paper_name: topic.paperName,
      topic_level: topic.topicLevel,
      sort_order: topic.sortOrder,
      is_optional: topic.isOptional ?? false,
      active: topic.active ?? true,
    }));

    const { error } = await supabase
      .from("syllabus_topics")
      .upsert(topicRows, { onConflict: "subject_id,stable_code" });

    if (error) throw new Error(error.message);

    const topics = await getRawSyllabusTopics(subject.id);
    const byCode = new Map(topics.map((topic) => [topic.stable_code, topic.id]));

    for (const topic of definition.topics.filter((item) => item.parentCode)) {
      const id = byCode.get(topic.code);
      const parentId = byCode.get(topic.parentCode ?? "");
      if (!id || !parentId) continue;
      const { error: parentError } = await supabase
        .from("syllabus_topics")
        .update({ parent_topic_id: parentId })
        .eq("id", id);
      if (parentError) throw new Error(parentError.message);
    }

    const progressRows = topics.map((topic) => ({
      owner_id: user.id,
      syllabus_topic_id: topic.id,
      status: "Not Started",
      priority: "Medium",
      tutor_flag: false,
    }));

    const { error: progressError } = await supabase
      .from("topic_progress")
      .upsert(progressRows, { onConflict: "owner_id,syllabus_topic_id", ignoreDuplicates: true });

    if (progressError) throw new Error(progressError.message);

    result.push({ subject: definition.subjectName, topics: topics.length });
  }

  return result;
}

export async function getSyllabusLoadStatus() {
  const supabase = await getSupabaseForRead();

  if (!supabase) {
    return useMockData
      ? syllabusDefinitions.map((definition) => ({
          key: definition.key,
          subjectId: null,
          subjectName: definition.subjectName,
          shortName: definition.shortName,
          examBoard: definition.examBoard,
          specificationCode: definition.specificationCode,
          optionCode: definition.optionCode ?? null,
          expectedTopics: definition.topics.length,
          loadedTopics: 0,
          loaded: false,
        }))
      : [];
  }

  const subjects = await getSubjects();
  const statuses = [];

  for (const definition of syllabusDefinitions) {
    const subject = findSubjectForDefinition(subjects, definition);
    let loadedTopics = 0;
    if (subject) {
      const { count, error } = await supabase
        .from("syllabus_topics")
        .select("id", { count: "exact", head: true })
        .eq("subject_id", subject.id);
      if (!error) loadedTopics = count ?? 0;
    }

    statuses.push({
      key: definition.key,
      subjectId: subject?.id ?? null,
      subjectName: definition.subjectName,
      shortName: definition.shortName,
      examBoard: definition.examBoard,
      specificationCode: definition.specificationCode,
      optionCode: definition.optionCode ?? null,
      expectedTopics: definition.topics.length,
      loadedTopics,
      loaded: loadedTopics >= definition.topics.length,
    });
  }

  return statuses;
}

export async function getSyllabusTopicsWithProgress(subjectId?: string | null) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("syllabus_topics")
    .select("*")
    .eq("active", true)
    .order("subject_id")
    .order("sort_order");

  if (subjectId) query = query.eq("subject_id", subjectId);

  const { data: topicData, error } = await query;
  if (error) throw new Error(error.message);

  const topics = (topicData ?? []) as SyllabusTopicRow[];
  const topicIds = topics.map((topic) => topic.id);
  const progressRows = await getProgressRows(topicIds, user.id);
  const errorStats = await getErrorStats(topicIds);
  const progressByTopic = new Map(progressRows.map((row) => [row.syllabus_topic_id, row]));

  return topics.map((topic) => {
    const progress = progressByTopic.get(topic.id) ?? null;
    const stats = errorStats.get(topic.id) ?? { unresolvedErrors: 0, marksLost: 0 };
    const priority = calculateTopicPriority({
      status: progress?.status,
      confidence: progress?.confidence,
      accuracy: progress?.accuracy,
      lastRevised: progress?.last_revised,
      retestDate: progress?.retest_date,
      tutorFlag: progress?.tutor_flag,
      unresolvedErrors: stats.unresolvedErrors,
      marksLost: stats.marksLost,
    });

    return {
      topic: mapSyllabusTopic(topic),
      progress: progress ? mapTopicProgress(progress) : null,
      priorityScore: priority.score,
      priorityLabel: priority.label,
      priorityReasons: priority.reasons,
      unresolvedErrors: stats.unresolvedErrors,
      marksLost: stats.marksLost,
    } satisfies TopicWithProgress;
  });
}

export async function getTopicDetail(id: string) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.from("syllabus_topics").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);

  const progressRows = await getProgressRows([id], user.id);
  const errorStats = await getErrorStats([id]);
  const stats = errorStats.get(id) ?? { unresolvedErrors: 0, marksLost: 0 };
  const progress = progressRows[0] ?? null;
  const priority = calculateTopicPriority({
    status: progress?.status,
    confidence: progress?.confidence,
    accuracy: progress?.accuracy,
    lastRevised: progress?.last_revised,
    retestDate: progress?.retest_date,
    tutorFlag: progress?.tutor_flag,
    unresolvedErrors: stats.unresolvedErrors,
    marksLost: stats.marksLost,
  });

  const { data: diagnostics, error: diagnosticsError } = await supabase
    .from("topic_diagnostics")
    .select("*")
    .eq("owner_id", user.id)
    .eq("syllabus_topic_id", id)
    .eq("is_deleted", false)
    .order("diagnostic_date", { ascending: false })
    .limit(10);

  if (diagnosticsError) throw new Error(diagnosticsError.message);

  return {
    topic: mapSyllabusTopic(data as SyllabusTopicRow),
    progress: progress ? mapTopicProgress(progress) : null,
    priorityScore: priority.score,
    priorityLabel: priority.label,
    priorityReasons: priority.reasons,
    unresolvedErrors: stats.unresolvedErrors,
    marksLost: stats.marksLost,
    diagnostics: ((diagnostics ?? []) as TopicDiagnosticRow[]).map(mapDiagnostic),
  };
}

export async function createTopicDiagnostic(input: {
  subjectId: string;
  syllabusTopicId: string;
  diagnosticDate?: string | null;
  questionsAttempted?: number | null;
  correct?: number | null;
  marksScored: number;
  marksAvailable: number;
  confidenceBefore?: number | null;
  confidenceAfter?: number | null;
  notes?: string | null;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const percentage = Math.round((input.marksScored / input.marksAvailable) * 100);
  const status = diagnosticStatus(percentage, input.confidenceAfter ?? null);
  const priority = calculateTopicPriority({
    status,
    confidence: input.confidenceAfter ?? null,
    accuracy: percentage,
  });

  const { error } = await supabase.from("topic_diagnostics").insert({
    owner_id: user.id,
    subject_id: input.subjectId,
    syllabus_topic_id: input.syllabusTopicId,
    diagnostic_date: input.diagnosticDate ?? todayIso(),
    questions_attempted: input.questionsAttempted ?? null,
    correct: input.correct ?? null,
    marks_scored: input.marksScored,
    marks_available: input.marksAvailable,
    percentage,
    confidence_before: input.confidenceBefore ?? null,
    confidence_after: input.confidenceAfter ?? null,
    notes: input.notes ?? null,
  });

  if (error) throw new Error(error.message);

  const { error: progressError } = await supabase.from("topic_progress").upsert(
    {
      owner_id: user.id,
      syllabus_topic_id: input.syllabusTopicId,
      status,
      confidence: input.confidenceAfter ?? null,
      accuracy: percentage,
      priority: priority.label,
      last_revised: input.diagnosticDate ?? todayIso(),
      is_deleted: false,
    },
    { onConflict: "owner_id,syllabus_topic_id" },
  );

  if (progressError) throw new Error(progressError.message);
}

export async function resetAllTopicProgress() {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("topic_progress")
    .update({
      status: "Not Started",
      confidence: null,
      accuracy: null,
      priority: "Medium",
      last_revised: null,
      notes: null,
      tutor_feedback: null,
      retest_date: null,
      tutor_flag: false,
      is_deleted: false,
    })
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);
}

export async function getBlockedPapersForPlanner() {
  const exams = await getExams();
  return exams
    .filter((exam) => exam.cycleStatus !== "Complete")
    .slice(0, 3)
    .map((exam) => ({
      id: exam.id,
      subjectId: exam.subjectId,
      paper: exam.paper,
      cycleStatus: exam.cycleStatus,
    }));
}

async function ensureSubject(definition: SyllabusDefinition): Promise<Subject> {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const subjects = await getSubjects();
  const existing = findSubjectForDefinition(subjects, definition);

  if (existing) {
    const { error } = await supabase
      .from("subjects")
      .update({
        short_name: definition.shortName,
        achieved_grade: definition.achievedGrade,
        target_grade: definition.targetGrade,
        active: true,
        updated_by: user.id,
      })
      .eq("id", existing.id)
      .eq("owner_id", user.id);
    if (error) throw new Error(error.message);
    return { ...existing, shortName: definition.shortName, active: true };
  }

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      owner_id: user.id,
      created_by: user.id,
      updated_by: user.id,
      name: definition.subjectName,
      short_name: definition.shortName,
      achieved_grade: definition.achievedGrade,
      target_grade: definition.targetGrade,
      active: true,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    name: data.name,
    shortName: data.short_name,
    achievedGrade: data.achieved_grade,
    targetGrade: data.target_grade,
    estimatedGrade: data.estimated_grade,
    latestMockGrade: data.latest_mock_grade,
    syllabusCompletion: data.syllabus_completion,
    active: data.active,
    studyHoursThisWeek: 0,
    weakTopicCount: 0,
    nextAction: "Load syllabus topics",
  };
}

function findSubjectForDefinition(subjects: Subject[], definition: SyllabusDefinition) {
  return subjects.find(
    (subject) => subject.name === definition.subjectName || subject.shortName === definition.shortName,
  );
}

async function getRawSyllabusTopics(subjectId: string) {
  const supabase = await getSupabaseForRead();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("syllabus_topics")
    .select("*")
    .eq("subject_id", subjectId)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return (data ?? []) as SyllabusTopicRow[];
}

async function getProgressRows(topicIds: string[], userId: string) {
  const supabase = await getSupabaseForRead();
  if (!supabase || topicIds.length === 0) return [];

  const { data, error } = await supabase
    .from("topic_progress")
    .select("*")
    .eq("owner_id", userId)
    .eq("is_deleted", false)
    .in("syllabus_topic_id", topicIds);

  if (error) throw new Error(error.message);
  return (data ?? []) as TopicProgressRow[];
}

async function getErrorStats(topicIds: string[]) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();
  const stats = new Map<string, { unresolvedErrors: number; marksLost: number }>();

  if (!supabase || topicIds.length === 0) return stats;

  const { data, error } = await supabase
    .from("exam_errors")
    .select("syllabus_topic_id, marks_lost, resolved")
    .eq("owner_id", user.id)
    .eq("is_deleted", false)
    .in("syllabus_topic_id", topicIds);

  if (error) throw new Error(error.message);

  for (const row of (data ?? []) as Array<{
    syllabus_topic_id: string | null;
    marks_lost: number | null;
    resolved: boolean;
  }>) {
    if (!row.syllabus_topic_id) continue;
    const current = stats.get(row.syllabus_topic_id) ?? { unresolvedErrors: 0, marksLost: 0 };
    if (!row.resolved) current.unresolvedErrors += 1;
    current.marksLost += row.marks_lost ?? 0;
    stats.set(row.syllabus_topic_id, current);
  }

  return stats;
}

function diagnosticStatus(percentage: number, confidence: number | null): TopicStatus {
  if (percentage >= 85 && (confidence == null || confidence >= 4)) return "Exam Ready";
  if (percentage < 60 || (confidence != null && confidence <= 2)) return "Practice Required";
  return "Revised";
}

function mapSyllabusTopic(row: SyllabusTopicRow): SyllabusTopic {
  return {
    id: row.id,
    subjectId: row.subject_id,
    parentTopicId: row.parent_topic_id,
    stableCode: row.stable_code,
    name: row.name,
    specificationCode: row.specification_code,
    specificationRef: row.specification_ref,
    paperCode: row.paper_code,
    paperName: row.paper_name,
    topicLevel: row.topic_level,
    sortOrder: row.sort_order,
    isOptional: row.is_optional,
    active: row.active,
  };
}

function mapTopicProgress(row: TopicProgressRow): TopicProgress {
  return {
    id: row.id,
    ownerId: row.owner_id,
    syllabusTopicId: row.syllabus_topic_id,
    status: row.status,
    confidence: row.confidence,
    accuracy: row.accuracy,
    priority: row.priority,
    lastRevised: row.last_revised,
    notes: row.notes,
    tutorFeedback: row.tutor_feedback,
    retestDate: row.retest_date,
    tutorFlag: row.tutor_flag,
  };
}

function mapDiagnostic(row: TopicDiagnosticRow): TopicDiagnostic {
  return {
    id: row.id,
    ownerId: row.owner_id,
    subjectId: row.subject_id,
    syllabusTopicId: row.syllabus_topic_id,
    diagnosticDate: row.diagnostic_date,
    questionsAttempted: row.questions_attempted,
    correct: row.correct,
    marksScored: row.marks_scored,
    marksAvailable: row.marks_available,
    percentage: row.percentage,
    confidenceBefore: row.confidence_before,
    confidenceAfter: row.confidence_after,
    notes: row.notes,
  };
}
