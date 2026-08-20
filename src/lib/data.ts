export type SubjectId = "maths" | "further-maths" | "physics" | "economics";

export type Subject = {
  id: SubjectId;
  name: string;
  shortName: string;
  currentGrade: string;
  targetGrade: string;
  estimatedGrade: string;
  latestMockGrade: string;
  syllabusCompletion: number;
  studyHoursThisWeek: number;
  weakTopicCount: number;
  nextAction: string;
  active: boolean;
};

export type Topic = {
  id: string;
  subjectId: SubjectId;
  name: string;
  status:
    | "Not Started"
    | "Learning"
    | "Revised"
    | "Practice Required"
    | "Exam Ready"
    | "Mastered";
  confidence: number;
  accuracy: number;
  errors: number;
  lastRevised: string;
  priority: "Low" | "Medium" | "High" | "Critical";
};

export type DailyTask = {
  id: string;
  time: string;
  task: string;
  category: string;
  subjectId?: SubjectId;
  topic: string;
  plannedHours: number;
  actualHours: number;
  status: "Planned" | "In Progress" | "Complete" | "Missed" | "Rescheduled";
  difficulty: number;
  confidenceBefore: number;
  confidenceAfter: number;
};

export type Exam = {
  id: string;
  subjectId: SubjectId;
  title: string;
  date: string;
  paper: string;
  rawMarks: number;
  maxMarks: number;
  grade: string;
  targetGrade: string;
  nextBoundary: number;
  targetBoundary: number;
  cycleStatus: "Needs marking" | "Needs error review" | "Corrections scheduled" | "Complete";
};

export type ErrorEntry = {
  id: string;
  date: string;
  subjectId: SubjectId;
  topic: string;
  paper: string;
  question: string;
  marksLost: number;
  category: string;
  lesson: string;
  resolved: boolean;
};

export const subjects: Subject[] = [
  {
    id: "maths",
    name: "Mathematics",
    shortName: "Maths",
    currentGrade: "B",
    targetGrade: "A*",
    estimatedGrade: "A",
    latestMockGrade: "A",
    syllabusCompletion: 68,
    studyHoursThisWeek: 7.5,
    weakTopicCount: 4,
    nextAction: "Timed integration questions",
    active: true,
  },
  {
    id: "further-maths",
    name: "Further Mathematics",
    shortName: "FM",
    currentGrade: "C",
    targetGrade: "A",
    estimatedGrade: "B",
    latestMockGrade: "B",
    syllabusCompletion: 54,
    studyHoursThisWeek: 6,
    weakTopicCount: 6,
    nextAction: "Complex numbers relearn",
    active: true,
  },
  {
    id: "physics",
    name: "Physics",
    shortName: "Physics",
    currentGrade: "D",
    targetGrade: "A",
    estimatedGrade: "C",
    latestMockGrade: "C",
    syllabusCompletion: 47,
    studyHoursThisWeek: 8,
    weakTopicCount: 8,
    nextAction: "Electric fields review",
    active: true,
  },
  {
    id: "economics",
    name: "Economics",
    shortName: "Econ",
    currentGrade: "B",
    targetGrade: "B",
    estimatedGrade: "B",
    latestMockGrade: "B",
    syllabusCompletion: 100,
    studyHoursThisWeek: 0,
    weakTopicCount: 0,
    nextAction: "Retained unless enabled",
    active: false,
  },
];

export const topics: Topic[] = [
  {
    id: "t1",
    subjectId: "physics",
    name: "Electric Fields",
    status: "Practice Required",
    confidence: 2,
    accuracy: 48,
    errors: 7,
    lastRevised: "2026-08-11",
    priority: "Critical",
  },
  {
    id: "t2",
    subjectId: "physics",
    name: "Electromagnetic Induction",
    status: "Learning",
    confidence: 2,
    accuracy: 41,
    errors: 6,
    lastRevised: "2026-08-04",
    priority: "Critical",
  },
  {
    id: "t3",
    subjectId: "physics",
    name: "Materials",
    status: "Exam Ready",
    confidence: 4,
    accuracy: 82,
    errors: 1,
    lastRevised: "2026-08-15",
    priority: "Medium",
  },
  {
    id: "t4",
    subjectId: "maths",
    name: "Integration",
    status: "Practice Required",
    confidence: 3,
    accuracy: 67,
    errors: 4,
    lastRevised: "2026-08-13",
    priority: "High",
  },
  {
    id: "t5",
    subjectId: "maths",
    name: "Parametric Equations",
    status: "Exam Ready",
    confidence: 4,
    accuracy: 84,
    errors: 1,
    lastRevised: "2026-08-14",
    priority: "Medium",
  },
  {
    id: "t6",
    subjectId: "further-maths",
    name: "Complex Numbers",
    status: "Learning",
    confidence: 2,
    accuracy: 52,
    errors: 5,
    lastRevised: "2026-08-10",
    priority: "Critical",
  },
  {
    id: "t7",
    subjectId: "further-maths",
    name: "Matrices",
    status: "Revised",
    confidence: 3,
    accuracy: 71,
    errors: 2,
    lastRevised: "2026-08-12",
    priority: "High",
  },
];

export const dailyTasks: DailyTask[] = [
  {
    id: "d1",
    time: "07:30-09:30",
    task: "Physics focused block",
    category: "Academic",
    subjectId: "physics",
    topic: "Electric Fields",
    plannedHours: 2,
    actualHours: 1.75,
    status: "In Progress",
    difficulty: 4,
    confidenceBefore: 2,
    confidenceAfter: 3,
  },
  {
    id: "d2",
    time: "09:45-11:45",
    task: "Mathematics timed practice",
    category: "Academic",
    subjectId: "maths",
    topic: "Integration",
    plannedHours: 2,
    actualHours: 0,
    status: "Planned",
    difficulty: 3,
    confidenceBefore: 3,
    confidenceAfter: 3,
  },
  {
    id: "d3",
    time: "12:00-14:00",
    task: "Further Maths relearn",
    category: "Academic",
    subjectId: "further-maths",
    topic: "Complex Numbers",
    plannedHours: 2,
    actualHours: 0,
    status: "Planned",
    difficulty: 4,
    confidenceBefore: 2,
    confidenceAfter: 2,
  },
  {
    id: "d4",
    time: "16:30-17:15",
    task: "Project note",
    category: "Project",
    topic: "Update project log",
    plannedHours: 0.75,
    actualHours: 0,
    status: "Planned",
    difficulty: 2,
    confidenceBefore: 3,
    confidenceAfter: 3,
  },
];

export const exams: Exam[] = [
  {
    id: "e1",
    subjectId: "physics",
    title: "Physics Paper 1",
    date: "2026-08-15",
    paper: "AQA 2023 Paper 1",
    rawMarks: 63,
    maxMarks: 100,
    grade: "B",
    targetGrade: "A",
    nextBoundary: 68,
    targetBoundary: 68,
    cycleStatus: "Needs error review",
  },
  {
    id: "e2",
    subjectId: "maths",
    title: "Mathematics Pure",
    date: "2026-08-13",
    paper: "Edexcel 2022 Pure 1",
    rawMarks: 78,
    maxMarks: 100,
    grade: "A",
    targetGrade: "A*",
    nextBoundary: 84,
    targetBoundary: 84,
    cycleStatus: "Complete",
  },
  {
    id: "e3",
    subjectId: "further-maths",
    title: "Further Maths Core Pure",
    date: "2026-08-12",
    paper: "Edexcel 2021 CP1",
    rawMarks: 69,
    maxMarks: 100,
    grade: "B",
    targetGrade: "A",
    nextBoundary: 75,
    targetBoundary: 75,
    cycleStatus: "Corrections scheduled",
  },
];

export const errorEntries: ErrorEntry[] = [
  {
    id: "err1",
    date: "2026-08-15",
    subjectId: "physics",
    topic: "Electric Fields",
    paper: "Physics Paper 1",
    question: "Q7",
    marksLost: 4,
    category: "Conceptual Error",
    lesson: "Field strength direction must be linked to force on positive charge.",
    resolved: false,
  },
  {
    id: "err2",
    date: "2026-08-15",
    subjectId: "physics",
    topic: "Electric Fields",
    paper: "Physics Paper 1",
    question: "Q8",
    marksLost: 3,
    category: "Missing Working",
    lesson: "Write substitution before final answer for multi-step calculations.",
    resolved: false,
  },
  {
    id: "err3",
    date: "2026-08-13",
    subjectId: "maths",
    topic: "Integration",
    paper: "Mathematics Pure",
    question: "Q10",
    marksLost: 2,
    category: "Mathematical Error",
    lesson: "Check signs after substitution in definite integration.",
    resolved: true,
  },
  {
    id: "err4",
    date: "2026-08-12",
    subjectId: "further-maths",
    topic: "Complex Numbers",
    paper: "Further Maths Core Pure",
    question: "Q5",
    marksLost: 5,
    category: "Knowledge Gap",
    lesson: "Review loci interpretation before another timed set.",
    resolved: false,
  },
  {
    id: "err5",
    date: "2026-08-11",
    subjectId: "physics",
    topic: "Electromagnetic Induction",
    paper: "Topic Test",
    question: "Q3",
    marksLost: 4,
    category: "Formula Recall",
    lesson: "Memorise Faraday and Lenz law wording with units.",
    resolved: false,
  },
];

export const weeklyStudy = [
  { day: "Mon", Physics: 2, Maths: 1.5, "Further Maths": 1 },
  { day: "Tue", Physics: 1.5, Maths: 2, "Further Maths": 2 },
  { day: "Wed", Physics: 2, Maths: 2, "Further Maths": 1.5 },
  { day: "Thu", Physics: 1, Maths: 2, "Further Maths": 2 },
  { day: "Fri", Physics: 2, Maths: 1, "Further Maths": 1.5 },
  { day: "Sat", Physics: 2.5, Maths: 1.5, "Further Maths": 1 },
  { day: "Sun", Physics: 0, Maths: 0, "Further Maths": 0 },
];

export const scoreTrend = [
  { date: "Jul 20", Physics: 48, Maths: 62, "Further Maths": 51 },
  { date: "Jul 27", Physics: 52, Maths: 66, "Further Maths": 56 },
  { date: "Aug 03", Physics: 58, Maths: 72, "Further Maths": 61 },
  { date: "Aug 10", Physics: 60, Maths: 75, "Further Maths": 66 },
  { date: "Aug 15", Physics: 63, Maths: 78, "Further Maths": 69 },
];

export const portfolioProjects = [
  {
    title: "EV Battery / Telemetry Monitor",
    status: "Discovery",
    problem: "Understand battery health, heat, and current draw during real operation.",
    tech: "ESP32, sensors, Python, dashboard",
    next: "Integrate current sensor",
  },
  {
    title: "Drone Telemetry System",
    status: "Candidate",
    problem: "Capture flight data that helps diagnose instability and sensor drift.",
    tech: "GPS, embedded software, telemetry",
    next: "Scope after EV project",
  },
];

export function subjectName(subjectId: SubjectId) {
  return subjects.find((subject) => subject.id === subjectId)?.shortName ?? subjectId;
}

export function examPercentage(exam: Exam) {
  return Math.round((exam.rawMarks / exam.maxMarks) * 100);
}

export function marksFromTarget(exam: Exam) {
  return Math.max(exam.targetBoundary - exam.rawMarks, 0);
}

export function readiness(subject: Subject) {
  const relatedErrors = errorEntries.filter(
    (entry) => entry.subjectId === subject.id && !entry.resolved,
  );
  const recentExam = exams.find((exam) => exam.subjectId === subject.id);
  const score = recentExam ? examPercentage(recentExam) : 50;
  const consistency = Math.max(0, 100 - relatedErrors.length * 8);
  return Math.round(
    subject.syllabusCompletion * 0.35 + score * 0.4 + consistency * 0.15 + 70 * 0.1,
  );
}

export function repeatedWeaknesses() {
  const counts = errorEntries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.topic] = (acc[entry.topic] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .filter(([, count]) => count >= 2)
    .map(([topic, count]) => ({ topic, count }));
}
