import { describe, expect, it } from "vitest";
import { resolveProvisioningPlan } from "@/lib/repositories/provisioning";
import { referenceSpecifications } from "@/data/reference/catalogue";
import { syllabusDefinitions } from "@/data/syllabuses";

describe("resolveProvisioningPlan", () => {
  it("marks a board ready when a spec and syllabus file both exist", () => {
    const plan = resolveProvisioningPlan("physics", referenceSpecifications, syllabusDefinitions);
    const aqa = plan.find((entry) => entry.boardCode === "AQA");
    expect(aqa).toMatchObject({ status: "ready", specificationCode: "7408" });
  });

  it("marks a board coming_soon when a spec exists but no syllabus file matches", () => {
    const plan = resolveProvisioningPlan("environmental-science", referenceSpecifications, syllabusDefinitions);
    const aqa = plan.find((entry) => entry.boardCode === "AQA");
    expect(aqa).toMatchObject({ status: "coming_soon", specificationCode: "7447" });
  });

  it("marks a board not_offered when no specification exists for that board/subject", () => {
    const plan = resolveProvisioningPlan("environmental-science", referenceSpecifications, syllabusDefinitions);
    const edexcel = plan.find((entry) => entry.boardCode === "EDEXCEL");
    expect(edexcel).toMatchObject({ status: "not_offered", specificationCode: null });
  });

  it("always returns exactly one entry per board, both AQA and EDEXCEL", () => {
    const plan = resolveProvisioningPlan("mathematics", referenceSpecifications, syllabusDefinitions);
    expect(plan.map((entry) => entry.boardCode).sort()).toEqual(["AQA", "EDEXCEL"]);
  });

  it("is selectable when at least one board resolves to ready or coming_soon", () => {
    const plan = resolveProvisioningPlan("environmental-science", referenceSpecifications, syllabusDefinitions);
    expect(isSelectableFromPlan(plan)).toBe(true);
  });

  it("is not selectable when every board is not_offered", () => {
    const plan = resolveProvisioningPlan("nonexistent-subject-slug", referenceSpecifications, syllabusDefinitions);
    expect(plan.every((entry) => entry.status === "not_offered")).toBe(true);
    expect(isSelectableFromPlan(plan)).toBe(false);
  });
});

function isSelectableFromPlan(plan: ReturnType<typeof resolveProvisioningPlan>) {
  return plan.some((entry) => entry.status === "ready" || entry.status === "coming_soon");
}
