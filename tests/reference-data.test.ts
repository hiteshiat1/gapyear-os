import { describe, expect, it } from "vitest";
import { gradeScale, referenceExamBoards, referenceSpecifications, referenceSubjects } from "@/data/reference/catalogue";

describe("canonical reference data", () => {
  it("uses stable unique subject slugs and board codes", () => {
    expect(new Set(referenceSubjects.map((subject) => subject.slug)).size).toBe(referenceSubjects.length);
    expect(new Set(referenceExamBoards.map((board) => board.code)).size).toBe(referenceExamBoards.length);
  });

  it("models English qualifications distinctly", () => {
    expect(referenceSubjects.map((subject) => subject.slug)).toContain("english-language");
    expect(referenceSubjects.map((subject) => subject.slug)).toContain("english-literature");
    expect(referenceSubjects.map((subject) => subject.slug)).toContain("english-language-and-literature");
  });

  it("does not claim every subject has both AQA and Edexcel specifications", () => {
    const environmentalScienceSpecs = referenceSpecifications.filter((spec) => spec.subjectSlug === "environmental-science");
    expect(environmentalScienceSpecs.map((spec) => spec.boardCode)).toEqual(["AQA"]);
  });

  it("supports multiple specifications and options where needed", () => {
    const furtherMaths = referenceSpecifications.find((spec) => spec.specificationCode === "9FM0");
    const physics = referenceSpecifications.find((spec) => spec.specificationCode === "7408");
    expect(furtherMaths?.options?.length).toBeGreaterThan(1);
    expect(physics?.options?.some((option) => option.name === "Engineering physics")).toBe(true);
  });

  it("keeps U valid for outcomes but not target selection", () => {
    const u = gradeScale.find((grade) => grade.grade === "U");
    expect(u).toMatchObject({ rank: 0, isTargetSelectable: false });
    expect(gradeScale.filter((grade) => grade.isTargetSelectable).map((grade) => grade.grade)).toEqual(["A*", "A", "B", "C", "D", "E"]);
  });
});
