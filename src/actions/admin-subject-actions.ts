"use server";

import { revalidatePath } from "next/cache";
import { provisionSubject, setSubjectSelectable } from "@/lib/repositories/reference-data";
import { requireAdmin } from "@/lib/repositories/profiles";

export async function enableSubjectAction(formData: FormData) {
  await requireAdmin();
  const subjectId = String(formData.get("subjectId") ?? "");
  if (!subjectId) throw new Error("Missing subject.");

  const result = await provisionSubject(subjectId);
  if (!result.selectable) {
    throw new Error(
      `Could not enable ${result.subjectName}: neither AQA nor Edexcel provisioned successfully. Check /admin/subjects for details.`,
    );
  }
  revalidatePath("/admin/subjects");
  revalidatePath("/admin/syllabuses");
  revalidatePath("/admin");
}

export async function disableSubjectAction(formData: FormData) {
  await requireAdmin();
  const subjectId = String(formData.get("subjectId") ?? "");
  if (!subjectId) throw new Error("Missing subject.");

  await setSubjectSelectable(subjectId, false);
  revalidatePath("/admin/subjects");
  revalidatePath("/admin");
}

export async function reprovisionSubjectAction(formData: FormData) {
  await requireAdmin();
  const subjectId = String(formData.get("subjectId") ?? "");
  if (!subjectId) throw new Error("Missing subject.");

  await provisionSubject(subjectId);
  revalidatePath("/admin/subjects");
  revalidatePath("/admin/syllabuses");
}
