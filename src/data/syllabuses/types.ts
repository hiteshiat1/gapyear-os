export type SyllabusSubjectKey =
  | "maths-9ma0"
  | "further-maths-9fm0-e0"
  | "physics-7408c"
  | "aqa-maths-7357"
  | "aqa-further-maths-7367"
  | "edexcel-physics-9ph0"
  | "aqa-biology-7402"
  | "edexcel-biology-9bi0"
  | "aqa-chemistry-7405"
  | "edexcel-chemistry-9ch0"
  | "aqa-computer-science-7517"
  | "edexcel-computer-science-9cp0"
  | "aqa-economics-7136"
  | "edexcel-economics-9ec0"
  | "aqa-english-literature-7712"
  | "edexcel-english-literature-9et0";

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
