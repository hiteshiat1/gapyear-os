import type { SyllabusDefinition } from "./types";

const p1 = { code: "9CH0-01", name: "Paper 1 - Advanced Inorganic and Physical Chemistry" };
const p2 = { code: "9CH0-02", name: "Paper 2 - Advanced Organic and Physical Chemistry" };
const p3 = { code: "9CH0-03", name: "Paper 3 - General and Practical Principles in Chemistry" };

export const edexcelChemistry9CH0: SyllabusDefinition = {
  key: "edexcel-chemistry-9ch0",
  subjectName: "Chemistry (Edexcel)",
  shortName: "Chemistry (Edexcel)",
  examBoard: "Pearson Edexcel",
  specificationCode: "9CH0",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [p1, p2, p3],
  topics: [
    topic("9CH0.T1", undefined, "Atomic structure and the periodic table", "Topic 1", p1, 10),
    topic("9CH0.T2", undefined, "Bonding and structure", "Topic 2", p1, 20),
    topic("9CH0.T3", undefined, "Redox I", "Topic 3", p1, 30),
    topic("9CH0.T4", undefined, "Inorganic chemistry and the periodic table", "Topic 4", p1, 40),
    topic("9CH0.T5", undefined, "Formulae, equations and amounts of substance", "Topic 5", p1, 50),
    topic("9CH0.T6", undefined, "Organic chemistry I", "Topic 6", p2, 60),
    topic("9CH0.T7", undefined, "Modern analytical techniques I", "Topic 7", p2, 70),
    topic("9CH0.T8", undefined, "Energetics I", "Topic 8", p1, 80),
    topic("9CH0.T9", undefined, "Kinetics I", "Topic 9", p2, 90),
    topic("9CH0.T10", undefined, "Equilibrium I", "Topic 10", p1, 100),
    topic("9CH0.T11", undefined, "Equilibrium II", "Topic 11", p1, 110),
    topic("9CH0.T12", undefined, "Acid-base equilibria", "Topic 12", p1, 120),
    topic("9CH0.T13", undefined, "Energetics II", "Topic 13", p1, 130),
    topic("9CH0.T14", undefined, "Redox II", "Topic 14", p1, 140),
    topic("9CH0.T15", undefined, "Transition metals", "Topic 15", p1, 150),
    topic("9CH0.T16", undefined, "Kinetics II", "Topic 16", p2, 160),
    topic("9CH0.T17", undefined, "Organic chemistry II", "Topic 17", p2, 170),
    topic("9CH0.T18", undefined, "Organic chemistry III", "Topic 18", p2, 180),
    topic("9CH0.T19", undefined, "Modern analytical techniques II", "Topic 19", p2, 190),
    topic("9CH0.PRACTICAL", undefined, "Core practicals and practical endorsement", "Practical skills", p3, 900),
  ],
};

function topic(code: string, parentCode: string | undefined, name: string, ref: string, paper: typeof p1, sortOrder: number) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder };
}
