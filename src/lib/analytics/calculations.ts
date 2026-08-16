import type { Exam, ExamError, StudySession, Subject, Topic } from "@/types/domain";

export function examPercentage(exam: Pick<Exam, "rawMarks" | "maxMarks">) {
  if (!exam.maxMarks) {
    return 0;
  }

  return Math.round((exam.rawMarks / exam.maxMarks) * 100);
}

export function marksFromBoundary(rawMarks: number, boundary: number | null) {
  if (boundary === null) {
    return null;
  }

  return Math.max(boundary - rawMarks, 0);
}

export function lastAverage(exams: Exam[], count: number) {
  const recent = [...exams]
    .sort((a, b) => b.completedOn.localeCompare(a.completedOn))
    .slice(0, count);

  if (!recent.length) {
    return null;
  }

  return Math.round(recent.reduce((sum, exam) => sum + exam.percentage, 0) / recent.length);
}

export function studyHoursForWeek(sessions: StudySession[]) {
  return sessions.reduce((sum, session) => sum + session.durationHours, 0);
}

export function repeatedWeaknesses(errors: ExamError[], threshold = 3) {
  const byTopic = errors
    .filter((entry) => !entry.resolved)
    .reduce<Record<string, { topic: string; count: number; examIds: Set<string> }>>((acc, entry) => {
      const topic = entry.topicName ?? entry.topicId ?? "Unassigned topic";
      if (!acc[topic]) {
        acc[topic] = { topic, count: 0, examIds: new Set() };
      }
      acc[topic].count += 1;
      if (entry.examId) {
        acc[topic].examIds.add(entry.examId);
      }
      return acc;
    }, {});

  return Object.values(byTopic)
    .filter((item) => item.count >= threshold || (item.count >= 2 && item.examIds.size >= 2))
    .map((item) => ({ topic: item.topic, count: item.count, examCount: item.examIds.size }))
    .sort((a, b) => b.count - a.count);
}

export function readinessScore(input: {
  subject: Subject;
  topics: Topic[];
  exams: Exam[];
  errors: ExamError[];
  studySessions: StudySession[];
}) {
  const recentAverage = lastAverage(input.exams, 3) ?? 0;
  const mastery =
    input.topics.length > 0
      ? Math.round(
          input.topics.reduce((sum, topic) => {
            if (topic.status === "Mastered") return sum + 100;
            if (topic.status === "Exam Ready") return sum + 85;
            if (topic.status === "Revised") return sum + 65;
            if (topic.status === "Practice Required") return sum + 50;
            if (topic.status === "Learning") return sum + 35;
            return sum + 10;
          }, 0) / input.topics.length,
        )
      : input.subject.syllabusCompletion;
  const unresolved = input.errors.filter((entry) => !entry.resolved).length;
  const totalErrors = input.errors.length || 1;
  const errorResolution = Math.max(0, Math.round(((totalErrors - unresolved) / totalErrors) * 100));
  const consistency = Math.min(100, Math.round(studyHoursForWeek(input.studySessions) * 10));

  return Math.round(recentAverage * 0.5 + mastery * 0.2 + errorResolution * 0.15 + consistency * 0.15);
}
