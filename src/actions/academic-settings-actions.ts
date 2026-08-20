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
