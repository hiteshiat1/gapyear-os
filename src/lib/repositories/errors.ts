import { errorEntries as mockErrors } from "@/lib/data";
import { useMockData } from "@/lib/supabase/config";
import type { ExamError } from "@/types/domain";
import { getSupabaseForRead, requireUser } from "./common";
import { mapExamError } from "./mappers";

function mockError(error: (typeof mockErrors)[number]): ExamError {
  return {
    id: error.id,
    examId: null,
    subjectId: error.subjectId,
    topicId: null,
    syllabusTopicId: null,
    topicName: error.topic,
    paperName: error.paper,
    errorDate: error.date,
    questionNumber: error.question,
    marksAvailable: null,
    marksLost: error.marksLost,
    category: error.category,
    description: null,
    correctApproach: null,
    lessonLearned: error.lesson,
    correctiveAction: null,
    retestDate: null,
    retestResult: null,
    resolved: error.resolved,
    resolvedAt: null,
  };
}

export async function getExamErrors() {
  const supabase = await getSupabaseForRead();

  if (!supabase) {
    return useMockData ? mockErrors.map(mockError) : [];
  }

  const { data, error } = await supabase
    .from("exam_errors")
    .select("*")
    .eq("is_deleted", false)
    .order("error_date", { ascending: false });

  if (error) {
    console.error("getExamErrors failed", error.message);
    return [];
  }

  return data.map(mapExamError);
}

export async function createExamError(input: {
  examId?: string | null;
  subjectId: string;
  topicId?: string | null;
  syllabusTopicId?: string | null;
  topicName?: string | null;
  paperName?: string | null;
  errorDate: string;
  questionNumber?: string | null;
  marksAvailable?: number | null;
  marksLost: number;
  category: string;
  description?: string | null;
  correctApproach?: string | null;
  lessonLearned?: string | null;
  correctiveAction?: string | null;
  retestDate?: string | null;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("exam_errors").insert({
    owner_id: user.id,
    created_by: user.id,
    updated_by: user.id,
    exam_id: input.examId ?? null,
    subject_id: input.subjectId,
    topic_id: input.topicId ?? null,
    syllabus_topic_id: input.syllabusTopicId ?? null,
    topic_name: input.topicName ?? null,
    paper_name: input.paperName ?? null,
    error_date: input.errorDate,
    question_number: input.questionNumber ?? null,
    marks_available: input.marksAvailable ?? null,
    marks_lost: input.marksLost,
    category: input.category,
    description: input.description ?? null,
    correct_approach: input.correctApproach ?? null,
    lesson_learned: input.lessonLearned ?? null,
    corrective_action: input.correctiveAction ?? null,
    retest_date: input.retestDate ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function resolveExamError(id: string, retestResult?: string | null) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("exam_errors")
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      retest_result: retestResult ?? null,
      updated_by: user.id,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}
