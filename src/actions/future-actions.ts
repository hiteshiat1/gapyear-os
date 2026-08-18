"use server";

import { revalidatePath } from "next/cache";
import {
  createCourseInterest,
  createEvidenceLink,
  createUniversityChoice,
  saveCareerInterest,
  saveInterestProfile,
} from "@/lib/repositories/future";

export async function saveInterestProfileAction(formData: FormData) {
  await saveInterestProfile({
    broadInterests: formData.getAll("broadInterests").map(String),
    freeText: formData.get("freeText")?.toString() || null,
  });

  revalidateFuturePaths();
}

export async function createCourseInterestAction(formData: FormData) {
  const courseName = formData.get("courseName")?.toString();
  if (!courseName) return;

  await createCourseInterest({
    courseName,
    interestLevel: Number(formData.get("interestLevel") ?? 3),
    reason: formData.get("reason")?.toString() || null,
  });

  revalidateFuturePaths();
}

export async function createUniversityChoiceAction(formData: FormData) {
  const university = formData.get("university")?.toString();
  const course = formData.get("course")?.toString();
  if (!university || !course) return;

  await createUniversityChoice({
    university,
    course,
    entryYear: formData.get("entryYear")?.toString() || null,
    typicalEntryRequirements: formData.get("typicalEntryRequirements")?.toString() || null,
    requiredSubjects: formData.get("requiredSubjects")?.toString() || null,
    contextualRequirements: formData.get("contextualRequirements")?.toString() || null,
    admissionsTests: formData.get("admissionsTests")?.toString() || null,
    interestLevel: Number(formData.get("interestLevel") ?? 3),
    status: formData.get("status")?.toString() || "exploring",
    notes: formData.get("notes")?.toString() || null,
    sourceUrl: formData.get("sourceUrl")?.toString() || null,
    lastChecked: formData.get("lastChecked")?.toString() || null,
  });

  revalidateFuturePaths();
}

export async function saveCareerInterestAction(formData: FormData) {
  const careerFamilyId = formData.get("careerFamilyId")?.toString();
  if (!careerFamilyId) return;

  await saveCareerInterest({
    careerFamilyId,
    interestLevel: Number(formData.get("interestLevel") ?? 3),
    reason: formData.get("reason")?.toString() || null,
  });

  revalidateFuturePaths();
}

export async function createEvidenceLinkAction(formData: FormData) {
  const sourceType = formData.get("sourceType")?.toString();
  if (!sourceType) return;

  await createEvidenceLink({
    sourceType,
    sourceId: formData.get("sourceId")?.toString() || null,
    courseInterestId: formData.get("courseInterestId")?.toString() || null,
    universityChoiceId: formData.get("universityChoiceId")?.toString() || null,
    careerFamilyId: formData.get("careerFamilyId")?.toString() || null,
    skills: splitList(formData.get("skills")?.toString()),
    ucasCategory: formData.get("ucasCategory")?.toString() || null,
    reflectionStrength: formData.get("reflectionStrength")?.toString() || null,
  });

  revalidateFuturePaths();
  revalidatePath("/ucas-evidence");
}

function splitList(value?: string) {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

function revalidateFuturePaths() {
  revalidatePath("/explore");
  revalidatePath("/universities");
  revalidatePath("/careers");
  revalidatePath("/future-map");
}
