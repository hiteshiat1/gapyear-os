import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getExamErrors } from "@/lib/repositories/errors";
import { getExams } from "@/lib/repositories/exams";
import { getSubjects, getTopics } from "@/lib/repositories/subjects";

export async function GET() {
  const [subjects, topics, exams, errors] = await Promise.all([
    getSubjects(),
    getTopics(),
    getExams(),
    getExamErrors(),
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(subjects), "Subjects");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(topics), "Topics");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(exams), "Tests & Mocks");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(errors), "Error Log");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = new Uint8Array(buffer);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="gap-year-os-export.xlsx"',
    },
  });
}
