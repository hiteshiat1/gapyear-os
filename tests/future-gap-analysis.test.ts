import { describe, expect, it } from "vitest";
import { analyseAcademicGap, parseRequirementGrades } from "@/lib/future/gap-analysis";
import type { Subject } from "@/types/domain";

describe("future academic gap analysis", () => {
  it("parses typical A-Level grade profiles", () => {
    expect(parseRequirementGrades("A*AA including Maths and Physics")).toEqual(["A*", "A", "A"]);
    expect(parseRequirementGrades("ABB-BBB")).toEqual(["A", "B", "B", "B", "B", "B"]);
  });

  it("uses careful language when current evidence is below a typical profile", () => {
    const result = analyseAcademicGap([subject("Maths", "B"), subject("Physics", "A"), subject("Further Maths", "A")], "A*AA");

    expect(result.label).toBe("below typical profile");
    expect(result.gap).toContain("typical published profile");
    expect(result.gap).not.toContain("will not");
    expect(result.nextStep).not.toContain("impossible");
  });

  it("asks for manual review when requirements are incomplete", () => {
    const result = analyseAcademicGap([subject("Maths", "A")], null);
    expect(result.label).toBe("needs manual review");
  });
});

function subject(name: string, evidenceGrade: string): Subject {
  return {
    id: name,
    name,
    shortName: name,
    examBoard: null,
    specificationCode: null,
    specificationOptions: null,
    achievedGrade: evidenceGrade,
    targetGrade: evidenceGrade,
    schoolPredictedGrade: null,
    estimatedGrade: evidenceGrade,
    latestMockGrade: null,
    syllabusCompletion: 0,
    active: true,
    studyHoursThisWeek: 0,
    weakTopicCount: 0,
    nextAction: "Study",
  };
}
