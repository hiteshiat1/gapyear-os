"use server";

import { revalidatePath } from "next/cache";
import { createExam, softDeleteExam } from "@/lib/repositories/exams";
import { examSchema } from "@/lib/validation/schemas";

export async function createExamAction(formData: FormData) {
  const parsed = examSchema.parse({
    subjectId: formData.get("subjectId"),
    examType: formData.get("examType"),
    examBoard: formData.get("examBoard"),
    paperCode: formData.get("paperCode"),
    paperSection: formData.get("paperSection"),
    paper: formData.get("paper"),
    paperYear: formData.get("paperYear"),
    completedOn: formData.get("completedOn"),
    durationMinutes: formData.get("durationMinutes") || undefined,
    timed: formData.get("timed") === "on",
    rawMarks: formData.get("rawMarks"),
    maxMarks: formData.get("maxMarks"),
    grade: formData.get("grade"),
    targetGrade: formData.get("targetGrade"),
    nextBoundary: formData.get("nextBoundary") || undefined,
    targetBoundary: formData.get("targetBoundary") || undefined,
    timeRemainingMinutes: formData.get("timeRemainingMinutes") || undefined,
    cycleStatus: formData.get("cycleStatus"),
    notes: formData.get("notes"),
  });

  await createExam(parsed);
  revalidatePath("/");
  revalidatePath("/tests");
  revalidatePath("/analytics");
}

export async function deleteExamAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;

  await softDeleteExam(id);
  revalidatePath("/");
  revalidatePath("/tests");
  revalidatePath("/analytics");
}
