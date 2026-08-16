import { dailyTasks as mockTasks } from "@/lib/data";
import { generateDailyPlan, generateWeeklyPlan, type GeneratedTask, type PlanMode } from "@/lib/planner/generate-daily-plan";
import { useMockData } from "@/lib/supabase/config";
import type { DailyPlan, DailyTask } from "@/types/domain";
import { getSupabaseForRead, requireUser, todayIso } from "./common";
import { mapDailyPlan, mapDailyTask } from "./mappers";
import { getSubjects } from "./subjects";
import { getBlockedPapersForPlanner, getSyllabusTopicsWithProgress } from "./syllabus";

function mockTask(task: (typeof mockTasks)[number]): DailyTask {
  return {
    id: task.id,
    dailyPlanId: "mock-plan",
    subjectId: task.subjectId ?? null,
    syllabusTopicId: null,
    task: task.task,
    category: task.category,
    topic: task.topic,
    startsAt: task.time.split("-")[0] ?? null,
    endsAt: task.time.split("-")[1] ?? null,
    estimatedDuration: task.plannedHours,
    actualDuration: task.actualHours,
    status: task.status,
    reason: null,
    priorityScore: null,
    source: null,
    difficulty: task.difficulty,
    confidenceBefore: task.confidenceBefore,
    confidenceAfter: task.confidenceAfter,
    notes: null,
  };
}

export async function getDailyPlan(date = todayIso()): Promise<DailyPlan | null> {
  const supabase = await getSupabaseForRead();

  if (!supabase) {
    return useMockData
      ? {
          id: "mock-plan",
          planDate: date,
          energy: 4,
          focus: 3,
          motivation: 4,
          sleepHours: 7.5,
          academicGoal: "Make Electric Fields less fragile",
          personalGoal: "Document current sensor options",
          totalFocusedHours: null,
          eveningReflection: null,
          tasks: mockTasks.map(mockTask),
        }
      : null;
  }

  const { data: plan, error } = await supabase
    .from("daily_plans")
    .select("*")
    .eq("plan_date", date)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) {
    console.error("getDailyPlan failed", error.message);
    return null;
  }

  if (!plan) {
    return null;
  }

  const { data: tasks, error: taskError } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("daily_plan_id", plan.id)
    .eq("is_deleted", false)
    .order("starts_at");

  if (taskError) {
    console.error("getDailyPlan tasks failed", taskError.message);
  }

  return mapDailyPlan(plan, (tasks ?? []).map(mapDailyTask));
}

export async function createOrUpdateDailyPlan(input: {
  planDate: string;
  energy?: number | null;
  focus?: number | null;
  motivation?: number | null;
  sleepHours?: number | null;
  academicGoal?: string | null;
  personalGoal?: string | null;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("daily_plans").upsert(
    {
      owner_id: user.id,
      updated_by: user.id,
      created_by: user.id,
      plan_date: input.planDate,
      energy: input.energy ?? null,
      focus: input.focus ?? null,
      motivation: input.motivation ?? null,
      sleep_hours: input.sleepHours ?? null,
      academic_goal: input.academicGoal ?? null,
      personal_goal: input.personalGoal ?? null,
    },
    { onConflict: "owner_id,plan_date" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function createDailyTask(input: {
  dailyPlanId: string;
  subjectId?: string | null;
  syllabusTopicId?: string | null;
  task: string;
  category: string;
  topic?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  estimatedDuration?: number | null;
  actualDuration?: number | null;
  status: string;
  reason?: string | null;
  priorityScore?: number | null;
  source?: string | null;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("daily_tasks").insert({
    owner_id: user.id,
    created_by: user.id,
    updated_by: user.id,
    daily_plan_id: input.dailyPlanId,
    subject_id: input.subjectId ?? null,
    syllabus_topic_id: input.syllabusTopicId ?? null,
    task: input.task,
    category: input.category,
    topic: input.topic ?? null,
    starts_at: input.startsAt ?? null,
    ends_at: input.endsAt ?? null,
    estimated_duration: input.estimatedDuration ?? null,
    actual_duration: input.actualDuration ?? null,
    status: input.status,
    reason: input.reason ?? null,
    priority_score: input.priorityScore ?? null,
    source: input.source ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function generateDailyTasksForDate(date: string, mode: PlanMode) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  await createOrUpdateDailyPlan({ planDate: date });

  const { data: plan, error: planError } = await supabase
    .from("daily_plans")
    .select("id")
    .eq("owner_id", user.id)
    .eq("plan_date", date)
    .eq("is_deleted", false)
    .single();

  if (planError) throw new Error(planError.message);

  const subjects = await getSubjects();
  const topics = await getSyllabusTopicsWithProgress();
  const blockedPapers = await getBlockedPapersForPlanner();
  const generatedTasks = generateDailyPlan({
    mode,
    subjects,
    topics,
    blockedPapers,
  });

  const { error: cleanupError } = await supabase
    .from("daily_tasks")
    .update({ is_deleted: true, updated_by: user.id })
    .eq("owner_id", user.id)
    .eq("daily_plan_id", plan.id)
    .eq("status", "Planned")
    .in("source", ["adaptive-planner", "mock-followup"]);

  if (cleanupError) throw new Error(cleanupError.message);

  await insertGeneratedTasks(plan.id, generatedTasks, user.id);

  return generatedTasks.length;
}

export async function generateWeeklyTasksFromDate(startDate: string) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const subjects = await getSubjects();
  const topics = await getSyllabusTopicsWithProgress();
  const blockedPapers = await getBlockedPapersForPlanner();
  const week = generateWeeklyPlan({ startDate, subjects, topics, blockedPapers });
  let inserted = 0;

  for (const day of week) {
    await createOrUpdateDailyPlan({ planDate: day.date });
    const { data: plan, error: planError } = await supabase
      .from("daily_plans")
      .select("id")
      .eq("owner_id", user.id)
      .eq("plan_date", day.date)
      .eq("is_deleted", false)
      .single();

    if (planError) throw new Error(planError.message);

    const { error: cleanupError } = await supabase
      .from("daily_tasks")
      .update({ is_deleted: true, updated_by: user.id })
      .eq("owner_id", user.id)
      .eq("daily_plan_id", plan.id)
      .eq("status", "Planned")
      .in("source", ["adaptive-planner", "mock-followup"]);

    if (cleanupError) throw new Error(cleanupError.message);

    await insertGeneratedTasks(plan.id, day.tasks, user.id);
    inserted += day.tasks.length;
  }

  return inserted;
}

async function insertGeneratedTasks(planId: string, tasks: GeneratedTask[], userId: string) {
  if (tasks.length === 0) return;

  const supabase = await getSupabaseForRead();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("daily_tasks").insert(
    tasks.map((task) => ({
      owner_id: userId,
      created_by: userId,
      updated_by: userId,
      daily_plan_id: planId,
      subject_id: task.subjectId,
      syllabus_topic_id: task.syllabusTopicId,
      task: task.task,
      category: task.category,
      topic: task.topic,
      estimated_duration: task.estimatedDuration,
      status: task.status,
      reason: task.reason,
      priority_score: task.priorityScore,
      source: task.source,
    })),
  );

  if (error) throw new Error(error.message);
}

export async function updateDailyTaskStatus(id: string, status: string) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("daily_tasks")
    .update({ status, updated_by: user.id })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}
