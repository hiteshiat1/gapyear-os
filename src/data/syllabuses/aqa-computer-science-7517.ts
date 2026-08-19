import type { SyllabusDefinition } from "./types";

const p1 = { code: "7517-1", name: "Paper 1 - On-screen exam" };
const p2 = { code: "7517-2", name: "Paper 2" };
const nea = { code: "7517-NEA", name: "Non-exam assessment - Computing practical project" };

export const aqaComputerScience7517: SyllabusDefinition = {
  key: "aqa-computer-science-7517",
  subjectName: "Computer Science (AQA)",
  shortName: "CS (AQA)",
  examBoard: "AQA",
  specificationCode: "7517",
  achievedGrade: "C",
  targetGrade: "A",
  papers: [p1, p2, nea],
  topics: [
    topic("7517.4.1", undefined, "Fundamentals of programming", "4.1", p1, 10),
    topic("7517.4.2", undefined, "Fundamentals of data structures", "4.2", p1, 20),
    topic("7517.4.3", undefined, "Fundamentals of algorithms", "4.3", p1, 30),
    topic("7517.4.4", undefined, "Theory of computation", "4.4", p1, 40),
    topic("7517.4.5", undefined, "Fundamentals of data representation", "4.5", p2, 50),
    topic("7517.4.6", undefined, "Fundamentals of computer systems", "4.6", p2, 60),
    topic("7517.4.7", undefined, "Fundamentals of computer organisation and architecture", "4.7", p2, 70),
    topic("7517.4.8", undefined, "Consequences of uses of computing", "4.8", p2, 80),
    topic("7517.4.9", undefined, "Fundamentals of communication and networking", "4.9", p2, 90),
    topic("7517.4.10", undefined, "Fundamentals of databases", "4.10", p2, 100),
    topic("7517.4.11", undefined, "Big Data", "4.11", p2, 110),
    topic("7517.4.12", undefined, "Fundamentals of functional programming", "4.12", p2, 120, true),
    topic("7517.4.13", undefined, "Systematic approach to problem solving", "4.13", p2, 130),
    topic("7517.4.14", undefined, "Non-exam assessment: the computing practical project", "4.14", nea, 900),
  ],
};

function topic(
  code: string,
  parentCode: string | undefined,
  name: string,
  ref: string,
  paper: typeof p1,
  sortOrder: number,
  isOptional = false,
) {
  return { code, parentCode, name, specificationRef: ref, paperCode: paper.code, paperName: paper.name, topicLevel: "topic" as const, sortOrder, isOptional };
}
