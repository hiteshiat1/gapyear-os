import type { SyllabusDefinition } from "./types";

const cp1 = { code: "9FM0-01", name: "Paper 1 - Core Pure Mathematics 1" };
const cp2 = { code: "9FM0-02", name: "Paper 2 - Core Pure Mathematics 2" };
const fs1 = { code: "9FM0-3B", name: "Paper 3B - Further Statistics 1" };
const fm1 = { code: "9FM0-3C", name: "Paper 3C - Further Mechanics 1" };

export const edexcelFurtherMaths9FM0E0: SyllabusDefinition = {
  key: "further-maths-9fm0-e0",
  subjectName: "Further Mathematics",
  shortName: "FM",
  examBoard: "Pearson Edexcel",
  specificationCode: "9FM0",
  optionCode: "E0",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [cp1, cp2, fs1, fm1],
  topics: [
    module("9FM0.CORE_PURE", "Core Pure Mathematics", "Core Pure Mathematics", cp1, 1),
    topic("9FM0.CORE.PROOF", "9FM0.CORE_PURE", "Proof", "Core Pure: Proof", cp1, 10),
    topic("9FM0.CORE.COMPLEX_NUMBERS", "9FM0.CORE_PURE", "Complex numbers", "Core Pure: Complex numbers", cp1, 20),
    sub("9FM0.CORE.COMPLEX_LOCUS", "9FM0.CORE.COMPLEX_NUMBERS", "Complex loci and transformations", cp1, 21),
    topic("9FM0.CORE.MATRICES", "9FM0.CORE_PURE", "Matrices", "Core Pure: Matrices", cp1, 30),
    sub("9FM0.CORE.MATRICES_TRANSFORMATIONS", "9FM0.CORE.MATRICES", "Matrix transformations and determinants", cp1, 31),
    topic("9FM0.CORE.FURTHER_ALGEBRA", "9FM0.CORE_PURE", "Further algebra and functions", "Core Pure: Further algebra and functions", cp1, 40),
    sub("9FM0.CORE.ROOTS_POLYNOMIALS", "9FM0.CORE.FURTHER_ALGEBRA", "Roots of polynomials", cp1, 41),
    sub("9FM0.CORE.SERIES", "9FM0.CORE.FURTHER_ALGEBRA", "Series and method of differences", cp2, 42),
    topic("9FM0.CORE.FURTHER_CALCULUS", "9FM0.CORE_PURE", "Further calculus", "Core Pure: Further calculus", cp2, 50),
    sub("9FM0.CORE.FURTHER_INTEGRATION", "9FM0.CORE.FURTHER_CALCULUS", "Further integration techniques", cp2, 51),
    topic("9FM0.CORE.VECTORS", "9FM0.CORE_PURE", "Further vectors", "Core Pure: Further vectors", cp2, 60),
    topic("9FM0.CORE.POLAR", "9FM0.CORE_PURE", "Polar coordinates", "Core Pure: Polar coordinates", cp2, 70),
    topic("9FM0.CORE.HYPERBOLIC", "9FM0.CORE_PURE", "Hyperbolic functions", "Core Pure: Hyperbolic functions", cp2, 80),
    topic("9FM0.CORE.DIFFERENTIAL_EQUATIONS", "9FM0.CORE_PURE", "Differential equations", "Core Pure: Differential equations", cp2, 90),

    module("9FM0.FS1", "Further Statistics 1", "Further Statistics 1", fs1, 200),
    topic("9FM0.FS1.DISCRETE_DISTRIBUTIONS", "9FM0.FS1", "Discrete probability distributions", "FS1: Discrete probability distributions", fs1, 210),
    topic("9FM0.FS1.POISSON", "9FM0.FS1", "Poisson distribution", "FS1: Poisson distribution", fs1, 220),
    topic("9FM0.FS1.GEOMETRIC_NEGATIVE_BINOMIAL", "9FM0.FS1", "Geometric and negative binomial distributions", "FS1: Geometric and negative binomial distributions", fs1, 230),
    topic("9FM0.FS1.HYPOTHESIS_TESTING", "9FM0.FS1", "Hypothesis testing", "FS1: Hypothesis testing", fs1, 240),
    topic("9FM0.FS1.CHI_SQUARED", "9FM0.FS1", "Chi-squared tests", "FS1: Chi-squared tests", fs1, 250),
    topic("9FM0.FS1.CORRELATION_REGRESSION", "9FM0.FS1", "Correlation and regression", "FS1: Correlation and regression", fs1, 260),

    module("9FM0.FM1", "Further Mechanics 1", "Further Mechanics 1", fm1, 300),
    topic("9FM0.FM1.MOMENTUM_IMPULSE", "9FM0.FM1", "Momentum and impulse", "FM1: Momentum and impulse", fm1, 310),
    topic("9FM0.FM1.COLLISIONS", "9FM0.FM1", "Elastic and inelastic collisions", "FM1: Collisions", fm1, 320),
    topic("9FM0.FM1.WORK_ENERGY_POWER", "9FM0.FM1", "Work, energy and power", "FM1: Work, energy and power", fm1, 330),
    topic("9FM0.FM1.ELASTIC_STRINGS_SPRINGS", "9FM0.FM1", "Elastic strings and springs", "FM1: Elastic strings and springs", fm1, 340),
    topic("9FM0.FM1.ELASTIC_COLLISIONS_2D", "9FM0.FM1", "Elastic collisions in two dimensions", "FM1: Elastic collisions in two dimensions", fm1, 350),
  ],
};

function module(code: string, name: string, ref: string, paper: typeof cp1, sortOrder: number) {
  return { code, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "module" as const, sortOrder };
}

function topic(code: string, parentCode: string, name: string, ref: string, paper: typeof cp1, sortOrder: number) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder };
}

function sub(code: string, parentCode: string, name: string, paper: typeof cp1, sortOrder: number) {
  return { code, parentCode, name, specificationRef: name, paperCode: paper.code, paperName: paper.name, topicLevel: "subtopic" as const, sortOrder };
}
