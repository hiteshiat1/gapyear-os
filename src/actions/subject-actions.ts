"use server";

import { revalidatePath } from "next/cache";
import { createSubject, createTopic, softDeleteSubject, softDeleteTopic, updateSubject } from "@/lib/repositories/subjects";
import { subjectSchema, topicSchema } from "@/lib/validation/schemas";

export async function saveSubjectAction(formData: FormData) {
  const parsed = subjectSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    name: formData.get("name"),
    shortName: formData.get("shortName"),
    achievedGrade: formData.get("achievedGrade"),
    targetGrade: formData.get("targetGrade"),
    active: formData.get("active") === "on",
  });

  if (parsed.id) {
    await updateSubject(parsed.id, parsed);
  } else {
    await createSubject(parsed);
  }

  revalidatePath("/");
  revalidatePath("/subjects");
}

export async function deleteSubjectAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;

  await softDeleteSubject(id);
  revalidatePath("/");
  revalidatePath("/subjects");
}

export async function createTopicAction(formData: FormData) {
  const parsed = topicSchema.parse({
    subjectId: formData.get("subjectId"),
    name: formData.get("name"),
    status: formData.get("status"),
    confidence: formData.get("confidence") || undefined,
    accuracy: formData.get("accuracy") || undefined,
    priority: formData.get("priority"),
    notes: formData.get("notes"),
  });

  await createTopic(parsed);
  revalidatePath("/");
  revalidatePath("/subjects");
}

export async function deleteTopicAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;

  await softDeleteTopic(id);
  revalidatePath("/");
  revalidatePath("/subjects");
}
