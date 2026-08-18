"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateWeeklyTasksFromDate } from "@/lib/repositories/daily-plans";
import {
  saveOnboardingSubjects,
  upsertStudentOnboardingProfile,
  type StudentStage,
} from "@/lib/repositories/onboarding";
import { seedAllSyllabuses } from "@/lib/repositories/syllabus";
import { todayIso } from "@/lib/repositories/common";

export async function saveOnboardingAction(formData: FormData) {
  const firstName = formData.get("firstName")?.toString() || null;
  const schoolCollege = formData.get("schoolCollege")?.toString() || null;
  const stage = (formData.get("stage")?.toString() || "Year 12") as StudentStage;
  const lighterDays = formData.getAll("lighterDays").map(String);

  await upsertStudentOnboardingProfile({
    firstName,
    schoolCollege,
    stage,
    weekdayStudyHours: optionalNumber(formData.get("weekdayStudyHours")),
    weekendStudyHours: optionalNumber(formData.get("weekendStudyHours")),
    lighterDays,
    tutors: formData.get("tutors")?.toString() || null,
    nextAssessments: formData.get("nextAssessments")?.toString() || null,
    visualTone: formData.get("visualTone") === "feminine" ? "feminine" : "masculine",
    onboardingStep: 3,
    onboardingCompleted: true,
  });

  await saveOnboardingSubjects([0, 1, 2, 3].map((index) => subjectFromForm(formData, index)));
  await seedAllSyllabuses();
  await generateWeeklyTasksFromDate(todayIso());

  revalidatePath("/");
  revalidatePath("/onboarding");
  revalidatePath("/subjects");
  revalidatePath("/settings/syllabus");
  revalidatePath("/today");
  redirect("/");
}

function subjectFromForm(formData: FormData, index: number) {
  return {
    name: formData.get(`subject_${index}_name`)?.toString() || "",
    examBoard: formData.get(`subject_${index}_examBoard`)?.toString() || "Not sure",
    specificationCode: formData.get(`subject_${index}_specificationCode`)?.toString() || "Not sure",
    specificationOptions: formData.get(`subject_${index}_specificationOptions`)?.toString() || null,
    achievedGrade: formData.get(`subject_${index}_achievedGrade`)?.toString() || null,
    targetGrade: formData.get(`subject_${index}_targetGrade`)?.toString() || null,
    schoolPredictedGrade: formData.get(`subject_${index}_schoolPredictedGrade`)?.toString() || null,
  };
}

function optionalNumber(value: FormDataEntryValue | null) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
