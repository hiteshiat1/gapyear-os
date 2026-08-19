import type { SyllabusDefinition } from "./types";

const p1 = { code: "7405-1", name: "Paper 1 - Physical and Inorganic Chemistry" };
const p2 = { code: "7405-2", name: "Paper 2 - Physical and Organic Chemistry" };
const p3 = { code: "7405-3", name: "Paper 3 - Synoptic" };

export const aqaChemistry7405: SyllabusDefinition = {
  key: "aqa-chemistry-7405",
  subjectName: "Chemistry (AQA)",
  shortName: "Chemistry (AQA)",
  examBoard: "AQA",
  specificationCode: "7405",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [p1, p2, p3],
  topics: [
    module("7405.PHYS", "Physical chemistry", "3.1", p1, 1),
    topic("7405.PHYS.ATOMIC_STRUCTURE", "7405.PHYS", "Atomic structure", "3.1.1", p1, 10),
    topic("7405.PHYS.AMOUNT_OF_SUBSTANCE", "7405.PHYS", "Amount of substance", "3.1.2", p1, 20),
    topic("7405.PHYS.BONDING", "7405.PHYS", "Bonding", "3.1.3", p1, 30),
    topic("7405.PHYS.ENERGETICS", "7405.PHYS", "Energetics", "3.1.4", p1, 40),
    topic("7405.PHYS.KINETICS", "7405.PHYS", "Kinetics", "3.1.5", p1, 50),
    topic("7405.PHYS.CHEMICAL_EQUILIBRIA", "7405.PHYS", "Chemical equilibria, Le Chatelier's principle and Kc", "3.1.6", p1, 60),
    topic("7405.PHYS.OXIDATION_REDUCTION", "7405.PHYS", "Oxidation, reduction and redox equations", "3.1.7", p1, 70),
    topic("7405.PHYS.THERMODYNAMICS", "7405.PHYS", "Thermodynamics", "3.1.8", p1, 80, true),
    topic("7405.PHYS.RATE_EQUATIONS", "7405.PHYS", "Rate equations", "3.1.9", p1, 90, true),
    topic("7405.PHYS.EQUILIBRIUM_CONSTANT_KP", "7405.PHYS", "Equilibrium constant Kp for homogeneous systems", "3.1.10", p1, 100, true),
    topic("7405.PHYS.ELECTRODE_POTENTIALS", "7405.PHYS", "Electrode potentials and electrochemical cells", "3.1.11", p1, 110, true),
    topic("7405.PHYS.ACIDS_BASES", "7405.PHYS", "Acids and bases", "3.1.12", p1, 120, true),

    module("7405.INORG", "Inorganic chemistry", "3.2", p1, 200),
    topic("7405.INORG.PERIODICITY", "7405.INORG", "Periodicity", "3.2.1", p1, 210),
    topic("7405.INORG.GROUP2", "7405.INORG", "Group 2, the alkaline earth metals", "3.2.2", p1, 220),
    topic("7405.INORG.GROUP7", "7405.INORG", "Group 7(17), the halogens", "3.2.3", p1, 230),
    topic("7405.INORG.PERIOD3", "7405.INORG", "Properties of Period 3 elements and their oxides", "3.2.4", p1, 240, true),
    topic("7405.INORG.TRANSITION_METALS", "7405.INORG", "Transition metals", "3.2.5", p1, 250, true),
    topic("7405.INORG.REACTIONS_IONS_SOLUTION", "7405.INORG", "Reactions of ions in aqueous solution", "3.2.6", p1, 260, true),

    module("7405.ORG", "Organic chemistry", "3.3", p2, 300),
    topic("7405.ORG.INTRODUCTION", "7405.ORG", "Introduction to organic chemistry", "3.3.1", p2, 310),
    topic("7405.ORG.ALKANES", "7405.ORG", "Alkanes", "3.3.2", p2, 320),
    topic("7405.ORG.HALOGENOALKANES", "7405.ORG", "Halogenoalkanes", "3.3.3", p2, 330),
    topic("7405.ORG.ALKENES", "7405.ORG", "Alkenes", "3.3.4", p2, 340),
    topic("7405.ORG.ALCOHOLS", "7405.ORG", "Alcohols", "3.3.5", p2, 350),
    topic("7405.ORG.ORGANIC_ANALYSIS", "7405.ORG", "Organic analysis", "3.3.6", p2, 360),
    topic("7405.ORG.OPTICAL_ISOMERISM", "7405.ORG", "Optical isomerism", "3.3.7", p2, 370, true),
    topic("7405.ORG.ALDEHYDES_KETONES", "7405.ORG", "Aldehydes and ketones", "3.3.8", p2, 380, true),
    topic("7405.ORG.CARBOXYLIC_ACIDS", "7405.ORG", "Carboxylic acids and derivatives", "3.3.9", p2, 390, true),
    topic("7405.ORG.AROMATIC_CHEMISTRY", "7405.ORG", "Aromatic chemistry", "3.3.10", p2, 400, true),
    topic("7405.ORG.AMINES", "7405.ORG", "Amines", "3.3.11", p2, 410, true),
    topic("7405.ORG.POLYMERS", "7405.ORG", "Polymers", "3.3.12", p2, 420, true),
    topic("7405.ORG.AMINO_ACIDS_PROTEINS_DNA", "7405.ORG", "Amino acids, proteins and DNA", "3.3.13", p2, 430, true),
    topic("7405.ORG.ORGANIC_SYNTHESIS", "7405.ORG", "Organic synthesis", "3.3.14", p2, 440, true),
    topic("7405.ORG.NMR", "7405.ORG", "Nuclear magnetic resonance spectroscopy", "3.3.15", p2, 450, true),
    topic("7405.ORG.CHROMATOGRAPHY", "7405.ORG", "Chromatography", "3.3.16", p2, 460, true),

    module("7405.PRACTICAL", "Required practicals and mathematical skills", "Appendix", p3, 900),
  ],
};

function module(code: string, name: string, ref: string, paper: typeof p1, sortOrder: number) {
  return { code, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "module" as const, sortOrder };
}

function topic(
  code: string,
  parentCode: string,
  name: string,
  ref: string,
  paper: typeof p1,
  sortOrder: number,
  isOptional = false,
) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder, isOptional };
}
