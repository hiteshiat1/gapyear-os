import { describe, expect, it } from "vitest";
import { examPercentage, lastAverage, marksFromBoundary, progressLabelFromEvidence, repeatedWeaknesses } from "@/lib/analytics/calculations";
import type { Exam, ExamError } from "@/types/domain";

function exam(id: string, percentage: number): Exam {
  return {
    id,
    subjectId: "physics",
    examType: "Mock",
    examBoard: null,
    paper: id,
    paperYear: null,
    completedOn: `2026-08-${id.padStart(2, "0")}`,
    durationMinutes: null,
    timed: true,
    rawMarks: percentage,
    maxMarks: 100,
    percentage,
    grade: null,
    targetGrade: null,
    nextBoundary: null,
    targetBoundary: null,
    timeRemainingMinutes: null,
    cycleStatus: "Complete",
    notes: null,
  };
}

function error(id: string, topic: string, resolved = false): ExamError {
  return {
    id,
    examId: id,
    subjectId: "physics",
    topicId: null,
    topicName: topic,
    paperName: null,
    errorDate: "2026-08-16",
    questionNumber: null,
    marksAvailable: null,
    marksLost: 1,
    category: "Conceptual Error",
    description: null,
    correctApproach: null,
    lessonLearned: null,
    correctiveAction: null,
    retestDate: null,
    retestResult: null,
    resolved,
    resolvedAt: null,
  };
}

describe("analytics calculations", () => {
  it("calculates exam percentage", () => {
    expect(examPercentage({ rawMarks: 63, maxMarks: 100 })).toBe(63);
  });

  it("calculates marks from boundary", () => {
    expect(marksFromBoundary(63, 68)).toBe(5);
    expect(marksFromBoundary(70, 68)).toBe(0);
    expect(marksFromBoundary(70, null)).toBeNull();
  });

  it("calculates recent averages", () => {
    expect(lastAverage([exam("1", 50), exam("2", 70), exam("3", 80), exam("4", 90)], 3)).toBe(80);
  });

  it("detects repeated unresolved weaknesses", () => {
    const weaknesses = repeatedWeaknesses([
      error("1", "Electric Fields"),
      error("2", "Electric Fields"),
      error("3", "Electric Fields"),
      error("4", "Integration", true),
    ]);
    expect(weaknesses[0]).toMatchObject({ topic: "Electric Fields", count: 3 });
  });

  it("maps evidence into qualitative progress labels", () => {
    expect(progressLabelFromEvidence({ topicCount: 0, percent: null })).toBe("Not assessed");
    expect(progressLabelFromEvidence({ topicCount: 1, percent: 20 })).toBe("Early evidence");
    expect(progressLabelFromEvidence({ topicCount: 5, percent: 20 })).toBe("Needs attention");
    expect(progressLabelFromEvidence({ topicCount: 5, percent: 55 })).toBe("Developing");
    expect(progressLabelFromEvidence({ topicCount: 5, percent: 85 })).toBe("On track");
  });
});
