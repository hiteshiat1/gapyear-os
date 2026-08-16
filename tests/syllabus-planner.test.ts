import { describe, expect, it } from "vitest";
import { syllabusDefinitions } from "@/data/syllabuses";
import { allocateSubjectHours, generateDailyPlan, generateWeeklyPlan } from "@/lib/planner/generate-daily-plan";
import { calculateTopicPriority } from "@/lib/planner/priority";
import type { Subject, TopicWithProgress } from "@/types/domain";

describe("syllabus definitions", () => {
  it("uses stable unique codes for every syllabus topic", () => {
    for (const definition of syllabusDefinitions) {
      const codes = definition.topics.map((topic) => topic.code);
      expect(new Set(codes).size).toBe(codes.length);
    }
  });

  it("keeps Further Maths on the E0 option path only", () => {
    const further = syllabusDefinitions.find((definition) => definition.key === "further-maths-9fm0-e0");
    expect(further?.papers.map((paper) => paper.code)).toEqual(["9FM0-01", "9FM0-02", "9FM0-3B", "9FM0-3C"]);
  });

  it("keeps AQA Physics optional content to Engineering Physics only", () => {
    const physics = syllabusDefinitions.find((definition) => definition.key === "physics-7408c");
    const topicNames = physics?.topics.map((topic) => topic.name).join(" ") ?? "";
    expect(topicNames).toContain("Engineering physics");
    expect(topicNames).not.toContain("Astrophysics");
    expect(topicNames).not.toContain("Medical physics");
    expect(topicNames).not.toContain("Turning points");
    expect(topicNames).not.toContain("Electronics");
  });

  it("defines parent topics before children", () => {
    for (const definition of syllabusDefinitions) {
      const sortOrder = new Map(definition.topics.map((topic) => [topic.code, topic.sortOrder]));
      for (const topic of definition.topics.filter((item) => item.parentCode)) {
        expect(sortOrder.get(topic.parentCode ?? "")).toBeLessThan(topic.sortOrder);
      }
    }
  });
});

describe("topic priority", () => {
  it("raises priority for weak diagnostic and unresolved errors", () => {
    const priority = calculateTopicPriority({
      status: "Practice Required",
      confidence: 2,
      accuracy: 42,
      unresolvedErrors: 2,
      marksLost: 6,
    });

    expect(priority.label).toBe("Critical");
    expect(priority.reasons).toContain("practice required");
  });
});

describe("daily plan generator", () => {
  const subjects: Subject[] = [
    subject("maths", "Maths"),
    subject("fm", "Further Maths"),
    subject("physics", "Physics"),
  ];
  const topics: TopicWithProgress[] = subjects.map((item, index) => ({
    topic: {
      id: `${item.id}-topic`,
      subjectId: item.id,
      parentTopicId: null,
      stableCode: `${item.id}.1`,
      name: `${item.shortName} priority`,
      specificationCode: "SPEC",
      specificationRef: "1",
      paperCode: "P1",
      paperName: "Paper 1",
      topicLevel: "topic",
      sortOrder: index,
      isOptional: false,
      active: true,
    },
    progress: null,
    priorityScore: 80 - index,
    priorityLabel: "High",
    priorityReasons: ["test reason"],
    unresolvedErrors: 0,
    marksLost: 0,
  }));

  it("protects one hour per academic subject on normal days", () => {
    const allocation = allocateSubjectHours("Normal Day", subjects);
    expect(allocation.get("maths")).toBeGreaterThanOrEqual(1);
    expect(allocation.get("fm")).toBeGreaterThanOrEqual(1);
    expect(allocation.get("physics")).toBeGreaterThanOrEqual(1);
  });

  it("adds paper-cycle correction before adaptive topic tasks", () => {
    const plan = generateDailyPlan({
      mode: "Normal Day",
      subjects,
      topics,
      blockedPapers: [{ id: "paper-1", subjectId: "physics", paper: "Physics Paper 1", cycleStatus: "Needs error review" }],
    });

    expect(plan[0]).toMatchObject({ category: "Mock Correction", source: "mock-followup" });
    expect(plan.some((task) => task.source === "adaptive-planner")).toBe(true);
  });

  it("reserves evidence-building time on startup days", () => {
    const plan = generateDailyPlan({ mode: "Startup Day", subjects, topics });
    expect(plan.some((task) => task.task === "Startup Exp block")).toBe(true);
  });

  it("generates a seven-day plan from a start date", () => {
    const week = generateWeeklyPlan({ startDate: "2026-08-16", subjects, topics });
    expect(week).toHaveLength(7);
    expect(week[0].date).toBe("2026-08-16");
    expect(week[6].date).toBe("2026-08-22");
    expect(week.some((day) => day.mode === "Startup Day")).toBe(true);
  });
});

function subject(id: string, shortName: string): Subject {
  return {
    id,
    name: shortName,
    shortName,
    achievedGrade: "B",
    targetGrade: "A*",
    estimatedGrade: null,
    latestMockGrade: null,
    syllabusCompletion: 0,
    active: true,
    studyHoursThisWeek: 0,
    weakTopicCount: 0,
    nextAction: "Study",
  };
}
