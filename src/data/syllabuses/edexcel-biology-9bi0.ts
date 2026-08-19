import type { SyllabusDefinition } from "./types";

const p1 = { code: "9BI0-01", name: "Paper 1 - Advanced Biochemistry, Microbiology and Genetics" };
const p2 = { code: "9BI0-02", name: "Paper 2 - Advanced Physiology, Evolution and Ecology" };
const p3 = { code: "9BI0-03", name: "Paper 3 - General and Practical Principles in Biology" };

export const edexcelBiology9BI0: SyllabusDefinition = {
  key: "edexcel-biology-9bi0",
  subjectName: "Biology (Edexcel)",
  shortName: "Biology (Edexcel)",
  examBoard: "Pearson Edexcel",
  specificationCode: "9BI0",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [p1, p2, p3],
  topics: [
    topic("9BI0.T1", undefined, "Biological molecules", "Topic 1", p1, 10),
    topic("9BI0.T2", undefined, "Cells, viruses and reproduction of living things", "Topic 2", p1, 20),
    topic("9BI0.T3", undefined, "Classification and biodiversity", "Topic 3", p1, 30),
    topic("9BI0.T4", undefined, "Exchange and transport", "Topic 4", p1, 40),
    topic("9BI0.T5", undefined, "Energy for biological processes", "Topic 5", p2, 50),
    topic("9BI0.T6", undefined, "Microbiology and pathogens", "Topic 6", p1, 60),
    topic("9BI0.T7", undefined, "Modern genetics", "Topic 7", p1, 70),
    topic("9BI0.T8", undefined, "Origins of genetic variation", "Topic 8", p2, 80),
    topic("9BI0.T9", undefined, "Control systems", "Topic 9", p2, 90),
    topic("9BI0.T10", undefined, "Ecosystems", "Topic 10", p2, 100),
  ],
};

function topic(code: string, parentCode: string | undefined, name: string, ref: string, paper: typeof p1, sortOrder: number) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder };
}
