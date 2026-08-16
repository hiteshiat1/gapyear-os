"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createStartupExperience, createStartupProblem } from "@/lib/repositories/startup";

const optionalText = z.string().trim().optional().transform((value) => value || null);

const startupExperienceSchema = z.object({
  company: optionalText,
  mentor: optionalText,
  startsOn: optionalText,
  endsOn: optionalText,
  department: optionalText,
  objectives: optionalText,
});

const startupProblemSchema = z.object({
  startupExperienceId: z.string().min(1),
  problem: z.string().trim().min(1),
  whoExperiencesIt: optionalText,
  frequency: optionalText,
  impact: optionalText,
  existingSolution: optionalText,
  possibleImprovement: optionalText,
  status: optionalText,
});

export async function createStartupExperienceAction(formData: FormData) {
  const parsed = startupExperienceSchema.parse({
    company: formData.get("company"),
    mentor: formData.get("mentor"),
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn"),
    department: formData.get("department"),
    objectives: formData.get("objectives"),
  });

  await createStartupExperience(parsed);
  revalidatePath("/startup");
}

export async function createStartupProblemAction(formData: FormData) {
  const parsed = startupProblemSchema.parse({
    startupExperienceId: formData.get("startupExperienceId"),
    problem: formData.get("problem"),
    whoExperiencesIt: formData.get("whoExperiencesIt"),
    frequency: formData.get("frequency"),
    impact: formData.get("impact"),
    existingSolution: formData.get("existingSolution"),
    possibleImprovement: formData.get("possibleImprovement"),
    status: formData.get("status"),
  });

  await createStartupProblem(parsed);
  revalidatePath("/startup");
}
