import type { Subject } from "@/types/domain";
import { getSupabaseForRead, requireUser } from "./common";
import { getSubjects } from "./subjects";

export type StudentStage = "Year 12" | "Year 13" | "Resit-Gap Year";

export type StudentOnboardingProfile = {
  id: string;
  ownerId: string;
  firstName: string | null;
  schoolCollege: string | null;
  stage: StudentStage;
  weekdayStudyHours: number | null;
  weekendStudyHours: number | null;
  lighterDays: string[];
  tutors: string | null;
  nextAssessments: string | null;
  visualTone: VisualTone;
  onboardingStep: number;
  onboardingCompleted: boolean;
};

export type VisualTone = "masculine" | "feminine";

export type OnboardingSubjectInput = {
  name: string;
  referenceSubjectId?: string | null;
  examBoardId?: string | null;
  specificationId?: string | null;
  selectedOptionIds?: string[];
  confirmationStatus?: "confirmed" | "needs_confirmation";
  topicSupportStatus?: "full" | "coming_soon" | "not_planned";
  examBoard?: string | null;
  specificationCode?: string | null;
  specificationOptions?: string | null;
  achievedGrade?: string | null;
  targetGrade?: string | null;
  schoolPredictedGrade?: string | null;
};

export async function getStudentOnboardingProfile() {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    ownerId: data.owner_id,
    firstName: data.first_name,
    schoolCollege: data.school_college,
    stage: data.stage as StudentStage,
    weekdayStudyHours: data.weekday_study_hours,
    weekendStudyHours: data.weekend_study_hours,
    lighterDays: data.lighter_days ?? [],
    tutors: data.tutors,
    nextAssessments: data.next_assessments,
    visualTone: data.visual_tone === "feminine" ? "feminine" : "masculine",
    onboardingStep: data.onboarding_step,
    onboardingCompleted: data.onboarding_completed,
  } satisfies StudentOnboardingProfile;
}

export async function saveCanonicalOnboardingSubjects(inputs: OnboardingSubjectInput[]) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  await saveOnboardingSubjects(inputs);

  for (const input of inputs.filter((subject) => subject.referenceSubjectId)) {
    const subjectId = input.referenceSubjectId;
    if (!subjectId) continue;
    const { data: studentSubject, error } = await supabase
      .from("student_subjects")
      .upsert(
        {
          owner_id: user.id,
          subject_id: subjectId,
          exam_board_id: input.examBoardId ?? null,
          specification_id: input.specificationId ?? null,
          self_grade: normalizeGrade(input.achievedGrade),
          school_predicted_grade: normalizeGrade(input.schoolPredictedGrade),
          target_grade: normalizeGrade(input.targetGrade),
          specification_confirmation_status: input.confirmationStatus ?? "needs_confirmation",
          topic_support_status: input.topicSupportStatus ?? "coming_soon",
          active: true,
          is_deleted: false,
        },
        { onConflict: "owner_id,subject_id" },
      )
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    const historyRows = [
      { grade_type: "self_estimate", grade: normalizeGrade(input.achievedGrade) },
      { grade_type: "school_prediction", grade: normalizeGrade(input.schoolPredictedGrade) },
    ].filter((row) => row.grade);

    if (historyRows.length) {
      const { error: historyError } = await supabase.from("grade_history").insert(
        historyRows.map((row) => ({
          owner_id: user.id,
          student_subject_id: studentSubject.id,
          grade_type: row.grade_type,
          grade: row.grade,
          source: "onboarding",
        })),
      );
      if (historyError) throw new Error(historyError.message);
    }

    await supabase
      .from("student_specification_options")
      .delete()
      .eq("owner_id", user.id)
      .eq("student_subject_id", studentSubject.id);

    if (input.selectedOptionIds?.length) {
      const { error: optionError } = await supabase.from("student_specification_options").insert(
        input.selectedOptionIds.map((optionId) => ({
          owner_id: user.id,
          student_subject_id: studentSubject.id,
          specification_option_id: optionId,
        })),
      );
      if (optionError) throw new Error(optionError.message);
    }
  }
}

export async function saveStudyAvailability(input: {
  weekdayDefaultMinutes?: number | null;
  weekendDefaultMinutes?: number | null;
  lighterDays: string[];
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("study_availability").upsert(
    {
      owner_id: user.id,
      weekday_default_minutes: input.weekdayDefaultMinutes ?? null,
      weekend_default_minutes: input.weekendDefaultMinutes ?? null,
      lighter_days: input.lighterDays,
    },
    { onConflict: "owner_id" },
  );

  if (error) throw new Error(error.message);
}

export async function upsertStudentOnboardingProfile(input: {
  firstName?: string | null;
  schoolCollege?: string | null;
  stage?: StudentStage;
  weekdayStudyHours?: number | null;
  weekendStudyHours?: number | null;
  lighterDays?: string[];
  tutors?: string | null;
  nextAssessments?: string | null;
  visualTone?: VisualTone;
  onboardingStep?: number;
  onboardingCompleted?: boolean;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("student_profiles").upsert(
    {
      owner_id: user.id,
      first_name: input.firstName ?? null,
      school_college: input.schoolCollege ?? null,
      stage: input.stage ?? "Year 12",
      weekday_study_hours: input.weekdayStudyHours ?? null,
      weekend_study_hours: input.weekendStudyHours ?? null,
      lighter_days: input.lighterDays ?? [],
      tutors: input.tutors ?? null,
      next_assessments: input.nextAssessments ?? null,
      visual_tone: input.visualTone ?? "masculine",
      onboarding_step: input.onboardingStep ?? 1,
      onboarding_completed: input.onboardingCompleted ?? false,
    },
    { onConflict: "owner_id" },
  );

  if (error) throw new Error(error.message);
}

export async function updateStudentProfileSettings(input: {
  firstName?: string | null;
  schoolCollege?: string | null;
  visualTone: VisualTone;
}) {
  const existing = await getStudentOnboardingProfile().catch(() => null);

  await upsertStudentOnboardingProfile({
    firstName: input.firstName ?? existing?.firstName ?? null,
    schoolCollege: input.schoolCollege ?? existing?.schoolCollege ?? null,
    stage: existing?.stage ?? "Year 12",
    weekdayStudyHours: existing?.weekdayStudyHours ?? null,
    weekendStudyHours: existing?.weekendStudyHours ?? null,
    lighterDays: existing?.lighterDays ?? [],
    tutors: existing?.tutors ?? null,
    nextAssessments: existing?.nextAssessments ?? null,
    visualTone: input.visualTone,
    onboardingStep: existing?.onboardingStep ?? 1,
    onboardingCompleted: existing?.onboardingCompleted ?? false,
  });
}

export async function saveOnboardingSubjects(inputs: OnboardingSubjectInput[]) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const existingSubjects = await getSubjects();
  const byName = new Map(existingSubjects.map((subject) => [subject.name.toLowerCase(), subject]));

  for (const input of inputs.filter((subject) => subject.name.trim())) {
    const subject = byName.get(input.name.trim().toLowerCase());
    const payload = {
      owner_id: user.id,
      created_by: user.id,
      updated_by: user.id,
      name: input.name.trim(),
      short_name: shortNameForSubject(input.name),
      exam_board: input.examBoard || "Not sure",
      specification_code: input.specificationCode || "Not sure",
      specification_options: input.specificationOptions || null,
      achieved_grade: input.achievedGrade || null,
      target_grade: input.targetGrade || null,
      school_predicted_grade: input.schoolPredictedGrade || null,
      active: true,
      is_deleted: false,
    };

    if (subject) {
      const { error } = await supabase
        .from("subjects")
        .update(payload)
        .eq("id", subject.id)
        .eq("owner_id", user.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("subjects").insert(payload);
      if (error) throw new Error(error.message);
    }
  }
}

export type OnboardingSelectedSubject = {
  id: string;
  subjectName: string;
  boardName: string | null;
  specificationCode: string | null;
  specificationName: string | null;
  selfGrade: string | null;
  schoolPredictedGrade: string | null;
  targetGrade: string | null;
  confirmationStatus: "confirmed" | "needs_confirmation";
  topicSupportStatus: "full" | "coming_soon" | "not_planned";
  progressPercent: number | null;
};

export async function getMyOnboardingSubjects(): Promise<OnboardingSelectedSubject[]> {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("student_subjects")
    .select(
      "id,self_grade,school_predicted_grade,target_grade,specification_confirmation_status,topic_support_status,a_level_subjects(name),exam_boards(name),specifications(specification_code,specification_name)",
    )
    .eq("owner_id", user.id)
    .eq("active", true)
    .eq("is_deleted", false)
    .order("created_at");

  if (error) {
    console.error("getMyOnboardingSubjects failed", error.message);
    return [];
  }

  type Row = {
    id: string;
    self_grade: string | null;
    school_predicted_grade: string | null;
    target_grade: string | null;
    specification_confirmation_status: "confirmed" | "needs_confirmation";
    topic_support_status: "full" | "coming_soon" | "not_planned";
    a_level_subjects: { name: string } | { name: string }[] | null;
    exam_boards: { name: string } | { name: string }[] | null;
    specifications: { specification_code: string; specification_name: string } | { specification_code: string; specification_name: string }[] | null;
  };

  const rows = (data ?? []) as Row[];
  const legacySubjects = await getSubjects();
  const progressBySubjectName = new Map(
    legacySubjects.map((subject) => [subject.name.trim().toLowerCase(), subject.syllabusCompletion]),
  );

  return rows.map((row) => {
    const subject = one(row.a_level_subjects);
    const board = one(row.exam_boards);
    const specification = one(row.specifications);
    const subjectName = subject?.name ?? "Unknown subject";

    return {
      id: row.id,
      subjectName,
      boardName: board?.name ?? null,
      specificationCode: specification?.specification_code ?? null,
      specificationName: specification?.specification_name ?? null,
      selfGrade: row.self_grade,
      schoolPredictedGrade: row.school_predicted_grade,
      targetGrade: row.target_grade,
      confirmationStatus: row.specification_confirmation_status,
      topicSupportStatus: row.topic_support_status,
      progressPercent: progressBySubjectName.get(subjectName.trim().toLowerCase()) ?? null,
    };
  });
}

function one<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function onboardingSummary(profile: StudentOnboardingProfile | null, subjects: Subject[]) {
  if (!profile) return "Start onboarding";
  if (!profile.onboardingCompleted) return `Resume step ${profile.onboardingStep}`;
  return `${profile.stage} · ${subjects.length} subject${subjects.length === 1 ? "" : "s"}`;
}

function shortNameForSubject(name: string) {
  const normalized = name.trim();
  const known: Record<string, string> = {
    mathematics: "Maths",
    maths: "Maths",
    "further mathematics": "FM",
    physics: "Physics",
    chemistry: "Chem",
    biology: "Bio",
    economics: "Econ",
  };

  return known[normalized.toLowerCase()] ?? normalized.slice(0, 12);
}

function normalizeGrade(value?: string | null) {
  if (!value || value === "Not sure" || value === "Not provided yet") return null;
  return value;
}
