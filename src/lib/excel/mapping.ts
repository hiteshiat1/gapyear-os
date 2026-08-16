import { z } from "zod";

export const sheetMappings = {
  "Daily Plan": "daily_plans",
  Maths: "topics",
  "Further Maths": "topics",
  Physics: "topics",
  "Tests & Mocks": "exams",
  "Error Log": "exam_errors",
  Tutoring: "tutors",
  "Weekly Review": "weekly_reviews",
  "Monthly Review": "monthly_reviews",
  Journal: "journal_entries",
  "Startup HYD": "startup_experiences",
  "Engineering Projects": "projects",
  "NYC Events": "events",
  Networking: "contacts",
  "Learning Library": "learning_resources",
  Portfolio: "portfolio_items",
} as const;

export type SupportedSheetName = keyof typeof sheetMappings;

export function isSupportedSheet(sheetName: string): sheetName is SupportedSheetName {
  return sheetName in sheetMappings;
}

export function sourceRowKey(sheetName: string, rowIndex: number, row: Record<string, unknown>) {
  const stableValue =
    row.id ??
    row.ID ??
    row.Date ??
    row.date ??
    row.Title ??
    row.title ??
    row.Topic ??
    row.topic ??
    row.Paper ??
    row.paper ??
    rowIndex;

  return `${sheetName}:${String(stableValue).trim() || rowIndex}`;
}

export const examImportRowSchema = z
  .object({
    subject: z.string().min(1),
    paper: z.string().min(1),
    date: z.string().min(1),
    rawMarks: z.coerce.number().min(0),
    maxMarks: z.coerce.number().min(1),
    grade: z.string().optional(),
  })
  .refine((row) => row.rawMarks <= row.maxMarks, {
    message: "Raw marks cannot exceed max marks",
    path: ["rawMarks"],
  });

export function validateExamImportRow(row: Record<string, unknown>) {
  return examImportRowSchema.safeParse({
    subject: row.Subject ?? row.subject,
    paper: row.Paper ?? row.paper,
    date: row.Date ?? row.date,
    rawMarks: row["Raw Marks"] ?? row.rawMarks,
    maxMarks: row["Max Marks"] ?? row.maxMarks,
    grade: row.Grade ?? row.grade,
  });
}

export function workbookSheetSummary(sheetNames: string[], rowCounts: Record<string, number>) {
  return sheetNames.map((sheetName) => ({
    sheetName,
    supported: isSupportedSheet(sheetName),
    target: isSupportedSheet(sheetName) ? sheetMappings[sheetName] : null,
    rows: rowCounts[sheetName] ?? 0,
  }));
}
