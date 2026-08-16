"use server";

import { revalidatePath } from "next/cache";
import {
  createDailyTask,
  createOrUpdateDailyPlan,
  generateDailyTasksForDate,
  generateWeeklyTasksFromDate,
  updateDailyTaskStatus,
} from "@/lib/repositories/daily-plans";
import type { PlanMode } from "@/lib/planner/generate-daily-plan";
import { dailyPlanSchema, dailyTaskSchema } from "@/lib/validation/schemas";

export async function saveDailyPlanAction(formData: FormData) {
  const parsed = dailyPlanSchema.parse({
    planDate: formData.get("planDate"),
    energy: formData.get("energy") || undefined,
    focus: formData.get("focus") || undefined,
    motivation: formData.get("motivation") || undefined,
    sleepHours: formData.get("sleepHours") || undefined,
    academicGoal: formData.get("academicGoal"),
    personalGoal: formData.get("personalGoal"),
  });

  await createOrUpdateDailyPlan(parsed);
  revalidatePath("/");
  revalidatePath("/today");
}

export async function createDailyTaskAction(formData: FormData) {
  const parsed = dailyTaskSchema.parse({
    dailyPlanId: formData.get("dailyPlanId"),
    subjectId: formData.get("subjectId"),
    task: formData.get("task"),
    category: formData.get("category"),
    topic: formData.get("topic"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    estimatedDuration: formData.get("estimatedDuration") || undefined,
    actualDuration: formData.get("actualDuration") || undefined,
    status: formData.get("status"),
  });

  await createDailyTask(parsed);
  revalidatePath("/");
  revalidatePath("/today");
}

export async function updateDailyTaskStatusAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  if (!id || !status) return;

  await updateDailyTaskStatus(id, status);
  revalidatePath("/");
  revalidatePath("/today");
}

export async function generateDailyPlanAction(formData: FormData) {
  const planDate = formData.get("planDate")?.toString();
  const mode = formData.get("mode")?.toString() as PlanMode | undefined;

  if (!planDate || !mode) return;

  await generateDailyTasksForDate(planDate, mode);
  revalidatePath("/");
  revalidatePath("/today");
}

export async function generateWeeklyPlanAction(formData: FormData) {
  const startDate = formData.get("startDate")?.toString();
  if (!startDate) return;

  await generateWeeklyTasksFromDate(startDate);
  revalidatePath("/");
  revalidatePath("/today");
}
