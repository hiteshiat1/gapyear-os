import { scoreTrend, weeklyStudy } from "@/lib/data";
import { useMockData } from "@/lib/supabase/config";
import { getSupabaseForRead } from "./common";

export async function getStudyChartData() {
  const supabase = await getSupabaseForRead();

  if (!supabase) {
    return useMockData ? weeklyStudy : [];
  }

  const { data, error } = await supabase
    .from("study_sessions")
    .select("session_date,duration_hours,subjects(short_name)")
    .eq("is_deleted", false)
    .order("session_date");

  if (error) {
    console.error("getStudyChartData failed", error.message);
    return [];
  }

  const rows = new Map<string, Record<string, string | number>>();
  for (const session of data as unknown as Array<{
    session_date: string;
    duration_hours: number;
    subjects?: { short_name?: string } | null;
  }>) {
    const day = new Date(session.session_date).toLocaleDateString("en-GB", { weekday: "short" });
    const subject = session.subjects?.short_name === "FM" ? "Further Maths" : session.subjects?.short_name ?? "Other";
    const row = rows.get(day) ?? { day };
    row[subject] = Number(row[subject] ?? 0) + session.duration_hours;
    rows.set(day, row);
  }

  return Array.from(rows.values()) as Array<{
    day: string;
    Physics?: number;
    Maths?: number;
    "Further Maths"?: number;
  }>;
}

export async function getScoreChartData() {
  const supabase = await getSupabaseForRead();

  if (!supabase) {
    return useMockData ? scoreTrend : [];
  }

  const { data, error } = await supabase
    .from("exams")
    .select("completed_on,percentage,subjects(short_name)")
    .eq("is_deleted", false)
    .order("completed_on");

  if (error) {
    console.error("getScoreChartData failed", error.message);
    return [];
  }

  const rows = new Map<string, Record<string, string | number>>();
  for (const exam of data as unknown as Array<{
    completed_on: string;
    percentage: number;
    subjects?: { short_name?: string } | null;
  }>) {
    const date = new Date(exam.completed_on).toLocaleDateString("en-GB", {
      month: "short",
      day: "2-digit",
    });
    const subject = exam.subjects?.short_name === "FM" ? "Further Maths" : exam.subjects?.short_name ?? "Other";
    const row = rows.get(date) ?? { date };
    row[subject] = Math.round(exam.percentage);
    rows.set(date, row);
  }

  return Array.from(rows.values()) as Array<{
    date: string;
    Physics?: number;
    Maths?: number;
    "Further Maths"?: number;
  }>;
}
