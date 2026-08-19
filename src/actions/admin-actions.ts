"use server";

import { revalidatePath } from "next/cache";
import { updateUserRole, type AssignableRole } from "@/lib/repositories/profiles";

export async function updateUserRoleAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as AssignableRole;

  if (!userId || !role) throw new Error("Missing user or role.");

  await updateUserRole(userId, role);
  revalidatePath("/admin");
}
