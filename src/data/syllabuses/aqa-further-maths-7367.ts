import type { SyllabusDefinition } from "./types";

const p1 = { code: "7367-1", name: "Paper 1 - Core Pure Mathematics" };
const p2 = { code: "7367-2", name: "Paper 2 - Core Pure Mathematics" };
const opt1 = { code: "7367-3", name: "Paper 3 - Optional Application 1" };
const opt2 = { code: "7367-4", name: "Paper 4 - Optional Application 2" };

export const aqaFurtherMaths7367: SyllabusDefinition = {
  key: "aqa-further-maths-7367",
  subjectName: "Further Mathematics (AQA)",
  shortName: "FM (AQA)",
  examBoard: "AQA",
  specificationCode: "7367",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [p1, p2, opt1, opt2],
  topics: [
    module("7367.CORE", "Core Pure Mathematics (compulsory)", "Compulsory content A-J", p1, 1),
    topic("7367.CORE.PROOF", "7367.CORE", "Proof", "A", p1, 10),
    topic("7367.CORE.COMPLEX_NUMBERS", "7367.CORE", "Complex numbers", "B", p1, 20),
    topic("7367.CORE.MATRICES", "7367.CORE", "Matrices", "C", p1, 30),
    topic("7367.CORE.FURTHER_VECTORS", "7367.CORE", "Further vectors", "D", p2, 40),
    topic("7367.CORE.FURTHER_ALGEBRA_FUNCTIONS", "7367.CORE", "Further algebra and functions", "E", p1, 50),
    topic("7367.CORE.FURTHER_CALCULUS", "7367.CORE", "Further calculus", "F", p2, 60),
    topic("7367.CORE.FURTHER_DIFFERENTIAL_EQUATIONS", "7367.CORE", "Further differential equations", "G", p2, 70),
    topic("7367.CORE.POLAR_COORDINATES", "7367.CORE", "Polar coordinates", "H", p2, 80),
    topic("7367.CORE.HYPERBOLIC_FUNCTIONS", "7367.CORE", "Hyperbolic functions", "I", p2, 90),
    topic("7367.CORE.DIFFERENTIAL_EQUATIONS_MODELLING", "7367.CORE", "Numerical methods for differential equations", "J", p2, 100),

    module("7367.MECH", "Optional application: Mechanics (MA-ME)", "Mechanics", opt1, 200, true),
    topic("7367.MECH.MOMENTUM_IMPULSE", "7367.MECH", "Momentum and impulse", "MA", opt1, 210, true),
    topic("7367.MECH.WORK_ENERGY_POWER", "7367.MECH", "Work, energy and power", "MB", opt1, 220, true),
    topic("7367.MECH.CIRCULAR_MOTION", "7367.MECH", "Circular motion", "MC", opt1, 230, true),
    topic("7367.MECH.CENTRES_MASS_MOMENTS", "7367.MECH", "Centres of mass and moments", "MD", opt1, 240, true),
    topic("7367.MECH.ELASTIC_STRINGS_SPRINGS", "7367.MECH", "Elastic strings, springs and elastic energy", "ME", opt1, 250, true),

    module("7367.STATS", "Optional application: Statistics (SA-SH)", "Statistics", opt1, 300, true),
    topic("7367.STATS.DISCRETE_DISTRIBUTIONS", "7367.STATS", "Discrete probability distributions", "SA", opt1, 310, true),
    topic("7367.STATS.POISSON_EXPONENTIAL", "7367.STATS", "Poisson and exponential distributions", "SB", opt1, 320, true),
    topic("7367.STATS.HYPOTHESIS_TESTING", "7367.STATS", "Hypothesis testing", "SC", opt1, 330, true),
    topic("7367.STATS.CHI_SQUARED", "7367.STATS", "Chi-squared tests", "SD", opt1, 340, true),
    topic("7367.STATS.CORRELATION_REGRESSION", "7367.STATS", "Correlation and regression", "SE", opt1, 350, true),
    topic("7367.STATS.CONTINUOUS_DISTRIBUTIONS", "7367.STATS", "Continuous probability distributions", "SF", opt1, 360, true),
    topic("7367.STATS.COMBINATIONS_RANDOM_VARIABLES", "7367.STATS", "Combinations of random variables", "SG", opt1, 370, true),
    topic("7367.STATS.CONFIDENCE_INTERVALS", "7367.STATS", "Confidence intervals and estimation", "SH", opt1, 380, true),

    module("7367.DISCRETE", "Optional application: Discrete (DA-DG)", "Discrete", opt2, 400, true),
    topic("7367.DISCRETE.GRAPHS_NETWORKS", "7367.DISCRETE", "Graphs and networks", "DA", opt2, 410, true),
    topic("7367.DISCRETE.NETWORK_ALGORITHMS", "7367.DISCRETE", "Algorithms on graphs", "DB", opt2, 420, true),
    topic("7367.DISCRETE.ROUTE_INSPECTION_TSP", "7367.DISCRETE", "Route inspection and travelling salesperson problem", "DC", opt2, 430, true),
    topic("7367.DISCRETE.LINEAR_PROGRAMMING", "7367.DISCRETE", "Linear programming", "DD", opt2, 440, true),
    topic("7367.DISCRETE.CRITICAL_PATH_ANALYSIS", "7367.DISCRETE", "Critical path analysis", "DE", opt2, 450, true),
    topic("7367.DISCRETE.GAME_THEORY", "7367.DISCRETE", "Game theory for zero-sum games", "DF", opt2, 460, true),
    topic("7367.DISCRETE.RECURRENCE_RELATIONS", "7367.DISCRETE", "Recurrence relations", "DG", opt2, 470, true),
  ],
};

function module(code: string, name: string, ref: string, paper: typeof p1, sortOrder: number, isOptional = false) {
  return { code, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "module" as const, sortOrder, isOptional };
}

function topic(code: string, parentCode: string, name: string, ref: string, paper: typeof p1, sortOrder: number, isOptional = false) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder, isOptional };
}
