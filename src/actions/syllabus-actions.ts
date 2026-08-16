"use server";

import { revalidatePath } from "next/cache";
import {
  createTopicDiagnostic,
  resetAllTopicProgress,
  seedAllSyllabuses,
} from "@/lib/repositories/syllabus";

export async function seedSyllabusesAction() {
  await seedAllSyllabuses();
  revalidatePath("/");
  revalidatePath("/subjects");
  revalidatePath("/settings/syllabus");
}

export async function resetTopicProgressAction(formData: FormData) {
  const confirmation = formData.get("confirmation")?.toString();
  if (confirmation !== "RESET PROGRESS") {
    throw new Error('Type "RESET PROGRESS" to reset topic progress.');
  }

  await resetAllTopicProgress();
  revalidatePath("/");
  revalidatePath("/settings/syllabus");
}

export async function createTopicDiagnosticAction(formData: FormData) {
  const subjectId = formData.get("subjectId")?.toString();
  const syllabusTopicId = formData.get("syllabusTopicId")?.toString();
  const marksScored = Number(formData.get("marksScored"));
  const marksAvailable = Number(formData.get("marksAvailable"));

  if (!subjectId || !syllabusTopicId || !Number.isFinite(marksScored) || !Number.isFinite(marksAvailable)) {
    return;
  }

  await createTopicDiagnostic({
    subjectId,
    syllabusTopicId,
    diagnosticDate: formData.get("diagnosticDate")?.toString() || undefined,
    questionsAttempted: optionalNumber(formData.get("questionsAttempted")),
    correct: optionalNumber(formData.get("correct")),
    marksScored,
    marksAvailable,
    confidenceBefore: optionalNumber(formData.get("confidenceBefore")),
    confidenceAfter: optionalNumber(formData.get("confidenceAfter")),
    notes: formData.get("notes")?.toString() || null,
  });

  revalidatePath(`/topics/${syllabusTopicId}`);
  revalidatePath("/settings/syllabus");
  revalidatePath("/today");
}

function optionalNumber(value: FormDataEntryValue | null) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
