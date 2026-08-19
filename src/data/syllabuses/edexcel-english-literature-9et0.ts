import type { SyllabusDefinition } from "./types";

const c1 = { code: "9ET0-01", name: "Component 1 - Drama" };
const c2 = { code: "9ET0-02", name: "Component 2 - Prose" };
const c3 = { code: "9ET0-03", name: "Component 3 - Poetry" };
const c4 = { code: "9ET0-04", name: "Component 4 - Non-Examination Assessment" };

export const edexcelEnglishLiterature9ET0: SyllabusDefinition = {
  key: "edexcel-english-literature-9et0",
  subjectName: "English Literature (Edexcel)",
  shortName: "Eng Lit (Edexcel)",
  examBoard: "Pearson Edexcel",
  specificationCode: "9ET0",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [c1, c2, c3, c4],
  topics: [
    module("9ET0.DRAMA", "Drama", "Component 1", c1, 1),
    topic("9ET0.DRAMA.SHAKESPEARE", "9ET0.DRAMA", "Shakespeare play (tragedy or comedy)", "Component 1 Section A", c1, 10),
    topic("9ET0.DRAMA.OTHER_DRAMA", "9ET0.DRAMA", "Second drama text", "Component 1 Section B", c1, 20),

    module("9ET0.PROSE", "Prose", "Component 2", c2, 200),
    topic("9ET0.PROSE.SET_TEXT", "9ET0.PROSE", "Prose set text critical analysis", "Component 2", c2, 210),

    module("9ET0.POETRY", "Poetry", "Component 3", c3, 300),
    topic("9ET0.POETRY.ANTHOLOGY", "9ET0.POETRY", "Poetry anthology", "Component 3 Section A", c3, 310),
    topic("9ET0.POETRY.UNSEEN", "9ET0.POETRY", "Unseen poetry comparison", "Component 3 Section B", c3, 320),

    module("9ET0.NEA", "Non-examination assessment", "Component 4", c4, 400),
    topic("9ET0.NEA.COMPARATIVE_STUDY", "9ET0.NEA", "Comparative critical study of two texts", "Component 4", c4, 410),
  ],
};

function module(code: string, name: string, ref: string, paper: typeof c1, sortOrder: number) {
  return { code, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "module" as const, sortOrder };
}

function topic(code: string, parentCode: string, name: string, ref: string, paper: typeof c1, sortOrder: number) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder };
}
