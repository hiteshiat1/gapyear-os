import { exams as mockExams } from "@/lib/data";
import { useMockData } from "@/lib/supabase/config";
import type { Exam } from "@/types/domain";
import { examPercentage } from "@/lib/analytics/calculations";
import { getSupabaseForRead, requireUser } from "./common";
import { mapExam } from "./mappers";

function mockExam(exam: (typeof mockExams)[number]): Exam {
  return {
    id: exam.id,
    subjectId: exam.subjectId,
    paperCode: null,
    paperSection: null,
    examType: "Mock",
    examBoard: null,
    paper: exam.paper,
    paperYear: null,
    completedOn: exam.date,
    durationMinutes: null,
    timed: true,
    rawMarks: exam.rawMarks,
    maxMarks: exam.maxMarks,
    percentage: examPercentage(exam),
    grade: exam.grade,
    targetGrade: exam.targetGrade,
    nextBoundary: exam.nextBoundary,
    targetBoundary: exam.targetBoundary,
    timeRemainingMinutes: null,
    cycleStatus: exam.cycleStatus,
    notes: null,
  };
}

export async function getExams() {
  const supabase = await getSupabaseForRead();

  if (!supabase) {
    return useMockData ? mockExams.map(mockExam) : [];
  }

  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("is_deleted", false)
    .order("completed_on", { ascending: false });

  if (error) {
    console.error("getExams failed", error.message);
    return [];
  }

  return data.map(mapExam);
}

export async function createExam(input: {
  subjectId: string;
  paperCode?: string | null;
  paperSection?: string | null;
  examType: string;
  examBoard?: string | null;
  paper: string;
  paperYear?: string | null;
  completedOn: string;
  durationMinutes?: number | null;
  timed: boolean;
  rawMarks: number;
  maxMarks: number;
  grade?: string | null;
  targetGrade?: string | null;
  nextBoundary?: number | null;
  targetBoundary?: number | null;
  timeRemainingMinutes?: number | null;
  cycleStatus: string;
  notes?: string | null;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("exams").insert({
    owner_id: user.id,
    created_by: user.id,
    updated_by: user.id,
    subject_id: input.subjectId,
    paper_code: input.paperCode ?? null,
    paper_section: input.paperSection ?? null,
    exam_type: input.examType,
    exam_board: input.examBoard ?? null,
    paper: input.paper,
    paper_year: input.paperYear ?? null,
    completed_on: input.completedOn,
    duration_minutes: input.durationMinutes ?? null,
    timed: input.timed,
    raw_marks: input.rawMarks,
    max_marks: input.maxMarks,
    grade: input.grade ?? null,
    target_grade: input.targetGrade ?? null,
    next_boundary: input.nextBoundary ?? null,
    target_boundary: input.targetBoundary ?? null,
    time_remaining_minutes: input.timeRemainingMinutes ?? null,
    cycle_status: input.cycleStatus,
    notes: input.notes ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function softDeleteExam(id: string) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("exams")
    .update({ is_deleted: true, updated_by: user.id })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}
