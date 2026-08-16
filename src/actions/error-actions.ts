"use server";

import { revalidatePath } from "next/cache";
import { createExamError, resolveExamError } from "@/lib/repositories/errors";
import { errorSchema } from "@/lib/validation/schemas";

export async function createErrorAction(formData: FormData) {
  const parsed = errorSchema.parse({
    examId: formData.get("examId"),
    subjectId: formData.get("subjectId"),
    topicId: formData.get("topicId"),
    syllabusTopicId: formData.get("syllabusTopicId"),
    topicName: formData.get("topicName"),
    paperName: formData.get("paperName"),
    errorDate: formData.get("errorDate"),
    questionNumber: formData.get("questionNumber"),
    marksAvailable: formData.get("marksAvailable") || undefined,
    marksLost: formData.get("marksLost"),
    category: formData.get("category"),
    description: formData.get("description"),
    correctApproach: formData.get("correctApproach"),
    lessonLearned: formData.get("lessonLearned"),
    correctiveAction: formData.get("correctiveAction"),
    retestDate: formData.get("retestDate"),
  });

  await createExamError(parsed);
  revalidatePath("/");
  revalidatePath("/errors");
  revalidatePath("/analytics");
}

export async function resolveErrorAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const retestResult = formData.get("retestResult")?.toString() || null;
  if (!id) return;

  await resolveExamError(id, retestResult);
  revalidatePath("/");
  revalidatePath("/errors");
  revalidatePath("/analytics");
}
