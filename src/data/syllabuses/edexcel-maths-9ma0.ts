import type { SyllabusDefinition } from "./types";

const p1 = { code: "9MA0-01", name: "Paper 1 - Pure Mathematics 1" };
const p2 = { code: "9MA0-02", name: "Paper 2 - Pure Mathematics 2" };
const p3 = { code: "9MA0-03", name: "Paper 3 - Statistics & Mechanics" };

export const edexcelMaths9MA0: SyllabusDefinition = {
  key: "maths-9ma0",
  subjectName: "Mathematics",
  shortName: "Maths",
  examBoard: "Pearson Edexcel",
  specificationCode: "9MA0",
  achievedGrade: "B",
  targetGrade: "A*",
  papers: [p1, p2, p3],
  topics: [
    module("9MA0.PURE", "Pure Mathematics", "Pure", p1, 1),
    topic("9MA0.PURE.PROOF", "9MA0.PURE", "Proof", "Pure: Proof", p1, 10),
    topic("9MA0.PURE.ALGEBRA_FUNCTIONS", "9MA0.PURE", "Algebra and functions", "Pure: Algebra and functions", p1, 20),
    sub("9MA0.PURE.ALGEBRA_QUADRATICS", "9MA0.PURE.ALGEBRA_FUNCTIONS", "Quadratics, inequalities and simultaneous equations", p1, 21),
    sub("9MA0.PURE.ALGEBRA_GRAPHS", "9MA0.PURE.ALGEBRA_FUNCTIONS", "Graphs, transformations and mappings", p1, 22),
    sub("9MA0.PURE.ALGEBRA_PARTIAL_FRACTIONS", "9MA0.PURE.ALGEBRA_FUNCTIONS", "Partial fractions and algebraic division", p2, 23),
    topic("9MA0.PURE.COORDINATE_GEOMETRY", "9MA0.PURE", "Coordinate geometry", "Pure: Coordinate geometry", p1, 30),
    sub("9MA0.PURE.COORDINATE_STRAIGHT_LINES", "9MA0.PURE.COORDINATE_GEOMETRY", "Straight-line coordinate geometry", p1, 31),
    sub("9MA0.PURE.COORDINATE_CIRCLES", "9MA0.PURE.COORDINATE_GEOMETRY", "Circles and parametric equations", p2, 32),
    topic("9MA0.PURE.SEQUENCES_SERIES", "9MA0.PURE", "Sequences and series", "Pure: Sequences and series", p1, 40),
    sub("9MA0.PURE.BINOMIAL", "9MA0.PURE.SEQUENCES_SERIES", "Binomial expansion", p1, 41),
    sub("9MA0.PURE.SERIES", "9MA0.PURE.SEQUENCES_SERIES", "Arithmetic and geometric sequences and series", p1, 42),
    topic("9MA0.PURE.TRIGONOMETRY", "9MA0.PURE", "Trigonometry", "Pure: Trigonometry", p1, 50),
    sub("9MA0.PURE.TRIG_IDENTITIES", "9MA0.PURE.TRIGONOMETRY", "Trigonometric identities and equations", p1, 51),
    sub("9MA0.PURE.TRIG_RADIANS", "9MA0.PURE.TRIGONOMETRY", "Radians, arcs and sectors", p1, 52),
    topic("9MA0.PURE.EXP_LOG", "9MA0.PURE", "Exponentials and logarithms", "Pure: Exponentials and logarithms", p1, 60),
    topic("9MA0.PURE.DIFFERENTIATION", "9MA0.PURE", "Differentiation", "Pure: Differentiation", p1, 70),
    sub("9MA0.PURE.DIFF_METHODS", "9MA0.PURE.DIFFERENTIATION", "Differentiation methods and connected rates", p1, 71),
    sub("9MA0.PURE.DIFF_APPLICATIONS", "9MA0.PURE.DIFFERENTIATION", "Stationary points, optimisation and modelling", p2, 72),
    topic("9MA0.PURE.INTEGRATION", "9MA0.PURE", "Integration", "Pure: Integration", p1, 80),
    sub("9MA0.PURE.INT_METHODS", "9MA0.PURE.INTEGRATION", "Integration methods", p1, 81),
    sub("9MA0.PURE.INT_APPLICATIONS", "9MA0.PURE.INTEGRATION", "Area, differential equations and modelling", p2, 82),
    topic("9MA0.PURE.NUMERICAL_METHODS", "9MA0.PURE", "Numerical methods", "Pure: Numerical methods", p2, 90),
    topic("9MA0.PURE.VECTORS", "9MA0.PURE", "Vectors", "Pure: Vectors", p2, 100),

    module("9MA0.STATS", "Statistics", "Statistics", p3, 200),
    topic("9MA0.STATS.SAMPLING", "9MA0.STATS", "Statistical sampling", "Statistics: Statistical sampling", p3, 210),
    topic("9MA0.STATS.DATA", "9MA0.STATS", "Data presentation and interpretation", "Statistics: Data presentation and interpretation", p3, 220),
    topic("9MA0.STATS.PROBABILITY", "9MA0.STATS", "Probability", "Statistics: Probability", p3, 230),
    topic("9MA0.STATS.DISTRIBUTIONS", "9MA0.STATS", "Statistical distributions", "Statistics: Statistical distributions", p3, 240),
    sub("9MA0.STATS.BINOMIAL_NORMAL", "9MA0.STATS.DISTRIBUTIONS", "Binomial and normal distributions", p3, 241),
    topic("9MA0.STATS.HYPOTHESIS", "9MA0.STATS", "Statistical hypothesis testing", "Statistics: Hypothesis testing", p3, 250),

    module("9MA0.MECH", "Mechanics", "Mechanics", p3, 300),
    topic("9MA0.MECH.QUANTITIES_UNITS", "9MA0.MECH", "Quantities and units in mechanics", "Mechanics: Quantities and units", p3, 310),
    topic("9MA0.MECH.KINEMATICS", "9MA0.MECH", "Kinematics", "Mechanics: Kinematics", p3, 320),
    topic("9MA0.MECH.FORCES_NEWTON", "9MA0.MECH", "Forces and Newton's laws", "Mechanics: Forces and Newton's laws", p3, 330),
    topic("9MA0.MECH.MOMENTS", "9MA0.MECH", "Moments", "Mechanics: Moments", p3, 340),
  ],
};

function module(code: string, name: string, ref: string, paper: typeof p1, sortOrder: number) {
  return { code, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "module" as const, sortOrder };
}

function topic(code: string, parentCode: string, name: string, ref: string, paper: typeof p1, sortOrder: number) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder };
}

function sub(code: string, parentCode: string, name: string, paper: typeof p1, sortOrder: number) {
  return { code, parentCode, name, specificationRef: name, paperCode: paper.code, paperName: paper.name, topicLevel: "subtopic" as const, sortOrder };
}
