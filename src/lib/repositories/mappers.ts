import type { Database, Json } from "@/types/database";
import type {
  DailyPlan,
  DailyTask,
  Exam,
  ExamError,
  Goal,
  JournalEntry,
  PortfolioItem,
  Project,
  Subject,
  Topic,
  Tutor,
  TutorQuestion,
  TutorSession,
} from "@/types/domain";

type Tables = Database["public"]["Tables"];

export function mapSubject(row: Tables["subjects"]["Row"]): Subject {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    achievedGrade: row.achieved_grade,
    targetGrade: row.target_grade,
    estimatedGrade: row.estimated_grade,
    latestMockGrade: row.latest_mock_grade,
    syllabusCompletion: row.syllabus_completion,
    active: row.active,
    studyHoursThisWeek: 0,
    weakTopicCount: 0,
    nextAction: "Add topics and study sessions",
  };
}

export function mapTopic(row: Tables["topics"]["Row"]): Topic {
  return {
    id: row.id,
    subjectId: row.subject_id,
    name: row.name,
    status: row.status as Topic["status"],
    confidence: row.confidence,
    accuracy: row.accuracy,
    errorCount: row.error_count,
    lastRevised: row.last_revised,
    priority: row.priority as Topic["priority"],
    notes: row.notes,
    tutorFeedback: row.tutor_feedback,
  };
}

export function mapDailyTask(row: Tables["daily_tasks"]["Row"]): DailyTask {
  return {
    id: row.id,
    dailyPlanId: row.daily_plan_id,
    subjectId: row.subject_id,
    syllabusTopicId: row.syllabus_topic_id ?? null,
    task: row.task,
    category: row.category,
    topic: row.topic,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    estimatedDuration: row.estimated_duration,
    actualDuration: row.actual_duration,
    status: row.status as DailyTask["status"],
    reason: row.reason ?? null,
    priorityScore: row.priority_score ?? null,
    source: row.source ?? null,
    difficulty: row.difficulty,
    confidenceBefore: row.confidence_before,
    confidenceAfter: row.confidence_after,
    notes: row.notes,
  };
}

export function mapDailyPlan(
  row: Tables["daily_plans"]["Row"],
  tasks: DailyTask[] = [],
): DailyPlan {
  return {
    id: row.id,
    planDate: row.plan_date,
    energy: row.energy,
    focus: row.focus,
    motivation: row.motivation,
    sleepHours: row.sleep_hours,
    academicGoal: row.academic_goal,
    personalGoal: row.personal_goal,
    totalFocusedHours: row.total_focused_hours,
    eveningReflection: asRecord(row.evening_reflection),
    tasks,
  };
}

export function mapExam(row: Tables["exams"]["Row"]): Exam {
  return {
    id: row.id,
    subjectId: row.subject_id,
    paperCode: row.paper_code ?? null,
    paperSection: row.paper_section ?? null,
    examType: row.exam_type,
    examBoard: row.exam_board,
    paper: row.paper,
    paperYear: row.paper_year,
    completedOn: row.completed_on,
    durationMinutes: row.duration_minutes,
    timed: row.timed,
    rawMarks: row.raw_marks,
    maxMarks: row.max_marks,
    percentage: row.percentage,
    grade: row.grade,
    targetGrade: row.target_grade,
    nextBoundary: row.next_boundary,
    targetBoundary: row.target_boundary,
    timeRemainingMinutes: row.time_remaining_minutes,
    cycleStatus: row.cycle_status as Exam["cycleStatus"],
    notes: row.notes,
  };
}

export function mapExamError(row: Tables["exam_errors"]["Row"]): ExamError {
  return {
    id: row.id,
    examId: row.exam_id,
    subjectId: row.subject_id,
    topicId: row.topic_id,
    syllabusTopicId: row.syllabus_topic_id ?? null,
    topicName: row.topic_name,
    paperName: row.paper_name,
    errorDate: row.error_date,
    questionNumber: row.question_number,
    marksAvailable: row.marks_available,
    marksLost: row.marks_lost,
    category: row.category,
    description: row.description,
    correctApproach: row.correct_approach,
    lessonLearned: row.lesson_learned,
    correctiveAction: row.corrective_action,
    retestDate: row.retest_date,
    retestResult: row.retest_result,
    resolved: row.resolved,
    resolvedAt: row.resolved_at,
  };
}

export function mapTutor(row: Tables["tutors"]["Row"]): Tutor {
  return {
    id: row.id,
    name: row.name,
    subjectId: row.subject_id,
    contact: row.contact,
    frequency: row.frequency,
    lessonDurationMinutes: row.lesson_duration_minutes,
    notes: row.notes,
  };
}

export function mapTutorSession(row: Tables["tutor_sessions"]["Row"]): TutorSession {
  return {
    id: row.id,
    tutorId: row.tutor_id,
    subjectId: row.subject_id,
    sessionDate: row.session_date,
    topicsCovered: row.topics_covered,
    problemsIdentified: row.problems_identified,
    recommendations: row.recommendations,
    homeworkAssigned: row.homework_assigned,
    homeworkCompleted: row.homework_completed,
    confidenceBefore: row.confidence_before,
    confidenceAfter: row.confidence_after,
  };
}

export function mapTutorQuestion(row: Tables["tutor_questions"]["Row"]): TutorQuestion {
  return {
    id: row.id,
    subjectId: row.subject_id,
    question: row.question,
    status: row.status as TutorQuestion["status"],
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}

export function mapGoal(row: Tables["goals"]["Row"]): Goal {
  return {
    id: row.id,
    timeframe: row.timeframe as Goal["timeframe"],
    area: row.area,
    title: row.title,
    target: row.target,
    progress: row.progress,
    status: row.status,
    startDate: row.start_date,
    targetDate: row.target_date,
    notes: row.notes,
  };
}

export function mapJournalEntry(row: Tables["journal_entries"]["Row"]): JournalEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    sections: asStringRecord(row.sections),
    tags: row.tags,
    publishToPortfolio: row.publish_to_portfolio,
  };
}

export function mapProject(row: Tables["projects"]["Row"]): Project {
  return {
    id: row.id,
    title: row.title,
    problem: row.problem,
    description: row.description,
    whyItMatters: row.why_it_matters,
    technologies: row.technologies ?? [],
    engineeringConcepts: row.engineering_concepts ?? [],
    status: row.status,
    startedOn: row.started_on,
    endedOn: row.ended_on,
    githubUrl: row.github_url,
    demoUrl: row.demo_url,
    publishToPortfolio: row.publish_to_portfolio,
  };
}

export function mapPortfolioItem(row: Tables["portfolio_items"]["Row"]): PortfolioItem {
  return {
    id: row.id,
    itemType: row.item_type,
    sourceId: row.source_id,
    title: row.title,
    summary: row.summary,
    visibility: row.visibility as PortfolioItem["visibility"],
  };
}

function asRecord(value: Json | null) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asStringRecord(value: Json) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, typeof item === "string" ? item : ""]),
  );
}
