import type { Event } from "@/types/domain";
import type { Json } from "@/types/database";
import { getSupabaseForRead, requireUser } from "./common";

export async function getEvents(): Promise<Event[]> {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_deleted", false)
    .order("event_date", { ascending: false });

  if (error) {
    console.error("getEvents failed", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    eventName: row.event_name,
    eventDate: row.event_date,
    venue: row.venue,
    topic: row.topic,
    speakers: row.speakers,
    peopleMet: row.people_met,
    company: row.company,
    notes: row.notes,
    reflection: toStringRecord(row.reflection),
    publishToPortfolio: row.publish_to_portfolio,
  }));
}

export async function createEvent(input: {
  eventName: string;
  eventDate?: string | null;
  venue?: string | null;
  topic?: string | null;
  speakers?: string | null;
  peopleMet?: string | null;
  company?: string | null;
  notes?: string | null;
  reflection?: Record<string, string>;
  publishToPortfolio?: boolean;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("events").insert({
    owner_id: user.id,
    created_by: user.id,
    updated_by: user.id,
    event_name: input.eventName,
    event_date: input.eventDate ?? null,
    venue: input.venue ?? null,
    topic: input.topic ?? null,
    speakers: input.speakers ?? null,
    people_met: input.peopleMet ?? null,
    company: input.company ?? null,
    notes: input.notes ?? null,
    reflection: input.reflection ?? {},
    publish_to_portfolio: input.publishToPortfolio ?? false,
  });

  if (error) throw new Error(error.message);
}

function toStringRecord(value: Json | null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, typeof item === "string" ? item : ""]),
  );
}
