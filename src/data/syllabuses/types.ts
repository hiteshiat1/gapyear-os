export type SyllabusSubjectKey = "maths-9ma0" | "further-maths-9fm0-e0" | "physics-7408c";

export type SyllabusDefinition = {
  key: SyllabusSubjectKey;
  subjectName: string;
  shortName: string;
  examBoard: string;
  specificationCode: string;
  optionCode?: string;
  achievedGrade: string;
  targetGrade: string;
  papers: Array<{
    code: string;
    name: string;
  }>;
  topics: SyllabusTopicDefinition[];
};

export type SyllabusTopicDefinition = {
  code: string;
  parentCode?: string;
  name: string;
  specificationRef: string;
  paperCode: string;
  paperName: string;
  topicLevel: "module" | "topic" | "subtopic" | "skill";
  sortOrder: number;
  isOptional?: boolean;
  active?: boolean;
};
