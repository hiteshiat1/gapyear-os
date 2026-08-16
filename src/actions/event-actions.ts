"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createEvent } from "@/lib/repositories/events";

const optionalText = z.string().trim().optional().transform((value) => value || null);

const eventSchema = z.object({
  eventName: z.string().trim().min(1),
  eventDate: optionalText,
  venue: optionalText,
  topic: optionalText,
  speakers: optionalText,
  peopleMet: optionalText,
  company: optionalText,
  notes: optionalText,
  built: optionalText,
  problemSolved: optionalText,
  technology: optionalText,
  businessModel: optionalText,
  surprised: optionalText,
  furtherResearch: optionalText,
  publishToPortfolio: z.boolean(),
});

export async function createEventAction(formData: FormData) {
  const parsed = eventSchema.parse({
    eventName: formData.get("eventName"),
    eventDate: formData.get("eventDate"),
    venue: formData.get("venue"),
    topic: formData.get("topic"),
    speakers: formData.get("speakers"),
    peopleMet: formData.get("peopleMet"),
    company: formData.get("company"),
    notes: formData.get("notes"),
    built: formData.get("built"),
    problemSolved: formData.get("problemSolved"),
    technology: formData.get("technology"),
    businessModel: formData.get("businessModel"),
    surprised: formData.get("surprised"),
    furtherResearch: formData.get("furtherResearch"),
    publishToPortfolio: formData.get("publishToPortfolio") === "on",
  });

  await createEvent({
    eventName: parsed.eventName,
    eventDate: parsed.eventDate,
    venue: parsed.venue,
    topic: parsed.topic,
    speakers: parsed.speakers,
    peopleMet: parsed.peopleMet,
    company: parsed.company,
    notes: parsed.notes,
    publishToPortfolio: parsed.publishToPortfolio,
    reflection: {
      built: parsed.built ?? "",
      problemSolved: parsed.problemSolved ?? "",
      technology: parsed.technology ?? "",
      businessModel: parsed.businessModel ?? "",
      surprised: parsed.surprised ?? "",
      furtherResearch: parsed.furtherResearch ?? "",
    },
  });

  revalidatePath("/events");
}
