import { subjects as mockSubjects, topics as mockTopics } from "@/lib/data";
import { useMockData } from "@/lib/supabase/config";
import type { Subject, Topic } from "@/types/domain";
import { getSupabaseForRead, requireUser } from "./common";
import { mapSubject, mapTopic } from "./mappers";

function mockSubject(subject: (typeof mockSubjects)[number]): Subject {
  return {
    id: subject.id,
    name: subject.name,
    shortName: subject.shortName,
    examBoard: null,
    specificationCode: null,
    specificationOptions: null,
    achievedGrade: subject.currentGrade,
    targetGrade: subject.targetGrade,
    schoolPredictedGrade: null,
    estimatedGrade: subject.estimatedGrade,
    latestMockGrade: subject.latestMockGrade,
    syllabusCompletion: subject.syllabusCompletion,
    active: subject.active,
    studyHoursThisWeek: subject.studyHoursThisWeek,
    weakTopicCount: subject.weakTopicCount,
    nextAction: subject.nextAction,
  };
}

function mockTopic(topic: (typeof mockTopics)[number]): Topic {
  return {
    id: topic.id,
    subjectId: topic.subjectId,
    name: topic.name,
    status: topic.status,
    confidence: topic.confidence,
    accuracy: topic.accuracy,
    errorCount: topic.errors,
    lastRevised: topic.lastRevised,
    priority: topic.priority,
    notes: null,
    tutorFeedback: null,
  };
}

export async function getSubjects() {
  const supabase = await getSupabaseForRead();

  if (!supabase) {
    return useMockData ? mockSubjects.map(mockSubject) : [];
  }

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("is_deleted", false)
    .order("active", { ascending: false })
    .order("name");

  if (error) {
    console.error("getSubjects failed", error.message);
    return [];
  }

  return data.map(mapSubject);
}

export async function getTopics() {
  const supabase = await getSupabaseForRead();

  if (!supabase) {
    return useMockData ? mockTopics.map(mockTopic) : [];
  }

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("is_deleted", false)
    .order("priority", { ascending: true })
    .order("name");

  if (error) {
    console.error("getTopics failed", error.message);
    return [];
  }

  return data.map(mapTopic);
}

export async function createSubject(input: {
  name: string;
  shortName: string;
  examBoard?: string | null;
  specificationCode?: string | null;
  specificationOptions?: string | null;
  achievedGrade?: string | null;
  targetGrade?: string | null;
  schoolPredictedGrade?: string | null;
  active: boolean;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("subjects").insert({
    owner_id: user.id,
    created_by: user.id,
    updated_by: user.id,
    name: input.name,
    short_name: input.shortName,
    exam_board: input.examBoard ?? null,
    specification_code: input.specificationCode ?? null,
    specification_options: input.specificationOptions ?? null,
    achieved_grade: input.achievedGrade ?? null,
    target_grade: input.targetGrade ?? null,
    school_predicted_grade: input.schoolPredictedGrade ?? null,
    active: input.active,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSubject(
  id: string,
  input: {
    name: string;
    shortName: string;
    examBoard?: string | null;
    specificationCode?: string | null;
    specificationOptions?: string | null;
    achievedGrade?: string | null;
    targetGrade?: string | null;
    schoolPredictedGrade?: string | null;
    active: boolean;
  },
) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("subjects")
    .update({
      updated_by: user.id,
      name: input.name,
      short_name: input.shortName,
      exam_board: input.examBoard ?? null,
      specification_code: input.specificationCode ?? null,
      specification_options: input.specificationOptions ?? null,
      achieved_grade: input.achievedGrade ?? null,
      target_grade: input.targetGrade ?? null,
      school_predicted_grade: input.schoolPredictedGrade ?? null,
      active: input.active,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function softDeleteSubject(id: string) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("subjects")
    .update({ is_deleted: true, updated_by: user.id })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createTopic(input: {
  subjectId: string;
  name: string;
  status: string;
  confidence?: number | null;
  accuracy?: number | null;
  priority: string;
  notes?: string | null;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("topics").insert({
    owner_id: user.id,
    created_by: user.id,
    updated_by: user.id,
    subject_id: input.subjectId,
    name: input.name,
    status: input.status,
    confidence: input.confidence ?? null,
    accuracy: input.accuracy ?? null,
    priority: input.priority,
    notes: input.notes ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function softDeleteTopic(id: string) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("topics")
    .update({ is_deleted: true, updated_by: user.id })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}
