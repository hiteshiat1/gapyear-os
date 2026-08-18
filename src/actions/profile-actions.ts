"use server";

import { revalidatePath } from "next/cache";
import { updateStudentProfileSettings } from "@/lib/repositories/onboarding";

export async function updateProfileSettingsAction(formData: FormData) {
  await updateStudentProfileSettings({
    firstName: formData.get("firstName")?.toString() || null,
    schoolCollege: formData.get("schoolCollege")?.toString() || null,
    visualTone: formData.get("visualTone") === "feminine" ? "feminine" : "masculine",
  });

  revalidatePath("/");
  revalidatePath("/settings/profile");
  revalidatePath("/onboarding");
}
