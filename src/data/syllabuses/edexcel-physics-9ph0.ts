import type { SyllabusDefinition } from "./types";

const p1 = { code: "9PH0-01", name: "Paper 1 - Advanced Physics I" };
const p2 = { code: "9PH0-02", name: "Paper 2 - Advanced Physics II" };
const p3 = { code: "9PH0-03", name: "Paper 3 - General and Practical Principles in Physics" };

export const edexcelPhysics9PH0: SyllabusDefinition = {
  key: "edexcel-physics-9ph0",
  subjectName: "Physics (Edexcel)",
  shortName: "Physics (Edexcel)",
  examBoard: "Pearson Edexcel",
  specificationCode: "9PH0",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [p1, p2, p3],
  topics: [
    topic("9PH0.T1", undefined, "Working as a physicist", "Topic 1", p3, 10),
    topic("9PH0.T2", undefined, "Mechanics", "Topic 2", p1, 20),
    topic("9PH0.T3", undefined, "Electric circuits", "Topic 3", p1, 30),
    topic("9PH0.T4", undefined, "Materials", "Topic 4", p2, 40),
    topic("9PH0.T5", undefined, "Waves and the particle nature of light", "Topic 5", p2, 50),
    topic("9PH0.T6", undefined, "Further mechanics", "Topic 6", p1, 60),
    topic("9PH0.T7", undefined, "Electric and magnetic fields", "Topic 7", p1, 70),
    topic("9PH0.T8", undefined, "Nuclear and particle physics", "Topic 8", p1, 80),
    topic("9PH0.T9", undefined, "Thermodynamics", "Topic 9", p2, 90),
    topic("9PH0.T10", undefined, "Space", "Topic 10", p2, 100),
    topic("9PH0.T11", undefined, "Nuclear radiation", "Topic 11", p2, 110),
    topic("9PH0.T12", undefined, "Gravitational fields", "Topic 12", p2, 120),
    topic("9PH0.T13", undefined, "Oscillations", "Topic 13", p2, 130),
  ],
};

function topic(code: string, parentCode: string | undefined, name: string, ref: string, paper: typeof p1, sortOrder: number) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder };
}
