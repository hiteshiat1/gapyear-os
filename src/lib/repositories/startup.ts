import type { StartupExperience, StartupProblem } from "@/types/domain";
import { getSupabaseForRead, requireUser } from "./common";

export async function getStartupExperiences(): Promise<StartupExperience[]> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("startup_experiences")
    .select("*")
    .eq("is_deleted", false)
    .order("starts_on", { ascending: false });

  if (error) {
    console.error("getStartupExperiences failed", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    company: row.company,
    mentor: row.mentor,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    department: row.department,
    objectives: row.objectives,
  }));
}

export async function getStartupProblems(): Promise<StartupProblem[]> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("startup_problems")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getStartupProblems failed", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    startupExperienceId: row.startup_experience_id,
    problem: row.problem,
    whoExperiencesIt: row.who_experiences_it,
    frequency: row.frequency,
    impact: row.impact,
    existingSolution: row.existing_solution,
    possibleImprovement: row.possible_improvement,
    status: row.status,
  }));
}

export async function createStartupExperience(input: {
  company?: string | null;
  mentor?: string | null;
  startsOn?: string | null;
  endsOn?: string | null;
  department?: string | null;
  objectives?: string | null;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("startup_experiences").insert({
    owner_id: user.id,
    created_by: user.id,
    updated_by: user.id,
    company: input.company ?? null,
    mentor: input.mentor ?? null,
    starts_on: input.startsOn ?? null,
    ends_on: input.endsOn ?? null,
    department: input.department ?? null,
    objectives: input.objectives ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function createStartupProblem(input: {
  startupExperienceId: string;
  problem: string;
  whoExperiencesIt?: string | null;
  frequency?: string | null;
  impact?: string | null;
  existingSolution?: string | null;
  possibleImprovement?: string | null;
  status?: string | null;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("startup_problems").insert({
    owner_id: user.id,
    created_by: user.id,
    updated_by: user.id,
    startup_experience_id: input.startupExperienceId,
    problem: input.problem,
    who_experiences_it: input.whoExperiencesIt ?? null,
    frequency: input.frequency ?? null,
    impact: input.impact ?? null,
    existing_solution: input.existingSolution ?? null,
    possible_improvement: input.possibleImprovement ?? null,
    status: input.status ?? "Discovered",
  });

  if (error) throw new Error(error.message);
}
