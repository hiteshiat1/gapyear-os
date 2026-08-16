import { describe, expect, it } from "vitest";
import { isSupportedSheet, sourceRowKey, validateExamImportRow, workbookSheetSummary } from "@/lib/excel/mapping";

describe("excel mapping", () => {
  it("identifies supported workbook sheets", () => {
    expect(isSupportedSheet("Tests & Mocks")).toBe(true);
    expect(isSupportedSheet("Dashboard")).toBe(false);
  });

  it("generates stable source row keys", () => {
    expect(sourceRowKey("Tests & Mocks", 2, { Paper: "Physics Paper 1" })).toBe("Tests & Mocks:Physics Paper 1");
  });

  it("validates imported exam rows", () => {
    const result = validateExamImportRow({
      Subject: "Physics",
      Paper: "Paper 1",
      Date: "2026-08-16",
      "Raw Marks": 63,
      "Max Marks": 100,
    });
    expect(result.success).toBe(true);
  });

  it("rejects impossible marks", () => {
    const result = validateExamImportRow({
      Subject: "Physics",
      Paper: "Paper 1",
      Date: "2026-08-16",
      "Raw Marks": 101,
      "Max Marks": 100,
    });
    expect(result.success).toBe(false);
  });

  it("summarizes workbook sheets", () => {
    expect(workbookSheetSummary(["Daily Plan", "Dashboard"], { "Daily Plan": 10, Dashboard: 1 })).toEqual([
      { sheetName: "Daily Plan", supported: true, target: "daily_plans", rows: 10 },
      { sheetName: "Dashboard", supported: false, target: null, rows: 1 },
    ]);
  });
});
