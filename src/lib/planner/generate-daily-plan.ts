import type { Subject, TopicWithProgress } from "@/types/domain";

export type PlanMode =
  | "Normal Day"
  | "Mock Day"
  | "Startup Day"
  | "Conf/Event Day"
  | "Light/Recovery Day"
  | "Custom";

export type GeneratedTask = {
  subjectId: string | null;
  syllabusTopicId: string | null;
  task: string;
  category: string;
  topic: string | null;
  estimatedDuration: number;
  status: "Planned";
  reason: string;
  priorityScore: number;
  source: "adaptive-planner" | "mock-followup" | "manual";
};

export type BlockedPaper = {
  id: string;
  subjectId: string;
  paper: string;
  cycleStatus: string;
};

export function targetHoursForMode(mode: PlanMode) {
  if (mode === "Mock Day") return 5;
  if (mode === "Startup Day") return 4.5;
  if (mode === "Conf/Event Day") return 4;
  if (mode === "Light/Recovery Day") return 2.5;
  if (mode === "Custom") return 3.5;
  return 6;
}

export function allocateSubjectHours(mode: PlanMode, subjects: Subject[]) {
  const activeAcademic = subjects.filter((subject) =>
    ["Maths", "Further Maths", "Physics"].includes(subject.shortName),
  );
  const total = targetHoursForMode(mode);

  if (mode === "Normal Day") {
    const floor = 1;
    const remaining = Math.max(0, total - activeAcademic.length * floor);
    const extra = activeAcademic.length ? remaining / activeAcademic.length : 0;
    return new Map(activeAcademic.map((subject) => [subject.id, roundQuarter(floor + extra)]));
  }

  if (mode === "Mock Day") {
    return new Map(activeAcademic.map((subject, index) => [subject.id, index === 0 ? 3 : 1]));
  }

  const perSubject = activeAcademic.length ? total / activeAcademic.length : 0;
  return new Map(activeAcademic.map((subject) => [subject.id, roundQuarter(perSubject)]));
}

export function generateDailyPlan(input: {
  mode: PlanMode;
  subjects: Subject[];
  topics: TopicWithProgress[];
  blockedPapers?: BlockedPaper[];
}) {
  const tasks: GeneratedTask[] = [];
  const subjectHours = allocateSubjectHours(input.mode, input.subjects);

  for (const paper of input.blockedPapers ?? []) {
    tasks.push({
      subjectId: paper.subjectId,
      syllabusTopicId: null,
      task: `Complete corrections for ${paper.paper}`,
      category: "Mock Correction",
      topic: paper.paper,
      estimatedDuration: 1,
      status: "Planned",
      reason: `Paper cycle is still "${paper.cycleStatus}", so corrections come before another full paper.`,
      priorityScore: 100,
      source: "mock-followup",
    });
  }

  for (const subject of input.subjects) {
    const hours = subjectHours.get(subject.id);
    if (!hours) continue;

    const candidates = input.topics
      .filter((topic) => topic.topic.subjectId === subject.id && topic.topic.active)
      .filter((topic) => topic.topic.topicLevel !== "module")
      .sort((a, b) => b.priorityScore - a.priorityScore || a.topic.sortOrder - b.topic.sortOrder);

    let remainingHours = hours;
    for (const candidate of candidates) {
      if (remainingHours < 0.5) break;
      const duration = Math.min(1.5, Math.max(0.75, remainingHours));
      tasks.push({
        subjectId: subject.id,
        syllabusTopicId: candidate.topic.id,
        task: `Study ${candidate.topic.name}`,
        category: "Academic",
        topic: candidate.topic.name,
        estimatedDuration: duration,
        status: "Planned",
        reason: candidate.priorityReasons.join(", "),
        priorityScore: candidate.priorityScore,
        source: "adaptive-planner",
      });
      remainingHours = roundQuarter(remainingHours - duration);
    }
  }

  if (input.mode === "Startup Day") {
    tasks.push(experienceTask(1.5, "Startup Exp block"));
  }

  if (input.mode === "Conf/Event Day") {
    tasks.push(experienceTask(1, "Conf/Event prep or reflection"));
  }

  return tasks;
}

export function generateWeeklyPlan(input: {
  startDate: string;
  subjects: Subject[];
  topics: TopicWithProgress[];
  blockedPapers?: BlockedPaper[];
  modes?: PlanMode[];
}) {
  const defaultModes: PlanMode[] = [
    "Normal Day",
    "Normal Day",
    "Normal Day",
    "Normal Day",
    "Light/Recovery Day",
    "Startup Day",
    "Conf/Event Day",
  ];

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(input.startDate, index);
    const mode = input.modes?.[index] ?? defaultModes[index] ?? "Normal Day";
    return {
      date,
      mode,
      tasks: generateDailyPlan({
        mode,
        subjects: input.subjects,
        topics: input.topics,
        blockedPapers: index === 0 ? input.blockedPapers : [],
      }),
    };
  });
}

function experienceTask(hours: number, label: string): GeneratedTask {
  return {
    subjectId: null,
    syllabusTopicId: null,
    task: label,
    category: "Experience",
    topic: null,
    estimatedDuration: hours,
    status: "Planned",
    reason: "Mode reserves protected time for non-academic evidence building.",
    priorityScore: 50,
    source: "adaptive-planner",
  };
}

function roundQuarter(hours: number) {
  return Math.round(hours * 4) / 4;
}

function addDays(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}
