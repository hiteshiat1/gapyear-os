"use server";

import { revalidatePath } from "next/cache";
import { seedReferenceData } from "@/lib/repositories/reference-data";

export async function seedReferenceDataAction() {
  await seedReferenceData();
  revalidatePath("/onboarding");
  revalidatePath("/settings/reference-data");
}
