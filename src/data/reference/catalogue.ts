export type ReferenceSubject = {
  slug: string;
  name: string;
  category: string;
  topicSupportStatus: "full" | "coming_soon" | "not_planned";
  sourceName: string;
  sourceUrl: string;
};

export type ReferenceExamBoard = {
  code: string;
  name: string;
  officialName: string;
  countryScope: string;
  websiteUrl: string;
  sourceName: string;
  sourceUrl: string;
};

export type ReferenceSpecification = {
  boardCode: string;
  subjectSlug: string;
  specificationCode: string;
  specificationName: string;
  versionName?: string;
  teachingFrom?: string;
  firstExam?: string;
  topicSupportStatus: "full" | "coming_soon" | "not_planned";
  officialSourceUrl: string;
  options?: ReferenceSpecificationOption[];
  papers?: ReferencePaper[];
};

export type ReferenceSpecificationOption = {
  code: string;
  name: string;
  optionGroup?: string;
  requiredOrOptional: "required" | "optional";
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
};

export type ReferencePaper = {
  code: string;
  name: string;
  componentType: string;
  weighting?: number | null;
  durationMinutes?: number | null;
  maxMarks?: number | null;
  sortOrder: number;
};

const govSource = "https://www.gov.uk/government/collections/new-a-level-and-as-level-qualifications-requirements-and-guidance";
const saveMyExamsSource = "https://www.savemyexams.com/learning-hub/a-level-choices/a-level-subjects-explained/";
const pearsonSource = "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels.html";
const aqaSource = "https://www.aqa.org.uk/subjects";

export const referenceExamBoards: ReferenceExamBoard[] = [
  {
    code: "AQA",
    name: "AQA",
    officialName: "Assessment and Qualifications Alliance",
    countryScope: "England",
    websiteUrl: "https://www.aqa.org.uk/subjects",
    sourceName: "AQA official subjects",
    sourceUrl: aqaSource,
  },
  {
    code: "EDEXCEL",
    name: "Pearson Edexcel",
    officialName: "Pearson Edexcel",
    countryScope: "England",
    websiteUrl: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels.html",
    sourceName: "Pearson Edexcel A levels",
    sourceUrl: pearsonSource,
  },
];

export const referenceSubjects: ReferenceSubject[] = [
  subject("accounting", "Accounting", "Business & Economics"),
  subject("ancient-history", "Ancient History", "Humanities"),
  subject("ancient-languages", "Ancient Languages", "Languages"),
  subject("art-and-design", "Art and Design", "Creative / Performing Arts"),
  subject("business", "Business", "Business & Economics"),
  subject("classical-civilisation", "Classical Civilisation", "Humanities"),
  subject("computer-science", "Computer Science", "Computing / Technology", "full"),
  subject("dance", "Dance", "Creative / Performing Arts"),
  subject("design-and-technology", "Design and Technology", "Design / Technical"),
  subject("drama-and-theatre", "Drama and Theatre", "Creative / Performing Arts"),
  subject("economics", "Economics", "Business & Economics", "full"),
  subject("electronics", "Electronics", "Design / Technical"),
  subject("english-language", "English Language", "English"),
  subject("english-language-and-literature", "English Language and Literature", "English"),
  subject("english-literature", "English Literature", "English", "full"),
  subject("environmental-science", "Environmental Science", "Sciences"),
  subject("film-studies", "Film Studies", "Creative / Performing Arts"),
  subject("geography", "Geography", "Humanities"),
  subject("geology", "Geology", "Sciences"),
  subject("history", "History", "Humanities"),
  subject("history-of-art", "History of Art", "Creative / Performing Arts"),
  subject("law", "Law", "Social Sciences"),
  subject("mathematics", "Mathematics", "Mathematics", "full"),
  subject("further-mathematics", "Further Mathematics", "Mathematics", "full"),
  subject("media-studies", "Media Studies", "Creative / Performing Arts"),
  subject("modern-foreign-languages", "Modern Foreign Languages", "Languages"),
  subject("music", "Music", "Creative / Performing Arts"),
  subject("music-technology", "Music Technology", "Creative / Performing Arts"),
  subject("philosophy", "Philosophy", "Humanities"),
  subject("physical-education", "Physical Education", "Other"),
  subject("politics", "Politics", "Social Sciences"),
  subject("psychology", "Psychology", "Social Sciences"),
  subject("religious-studies", "Religious Studies", "Humanities"),
  subject("biology", "Biology", "Sciences", "full"),
  subject("chemistry", "Chemistry", "Sciences", "full"),
  subject("physics", "Physics", "Sciences", "full"),
  subject("sociology", "Sociology", "Social Sciences"),
  subject("statistics", "Statistics", "Mathematics"),
];

export const referenceSpecifications: ReferenceSpecification[] = [
  specification("EDEXCEL", "mathematics", "9MA0", "A Level Mathematics", "full", pearsonSource, [
    paper("9MA0-01", "Pure Mathematics 1", 1),
    paper("9MA0-02", "Pure Mathematics 2", 2),
    paper("9MA0-03", "Statistics and Mechanics", 3),
  ]),
  specification("EDEXCEL", "further-mathematics", "9FM0", "A Level Further Mathematics", "full", pearsonSource, [
    paper("9FM0-01", "Core Pure Mathematics 1", 1),
    paper("9FM0-02", "Core Pure Mathematics 2", 2),
    paper("9FM0-3A-3D", "Optional Applications", 3),
  ], [
    option("3A", "Further Pure Mathematics 1", "Optional Paper 3", 1),
    option("3B", "Further Statistics 1", "Optional Paper 3", 2),
    option("3C", "Further Mechanics 1", "Optional Paper 3", 3),
    option("3D", "Decision Mathematics 1", "Optional Paper 3", 4),
  ]),
  specification("AQA", "mathematics", "7357", "A Level Mathematics", "full", aqaSource),
  specification("AQA", "further-mathematics", "7367", "A Level Further Mathematics", "full", aqaSource),
  specification("AQA", "physics", "7408", "A Level Physics", "full", aqaSource, [
    paper("7408-1", "Paper 1", 1),
    paper("7408-2", "Paper 2", 2),
    paper("7408-3", "Paper 3", 3),
  ], [
    option("A", "Astrophysics", "Paper 3 optional topic", 1),
    option("B", "Medical physics", "Paper 3 optional topic", 2),
    option("C", "Engineering physics", "Paper 3 optional topic", 3),
    option("D", "Turning points in physics", "Paper 3 optional topic", 4),
    option("E", "Electronics", "Paper 3 optional topic", 5),
  ]),
  specification("EDEXCEL", "physics", "9PH0", "A Level Physics", "full", pearsonSource),
  specification("AQA", "biology", "7402", "A Level Biology", "full", aqaSource),
  specification("EDEXCEL", "biology", "9BI0", "A Level Biology A", "full", pearsonSource),
  specification("AQA", "chemistry", "7405", "A Level Chemistry", "full", aqaSource),
  specification("EDEXCEL", "chemistry", "9CH0", "A Level Chemistry", "full", pearsonSource),
  specification("AQA", "computer-science", "7517", "A Level Computer Science", "full", aqaSource),
  specification("EDEXCEL", "computer-science", "9CP0", "A Level Computer Science", "full", pearsonSource),
  specification("AQA", "economics", "7136", "A Level Economics", "full", aqaSource),
  specification("EDEXCEL", "economics", "9EC0", "A Level Economics A", "full", pearsonSource),
  specification("AQA", "english-literature", "7712", "A Level English Literature A", "full", aqaSource),
  specification("EDEXCEL", "english-literature", "9ET0", "A Level English Literature", "full", pearsonSource),
  specification("AQA", "environmental-science", "7447", "A Level Environmental Science", "coming_soon", aqaSource),
  specification("AQA", "psychology", "7182", "A Level Psychology", "coming_soon", aqaSource),
  specification("EDEXCEL", "business", "9BS0", "A Level Business", "coming_soon", pearsonSource),
  specification("AQA", "business", "7132", "A Level Business", "coming_soon", aqaSource),
];

export const gradeScale = [
  { grade: "A*", rank: 6, isPass: true, isTargetSelectable: true },
  { grade: "A", rank: 5, isPass: true, isTargetSelectable: true },
  { grade: "B", rank: 4, isPass: true, isTargetSelectable: true },
  { grade: "C", rank: 3, isPass: true, isTargetSelectable: true },
  { grade: "D", rank: 2, isPass: true, isTargetSelectable: true },
  { grade: "E", rank: 1, isPass: true, isTargetSelectable: true },
  { grade: "U", rank: 0, isPass: false, isTargetSelectable: false },
];

function subject(
  slug: string,
  name: string,
  category: string,
  topicSupportStatus: ReferenceSubject["topicSupportStatus"] = "coming_soon",
): ReferenceSubject {
  return {
    slug,
    name,
    category,
    topicSupportStatus,
    sourceName: "GOV.UK Ofqual subject requirements; Save My Exams cross-check",
    sourceUrl: slug === "archaeology" ? saveMyExamsSource : govSource,
  };
}

function specification(
  boardCode: string,
  subjectSlug: string,
  specificationCode: string,
  specificationName: string,
  topicSupportStatus: ReferenceSpecification["topicSupportStatus"],
  officialSourceUrl: string,
  papers: ReferencePaper[] = [],
  options: ReferenceSpecificationOption[] = [],
): ReferenceSpecification {
  return {
    boardCode,
    subjectSlug,
    specificationCode,
    specificationName,
    teachingFrom: "2015+",
    topicSupportStatus,
    officialSourceUrl,
    papers,
    options,
  };
}

function paper(code: string, name: string, sortOrder: number): ReferencePaper {
  return { code, name, componentType: "paper", sortOrder };
}

function option(code: string, name: string, optionGroup: string, sortOrder: number): ReferenceSpecificationOption {
  return {
    code,
    name,
    optionGroup,
    requiredOrOptional: "optional",
    minSelect: 0,
    maxSelect: 1,
    sortOrder,
  };
}
