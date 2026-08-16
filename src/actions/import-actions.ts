"use server";

import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import { workbookSheetSummary } from "@/lib/excel/mapping";

export async function previewWorkbookAction(formData: FormData) {
  const file = formData.get("workbook");

  if (!(file instanceof File) || !file.name.endsWith(".xlsx")) {
    redirect("/settings/import?error=Upload%20a%20valid%20xlsx%20file");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  const rowCounts: Record<string, number> = {};

  for (const sheetName of workbook.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName] ?? {}, { defval: "" });
    rowCounts[sheetName] = rows.length;
  }

  const summary = workbookSheetSummary(workbook.SheetNames, rowCounts);
  const encoded = Buffer.from(JSON.stringify(summary.slice(0, 30))).toString("base64url");
  redirect(`/settings/import?preview=${encoded}`);
}
