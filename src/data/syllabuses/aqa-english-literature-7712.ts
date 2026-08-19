import type { SyllabusDefinition } from "./types";

const c1 = { code: "7712-1", name: "Paper 1 - Love Through the Ages" };
const c2 = { code: "7712-2", name: "Paper 2 - Texts in Shared Contexts" };
const nea = { code: "7712-NEA", name: "Non-exam assessment - Independent Critical Study: Texts Across Time" };

export const aqaEnglishLiterature7712: SyllabusDefinition = {
  key: "aqa-english-literature-7712",
  subjectName: "English Literature (AQA)",
  shortName: "Eng Lit (AQA)",
  examBoard: "AQA",
  specificationCode: "7712",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [c1, c2, nea],
  topics: [
    module("7712.PAPER1", "Love through the ages", "Paper 1", c1, 1),
    topic("7712.PAPER1.SHAKESPEARE", "7712.PAPER1", "Shakespeare set text", "Paper 1 Section A", c1, 10),
    topic("7712.PAPER1.PROSE", "7712.PAPER1", "Prose set text", "Paper 1 Section B", c1, 20),
    topic("7712.PAPER1.UNSEEN_POETRY", "7712.PAPER1", "Unseen poetry", "Paper 1 Section C", c1, 30),

    module("7712.PAPER2", "Texts in shared contexts", "Paper 2", c2, 200),
    topic("7712.PAPER2.WW1_OR_MODERN", "7712.PAPER2", "Set texts: WW1 and its aftermath, or Modern times (1945-present)", "Paper 2 Section A/B", c2, 210),
    topic("7712.PAPER2.COMPARATIVE_ESSAY", "7712.PAPER2", "Comparative and contextual essay writing", "Paper 2 Section C", c2, 220),

    module("7712.NEA", "Independent critical study: texts across time", "NEA", nea, 300),
    topic("7712.NEA.COMPARATIVE_STUDY", "7712.NEA", "Comparative critical study of two texts on a chosen theme", "NEA", nea, 310),
  ],
};

function module(code: string, name: string, ref: string, paper: typeof c1, sortOrder: number) {
  return { code, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "module" as const, sortOrder };
}

function topic(code: string, parentCode: string, name: string, ref: string, paper: typeof c1, sortOrder: number) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder };
}
