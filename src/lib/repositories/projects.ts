import { portfolioProjects } from "@/lib/data";
import { useMockData } from "@/lib/supabase/config";
import type { Project } from "@/types/domain";
import { getSupabaseForRead, requireUser } from "./common";
import { mapProject } from "./mappers";

function mockProject(project: (typeof portfolioProjects)[number], index: number): Project {
  return {
    id: `mock-project-${index}`,
    title: project.title,
    problem: project.problem,
    description: null,
    whyItMatters: null,
    technologies: project.tech.split(",").map((item) => item.trim()),
    engineeringConcepts: [],
    status: project.status,
    startedOn: null,
    endedOn: null,
    githubUrl: null,
    demoUrl: null,
    publishToPortfolio: false,
  };
}

export async function getProjects({ publicOnly = false } = {}) {
  const supabase = await getSupabaseForRead();

  if (!supabase) {
    return useMockData ? portfolioProjects.map(mockProject) : [];
  }

  let query = supabase.from("projects").select("*").eq("is_deleted", false).order("created_at");

  if (publicOnly) {
    query = query.eq("publish_to_portfolio", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getProjects failed", error.message);
    return [];
  }

  return data.map(mapProject);
}

export async function createProject(input: {
  title: string;
  problem?: string | null;
  description?: string | null;
  status: string;
  technologies?: string[];
  publishToPortfolio?: boolean;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("projects").insert({
    owner_id: user.id,
    created_by: user.id,
    updated_by: user.id,
    title: input.title,
    problem: input.problem ?? null,
    description: input.description ?? null,
    status: input.status,
    technologies: input.technologies ?? [],
    engineering_concepts: [],
    publish_to_portfolio: input.publishToPortfolio ?? false,
  });

  if (error) {
    throw new Error(error.message);
  }
}
