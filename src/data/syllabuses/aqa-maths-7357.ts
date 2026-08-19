import type { SyllabusDefinition } from "./types";

const p1 = { code: "7357-1", name: "Paper 1" };
const p2 = { code: "7357-2", name: "Paper 2" };
const p3 = { code: "7357-3", name: "Paper 3" };

export const aqaMaths7357: SyllabusDefinition = {
  key: "aqa-maths-7357",
  subjectName: "Mathematics (AQA)",
  shortName: "Maths (AQA)",
  examBoard: "AQA",
  specificationCode: "7357",
  achievedGrade: "B",
  targetGrade: "A*",
  papers: [p1, p2, p3],
  topics: [
    module("7357.PURE", "Pure Mathematics", "Pure", p1, 1),
    topic("7357.PURE.PROOF", "7357.PURE", "Proof", "1.1", p1, 10),
    topic("7357.PURE.ALGEBRA_FUNCTIONS", "7357.PURE", "Algebra and functions", "1.2", p1, 20),
    topic("7357.PURE.COORDINATE_GEOMETRY", "7357.PURE", "Coordinate geometry in the (x, y) plane", "1.3", p1, 30),
    topic("7357.PURE.SEQUENCES_SERIES", "7357.PURE", "Sequences and series", "1.4", p1, 40),
    topic("7357.PURE.TRIGONOMETRY", "7357.PURE", "Trigonometry", "1.5", p1, 50),
    topic("7357.PURE.EXP_LOG", "7357.PURE", "Exponentials and logarithms", "1.6", p1, 60),
    topic("7357.PURE.DIFFERENTIATION", "7357.PURE", "Differentiation", "1.7", p1, 70),
    topic("7357.PURE.INTEGRATION", "7357.PURE", "Integration", "1.8", p1, 80),
    topic("7357.PURE.NUMERICAL_METHODS", "7357.PURE", "Numerical methods", "1.9", p2, 90),
    topic("7357.PURE.VECTORS", "7357.PURE", "Vectors", "1.10", p2, 100),

    module("7357.STATS", "Statistics", "Statistics", p2, 200),
    topic("7357.STATS.SAMPLING", "7357.STATS", "Statistical sampling", "2.1", p2, 210),
    topic("7357.STATS.DATA", "7357.STATS", "Data presentation and interpretation", "2.2", p2, 220),
    topic("7357.STATS.PROBABILITY", "7357.STATS", "Probability", "2.3", p2, 230),
    topic("7357.STATS.DISTRIBUTIONS", "7357.STATS", "Statistical distributions", "2.4", p2, 240),
    topic("7357.STATS.HYPOTHESIS", "7357.STATS", "Statistical hypothesis testing", "2.5", p2, 250),

    module("7357.MECH", "Mechanics", "Mechanics", p2, 300),
    topic("7357.MECH.QUANTITIES_UNITS", "7357.MECH", "Quantities and units in mechanics", "3.1", p2, 310),
    topic("7357.MECH.KINEMATICS", "7357.MECH", "Kinematics", "3.2", p2, 320),
    topic("7357.MECH.FORCES_NEWTON", "7357.MECH", "Forces and Newton's laws", "3.3", p2, 330),
    topic("7357.MECH.MOMENTS", "7357.MECH", "Moments", "3.4", p2, 340),
  ],
};

function module(code: string, name: string, ref: string, paper: typeof p1, sortOrder: number) {
  return { code, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "module" as const, sortOrder };
}

function topic(code: string, parentCode: string, name: string, ref: string, paper: typeof p1, sortOrder: number) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder };
}
