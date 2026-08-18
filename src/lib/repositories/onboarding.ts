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
