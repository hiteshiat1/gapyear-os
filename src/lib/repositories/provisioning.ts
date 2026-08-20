import type { ReferenceSpecification } from "@/data/reference/catalogue";
import type { SyllabusDefinition } from "@/data/syllabuses/types";

export type ProvisioningBoardCode = "AQA" | "EDEXCEL";
export type ProvisioningStatus = "ready" | "coming_soon" | "not_offered" | "error";

export type ProvisioningPlanEntry = {
  boardCode: ProvisioningBoardCode;
  status: ProvisioningStatus;
  specificationCode: string | null;
  specificationName: string | null;
  message: string | null;
};

const BOARD_CODES: ProvisioningBoardCode[] = ["AQA", "EDEXCEL"];

export function resolveProvisioningPlan(
  subjectSlug: string,
  specifications: ReferenceSpecification[],
  syllabusDefinitions: SyllabusDefinition[],
): ProvisioningPlanEntry[] {
  return BOARD_CODES.map((boardCode) => {
    const spec = specifications.find(
      (item) => item.subjectSlug === subjectSlug && item.boardCode === boardCode,
    );

    if (!spec) {
      return {
        boardCode,
        status: "not_offered",
        specificationCode: null,
        specificationName: null,
        message: `${boardCode} does not currently offer this subject.`,
      };
    }

    const boardName = boardCode === "AQA" ? "AQA" : "Pearson Edexcel";
    const hasSyllabusFile = syllabusDefinitions.some(
      (definition) =>
        definition.examBoard === boardName && definition.specificationCode === spec.specificationCode,
    );

    return {
      boardCode,
      status: hasSyllabusFile ? "ready" : "coming_soon",
      specificationCode: spec.specificationCode,
      specificationName: spec.specificationName,
      message: hasSyllabusFile
        ? null
        : `${spec.specificationCode} is valid but detailed topic tracking is not yet built.`,
    };
  });
}

export function isSubjectSelectableFromPlan(plan: ProvisioningPlanEntry[]) {
  return plan.some((entry) => entry.status === "ready" || entry.status === "coming_soon");
}
