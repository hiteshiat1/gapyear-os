import type { SyllabusDefinition } from "./types";

const p1 = { code: "9CP0-01", name: "Paper 1 - Principles of Computer Science" };
const p2 = { code: "9CP0-02", name: "Paper 2 - Application of Computational Thinking" };
const nea = { code: "9CP0-NEA", name: "Non-exam assessment - Programming project" };

export const edexcelComputerScience9CP0: SyllabusDefinition = {
  key: "edexcel-computer-science-9cp0",
  subjectName: "Computer Science (Edexcel)",
  shortName: "CS (Edexcel)",
  examBoard: "Pearson Edexcel",
  specificationCode: "9CP0",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [p1, p2, nea],
  topics: [
    topic("9CP0.T1", undefined, "Computational thinking", "Topic 1", p1, 10),
    topic("9CP0.T2", undefined, "Data", "Topic 2", p1, 20),
    topic("9CP0.T3", undefined, "Algorithms", "Topic 3", p1, 30),
    topic("9CP0.T4", undefined, "Programming", "Topic 4", p1, 40),
    topic("9CP0.T5", undefined, "Computer systems", "Topic 5", p1, 50),
    topic("9CP0.T6", undefined, "Networks", "Topic 6", p1, 60),
    topic("9CP0.T7", undefined, "Issues", "Topic 7", p1, 70),
    topic("9CP0.T8", undefined, "Applying computational thinking (project techniques)", "Topic 8", p2, 80),
    topic("9CP0.NEA", undefined, "Non-exam assessment: programming project", "NEA", nea, 900),
  ],
};

function topic(code: string, parentCode: string | undefined, name: string, ref: string, paper: typeof p1, sortOrder: number) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder };
}
