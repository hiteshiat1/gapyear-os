export type Subject = {
  id: string;
  name: string;
  shortName: string;
  examBoard: string | null;
  specificationCode: string | null;
  specificationOptions: string | null;
  achievedGrade: string | null;
  targetGrade: string | null;
  schoolPredictedGrade: string | null;
  estimatedGrade: string | null;
  latestMockGrade: string | null;
  syllabusCompletion: number;
  active: boolean;
  studyHoursThisWeek: number;
  weakTopicCount: number;
  nextAction: string;
};

export type Topic = {
  id: string;
  subjectId: string;
  name: string;
  status: TopicStatus;
  confidence: number | null;
  accuracy: number | null;
  errorCount: number;
  lastRevised: string | null;
  priority: TopicPriority;
  notes: string | null;
  tutorFeedback: string | null;
};

export type TopicStatus =
  | "Not Started"
  | "Learning"
  | "Revised"
  | "Practice Required"
  | "Exam Ready"
  | "Mastered";

export type TopicPriority = "Low" | "Medium" | "High" | "Critical";

export type DailyPlan = {
  id: string;
  planDate: string;
  energy: number | null;
  focus: number | null;
  motivation: number | null;
  sleepHours: number | null;
  academicGoal: string | null;
  personalGoal: string | null;
  totalFocusedHours: number | null;
  eveningReflection: Record<string, unknown> | null;
  tasks: DailyTask[];
};

export type DailyTask = {
  id: string;
  dailyPlanId: string;
  subjectId: string | null;
  syllabusTopicId?: string | null;
  task: string;
  category: string;
  topic: string | null;
  startsAt: string | null;
  endsAt: string | null;
  estimatedDuration: number | null;
  actualDuration: number | null;
  status: DailyTaskStatus;
  reason?: string | null;
  priorityScore?: number | null;
  source?: string | null;
  difficulty: number | null;
  confidenceBefore: number | null;
  confidenceAfter: number | null;
  notes: string | null;
};

export type DailyTaskStatus =
  | "Planned"
  | "In Progress"
  | "Complete"
  | "Missed"
  | "Rescheduled";

export type StudySession = {
  id: string;
  subjectId: string | null;
  topicId: string | null;
  sessionDate: string;
  durationHours: number;
  sessionType: string;
  notes: string | null;
};

export type Exam = {
  id: string;
  subjectId: string;
  paperCode?: string | null;
  paperSection?: string | null;
  examType: string;
  examBoard: string | null;
  paper: string;
  paperYear: string | null;
  completedOn: string;
  durationMinutes: number | null;
  timed: boolean;
  rawMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string | null;
  targetGrade: string | null;
  nextBoundary: number | null;
  targetBoundary: number | null;
  timeRemainingMinutes: number | null;
  cycleStatus: PaperCycleStatus;
  notes: string | null;
};

export type PaperCycleStatus =
  | "Needs marking"
  | "Needs error review"
  | "Corrections scheduled"
  | "Complete";

export type ExamError = {
  id: string;
  examId: string | null;
  subjectId: string;
  topicId: string | null;
  syllabusTopicId?: string | null;
  topicName: string | null;
  paperName: string | null;
  errorDate: string;
  questionNumber: string | null;
  marksAvailable: number | null;
  marksLost: number;
  category: string;
  description: string | null;
  correctApproach: string | null;
  lessonLearned: string | null;
  correctiveAction: string | null;
  retestDate: string | null;
  retestResult: string | null;
  resolved: boolean;
  resolvedAt: string | null;
};

export type SyllabusTopic = {
  id: string;
  subjectId: string;
  parentTopicId: string | null;
  stableCode: string;
  name: string;
  specificationCode: string;
  specificationRef: string;
  paperCode: string;
  paperName: string;
  topicLevel: "module" | "topic" | "subtopic" | "skill";
  sortOrder: number;
  isOptional: boolean;
  active: boolean;
};

export type TopicProgress = {
  id: string;
  ownerId: string;
  syllabusTopicId: string;
  status: TopicStatus;
  confidence: number | null;
  accuracy: number | null;
  priority: TopicPriority;
  lastRevised: string | null;
  notes: string | null;
  tutorFeedback: string | null;
  retestDate: string | null;
  tutorFlag: boolean;
};

export type TopicDiagnostic = {
  id: string;
  ownerId: string;
  subjectId: string;
  syllabusTopicId: string;
  diagnosticDate: string;
  questionsAttempted: number | null;
  correct: number | null;
  marksScored: number;
  marksAvailable: number;
  percentage: number;
  confidenceBefore: number | null;
  confidenceAfter: number | null;
  notes: string | null;
};

export type TopicWithProgress = {
  topic: SyllabusTopic;
  progress: TopicProgress | null;
  priorityScore: number;
  priorityLabel: TopicPriority;
  priorityReasons: string[];
  unresolvedErrors: number;
  marksLost: number;
};

export type Tutor = {
  id: string;
  name: string;
  subjectId: string | null;
  contact: string | null;
  frequency: string | null;
  lessonDurationMinutes: number | null;
  notes: string | null;
};

export type TutorSession = {
  id: string;
  tutorId: string;
  subjectId: string | null;
  sessionDate: string;
  topicsCovered: string | null;
  problemsIdentified: string | null;
  recommendations: string | null;
  homeworkAssigned: string | null;
  homeworkCompleted: boolean;
  confidenceBefore: number | null;
  confidenceAfter: number | null;
};

export type TutorQuestion = {
  id: string;
  subjectId: string | null;
  question: string;
  status: "Unanswered" | "Answered" | "Needs Practice" | "Resolved";
  createdAt: string;
  resolvedAt: string | null;
};

export type Goal = {
  id: string;
  timeframe: "Annual" | "Monthly" | "Weekly";
  area: string;
  title: string;
  target: string | null;
  progress: number;
  status: string;
  startDate: string | null;
  targetDate: string | null;
  notes: string | null;
};

export type JournalEntry = {
  id: string;
  entryDate: string;
  sections: Record<string, string>;
  tags: string[];
  publishToPortfolio: boolean;
};

export type Project = {
  id: string;
  title: string;
  problem: string | null;
  description: string | null;
  whyItMatters: string | null;
  technologies: string[];
  engineeringConcepts: string[];
  status: string;
  startedOn: string | null;
  endedOn: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  publishToPortfolio: boolean;
};

export type ProjectLog = {
  id: string;
  projectId: string;
  logDate: string;
  objective: string | null;
  testPerformed: string | null;
  result: string | null;
  unexpectedBehaviour: string | null;
  hypothesis: string | null;
  modification: string | null;
  lesson: string | null;
};

export type StartupExperience = {
  id: string;
  company: string | null;
  mentor: string | null;
  startsOn: string | null;
  endsOn: string | null;
  department: string | null;
  objectives: string | null;
};

export type StartupLog = {
  id: string;
  startupExperienceId: string;
  logDate: string;
  activity: string;
  technicalLearning: string | null;
  businessLearning: string | null;
  peopleWorkedWith: string | null;
  hours: number | null;
  evidenceUrl: string | null;
  reflection: string | null;
};

export type StartupProblem = {
  id: string;
  startupExperienceId: string;
  problem: string;
  whoExperiencesIt: string | null;
  frequency: string | null;
  impact: string | null;
  existingSolution: string | null;
  possibleImprovement: string | null;
  status: string;
};

export type Event = {
  id: string;
  eventName: string;
  eventDate: string | null;
  venue: string | null;
  topic: string | null;
  speakers: string | null;
  peopleMet: string | null;
  company: string | null;
  notes: string | null;
  reflection: Record<string, string> | null;
  publishToPortfolio: boolean;
};

export type Contact = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  whereMet: string | null;
  metOn: string | null;
  linkedinUrl: string | null;
  email: string | null;
  topicsDiscussed: string | null;
  followUp: string | null;
  nextAction: string | null;
};

export type LearningResource = {
  id: string;
  title: string;
  url: string | null;
  category: string | null;
  subject: string | null;
  whySaved: string | null;
  completed: boolean;
  keyTakeaway: string | null;
};

export type WeeklyReview = {
  id: string;
  weekStart: string;
  review: Record<string, unknown>;
};

export type MonthlyReview = {
  id: string;
  monthStart: string;
  review: Record<string, unknown>;
};

export type PortfolioItem = {
  id: string;
  itemType: string;
  sourceId: string | null;
  title: string;
  summary: string | null;
  visibility: "private" | "public";
};

export type Skill = {
  id: string;
  name: string;
  category: string | null;
  evidence: string | null;
  acquired: boolean;
};

export type ActivityHistory = {
  id: string;
  entityType: string;
  entityId: string | null;
  action: string;
  fieldName: string | null;
  oldValue: unknown;
  newValue: unknown;
  metadata: Record<string, unknown> | null;
  changedAt: string;
};

export type WeeklySnapshot = {
  id: string;
  weekStart: string;
  weekEnd: string;
  subjectMetrics: Record<string, unknown>;
  studyMetrics: Record<string, unknown>;
  examMetrics: Record<string, unknown>;
  errorMetrics: Record<string, unknown>;
  projectMetrics: Record<string, unknown>;
};

export type InterestProfile = {
  id: string;
  broadInterests: string[];
  freeText: string | null;
};

export type CourseInterest = {
  id: string;
  courseName: string;
  interestLevel: number;
  reason: string | null;
};

export type UniversityChoiceStatus =
  | "exploring"
  | "shortlist"
  | "aspirational"
  | "realistic"
  | "safety"
  | "applied"
  | "offer"
  | "rejected"
  | "withdrawn";

export type UniversityChoice = {
  id: string;
  university: string;
  course: string;
  entryYear: string | null;
  typicalEntryRequirements: string | null;
  requiredSubjects: string | null;
  contextualRequirements: string | null;
  admissionsTests: string | null;
  interestLevel: number;
  status: UniversityChoiceStatus;
  notes: string | null;
  sourceUrl: string | null;
  lastChecked: string | null;
};

export type CareerFamily = {
  id: string;
  name: string;
  description: string | null;
  exampleRoles: string[];
  skills: string[];
  typicalDegreeRoutes: string[];
};

export type StudentCareerInterest = {
  id: string;
  careerFamilyId: string;
  interestLevel: number;
  reason: string | null;
  status: string;
};

export type EvidenceLink = {
  id: string;
  sourceType: string;
  sourceId: string | null;
  courseInterestId: string | null;
  universityChoiceId: string | null;
  careerFamilyId: string | null;
  skills: string[];
  ucasCategory: string | null;
  reflectionStrength: string | null;
};

export type FutureMapNode = {
  id: string;
  nodeType: string;
  label: string;
  detail: string | null;
};

export type FutureMapColumn = {
  title: string;
  nodes: FutureMapNode[];
};
