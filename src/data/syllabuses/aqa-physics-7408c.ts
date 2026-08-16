import type { SyllabusDefinition } from "./types";

const p1 = { code: "7408-P1", name: "Paper 1" };
const p2 = { code: "7408-P2", name: "Paper 2" };
const p3a = { code: "7408-P3A", name: "Paper 3A - Practical / Data Analysis" };
const p3b = { code: "7408-P3B", name: "Paper 3B - Engineering Physics" };

export const aqaPhysics7408C: SyllabusDefinition = {
  key: "physics-7408c",
  subjectName: "Physics",
  shortName: "Physics",
  examBoard: "AQA",
  specificationCode: "7408",
  optionCode: "7408C",
  achievedGrade: "D",
  targetGrade: "A",
  papers: [p1, p2, p3a, p3b],
  topics: [
    module("7408.3.1", "3.1 Measurements and their errors", "3.1", p1, 10),
    topic("7408.3.1.SI_UNITS", "7408.3.1", "SI units and prefixes", "3.1.1", p1, 11),
    topic("7408.3.1.LIMITATIONS_MEASUREMENTS", "7408.3.1", "Limitations of physical measurements", "3.1.2", p1, 12),
    skill("7408.SKILL.UNCERTAINTY", "7408.3.1", "Uncertainty", "Mathematical and practical skills: Uncertainty", p3a, 13),
    skill("7408.SKILL.SIGNIFICANT_FIGURES", "7408.3.1", "Significant figures", "Mathematical skills: Significant figures", p3a, 14),

    module("7408.3.2", "3.2 Particles and radiation", "3.2", p1, 20),
    topic("7408.3.2.PARTICLES", "7408.3.2", "Particles", "3.2.1", p1, 21),
    topic("7408.3.2.ELECTROMAGNETIC_RADIATION", "7408.3.2", "Electromagnetic radiation and quantum phenomena", "3.2.2", p1, 22),

    module("7408.3.3", "3.3 Waves", "3.3", p1, 30),
    topic("7408.3.3.PROGRESSIVE_STATIONARY", "7408.3.3", "Progressive and stationary waves", "3.3.1", p1, 31),
    topic("7408.3.3.REFRACTION_DIFFRACTION_INTERFERENCE", "7408.3.3", "Refraction, diffraction and interference", "3.3.2", p1, 32),

    module("7408.3.4", "3.4 Mechanics and materials", "3.4", p1, 40),
    topic("7408.3.4.FORCES_ENERGY_MOMENTUM", "7408.3.4", "Force, energy and momentum", "3.4.1", p1, 41),
    topic("7408.3.4.MATERIALS", "7408.3.4", "Materials", "3.4.2", p1, 42),

    module("7408.3.5", "3.5 Electricity", "3.5", p1, 50),
    topic("7408.3.5.CURRENT_ELECTRICITY", "7408.3.5", "Current electricity", "3.5.1", p1, 51),
    topic("7408.3.5.CIRCUITS", "7408.3.5", "Circuits and internal resistance", "3.5.2", p1, 52),

    module("7408.3.6", "3.6 Further mechanics and thermal physics", "3.6", p2, 60),
    topic("7408.3.6.PERIODIC_MOTION", "7408.3.6", "Periodic motion", "3.6.1", p1, 61),
    topic("7408.3.6.THERMAL_PHYSICS", "7408.3.6", "Thermal physics", "3.6.2", p2, 62),
    topic("7408.3.6.IDEAL_GASES", "7408.3.6", "Ideal gases", "3.6.3", p2, 63),

    module("7408.3.7", "3.7 Fields and their consequences", "3.7", p2, 70),
    topic("7408.3.7.GRAVITATIONAL_FIELDS", "7408.3.7", "Gravitational fields", "3.7.1", p2, 71),
    topic("7408.3.7.ELECTRIC_FIELDS", "7408.3.7", "Electric fields", "3.7.2", p2, 72),
    topic("7408.3.7.CAPACITANCE", "7408.3.7", "Capacitance", "3.7.3", p2, 73),
    topic("7408.3.7.MAGNETIC_FIELDS", "7408.3.7", "Magnetic fields", "3.7.4", p2, 74),
    topic("7408.3.7.ELECTROMAGNETIC_INDUCTION", "7408.3.7", "Electromagnetic induction", "3.7.5", p2, 75),

    module("7408.3.8", "3.8 Nuclear physics", "3.8", p2, 80),
    topic("7408.3.8.RADIOACTIVITY", "7408.3.8", "Radioactivity", "3.8.1", p2, 81),
    topic("7408.3.8.NUCLEAR_ENERGY", "7408.3.8", "Nuclear energy", "3.8.2", p2, 82),

    module("7408.3.11", "3.11 Engineering physics", "3.11", p3b, 110, true),
    topic("7408.3.11.ROTATIONAL_DYNAMICS", "7408.3.11", "Rotational dynamics", "3.11.1", p3b, 111, true),
    topic("7408.3.11.THERMODYNAMICS_ENGINES", "7408.3.11", "Thermodynamics and engines", "3.11.2", p3b, 112, true),

    skill("7408.SKILL.MATHEMATICAL_SKILLS", undefined, "Mathematical Skills", "Mathematical skills", p3a, 900),
    skill("7408.SKILL.PRACTICAL_SKILLS", undefined, "Practical Skills", "Practical endorsement / Paper 3A", p3a, 910),
    skill("7408.SKILL.DATA_ANALYSIS", undefined, "Data Analysis", "Paper 3A data analysis", p3a, 920),
    skill("7408.SKILL.GRAPH_INTERPRETATION", undefined, "Graph Interpretation", "Practical and mathematical skills", p3a, 930),
    skill("7408.SKILL.EXPERIMENTAL_DESIGN", undefined, "Experimental Design", "Practical skills", p3a, 940),
  ],
};

function module(code: string, name: string, ref: string, paper: typeof p1, sortOrder: number, isOptional = false) {
  return { code, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "module" as const, sortOrder, isOptional };
}

function topic(code: string, parentCode: string, name: string, ref: string, paper: typeof p1, sortOrder: number, isOptional = false) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder, isOptional };
}

function skill(code: string, parentCode: string | undefined, name: string, ref: string, paper: typeof p1, sortOrder: number) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "skill" as const, sortOrder };
}
