"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateWeeklyTasksFromDate } from "@/lib/repositories/daily-plans";
import {
  saveCanonicalOnboardingSubjects,
  saveStudyAvailability,
  type OnboardingSubjectInput,
  upsertStudentOnboardingProfile,
  type StudentStage,
} from "@/lib/repositories/onboarding";
import {
  getBoardOfferings,
  getGradeOptions,
  getReferenceSpecifications,
  getReferenceSubjects,
} from "@/lib/repositories/reference-data";
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
    weekdayStudyHours: optionalHours(formData.get("weekdayDefaultMinutes")),
    weekendStudyHours: optionalHours(formData.get("weekendDefaultMinutes")),
    lighterDays,
    tutors: formData.get("tutors")?.toString() || null,
    nextAssessments: formData.get("nextAssessments")?.toString() || null,
    visualTone: formData.get("visualTone") === "feminine" ? "feminine" : "masculine",
    onboardingStep: 3,
    onboardingCompleted: true,
  });

  const subjects = [0, 1, 2, 3, 4].map((index) => subjectFromForm(formData, index));
  await validateOnboardingSubjects(subjects);
  await saveCanonicalOnboardingSubjects(subjects);
  await saveStudyAvailability({
    weekdayDefaultMinutes: optionalNumber(formData.get("weekdayDefaultMinutes")),
    weekendDefaultMinutes: optionalNumber(formData.get("weekendDefaultMinutes")),
    lighterDays,
  });
  const selectedSubjectNames = subjects.filter((subject) => subject.referenceSubjectId).map((subject) => subject.name);
  await seedAllSyllabuses(selectedSubjectNames);
  await generateWeeklyTasksFromDate(todayIso());

  revalidatePath("/");
  revalidatePath("/onboarding");
  revalidatePath("/subjects");
  revalidatePath("/settings/syllabus");
  revalidatePath("/today");
  redirect("/");
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

async function validateOnboardingSubjects(subjects: ReturnType<typeof subjectFromForm>[]) {
  const selected = subjects.filter((subject) => subject.referenceSubjectId);
  if (selected.length === 0) {
    throw new Error("Select at least one A-Level subject.");
  }

  const duplicateSubject = selected.find((subject, index) =>
    selected.some((item, itemIndex) => itemIndex !== index && item.referenceSubjectId === subject.referenceSubjectId),
  );
  if (duplicateSubject) {
    throw new Error("Duplicate subject selection is not allowed.");
  }

  const [referenceSubjects, offerings, specifications, grades] = await Promise.all([
    getReferenceSubjects(),
    getBoardOfferings(),
    getReferenceSpecifications(),
    getGradeOptions(),
  ]);
  const subjectIds = new Set(referenceSubjects.map((subject) => subject.id));
  const validGrades = new Set(["", "Not sure", "Not provided yet", ...grades.map((grade) => grade.grade)]);
  const targetGrades = new Set(["", "Not sure", ...grades.filter((grade) => grade.isTargetSelectable).map((grade) => grade.grade)]);

  for (const subject of selected) {
    if (!subject.referenceSubjectId || !subjectIds.has(subject.referenceSubjectId)) {
      throw new Error("Invalid subject selection.");
    }

    if (subject.examBoardId) {
      const validOffering = offerings.some(
        (offering) => offering.subjectId === subject.referenceSubjectId && offering.id === subject.examBoardId,
      );
      if (!validOffering) throw new Error("Invalid exam-board selection for subject.");
    }

    if (subject.specificationId) {
      const validSpecification = specifications.some(
        (spec) =>
          spec.id === subject.specificationId &&
          spec.subjectId === subject.referenceSubjectId &&
          (!subject.examBoardId || spec.examBoardId === subject.examBoardId),
      );
      if (!validSpecification) throw new Error("Invalid specification selection.");
    }

    if (!validGrades.has(subject.achievedGrade ?? "")) throw new Error("Invalid self-grade value.");
    if (!validGrades.has(subject.schoolPredictedGrade ?? "")) throw new Error("Invalid school-predicted grade value.");
    if (!targetGrades.has(subject.targetGrade ?? "")) throw new Error("Invalid target-grade value.");
  }
}
