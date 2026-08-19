import type { SyllabusDefinition } from "./types";

const p1 = { code: "7402-1", name: "Paper 1" };
const p2 = { code: "7402-2", name: "Paper 2" };
const p3 = { code: "7402-3", name: "Paper 3" };

export const aqaBiology7402: SyllabusDefinition = {
  key: "aqa-biology-7402",
  subjectName: "Biology (AQA)",
  shortName: "Biology (AQA)",
  examBoard: "AQA",
  specificationCode: "7402",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [p1, p2, p3],
  topics: [
    topic("7402.3.1", undefined, "Biological molecules", "3.1", p1, 10),
    topic("7402.3.2", undefined, "Cells", "3.2", p1, 20),
    topic("7402.3.3", undefined, "Organisms exchange substances with their environment", "3.3", p1, 30),
    topic("7402.3.4", undefined, "Genetic information, variation and relationships between organisms", "3.4", p1, 40),
    topic("7402.3.5", undefined, "Energy transfers in and between organisms", "3.5", p2, 50, true),
    topic("7402.3.6", undefined, "Organisms respond to changes in their internal and external environments", "3.6", p2, 60, true),
    topic("7402.3.7", undefined, "Genetics, populations, evolution and ecosystems", "3.7", p2, 70, true),
    topic("7402.3.8", undefined, "The control of gene expression", "3.8", p2, 80, true),
    topic("7402.PRACTICAL", undefined, "Required practical skills and practical endorsement", "Appendix 7 / 8", p3, 900),
  ],
};

function topic(
  code: string,
  parentCode: string | undefined,
  name: string,
  ref: string,
  paper: typeof p1,
  sortOrder: number,
  isOptional = false,
) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder, isOptional };
}
