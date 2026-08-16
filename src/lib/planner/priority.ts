import type { TopicPriority } from "@/types/domain";

export type TopicPriorityContext = {
  status?: string | null;
  confidence?: number | null;
  accuracy?: number | null;
  lastRevised?: string | null;
  retestDate?: string | null;
  tutorFlag?: boolean | null;
  unresolvedErrors?: number;
  marksLost?: number;
  cycleBlocked?: boolean;
};

export type TopicPriorityResult = {
  score: number;
  label: TopicPriority;
  reasons: string[];
};

export function calculateTopicPriority(input: TopicPriorityContext): TopicPriorityResult {
  let score = 20;
  const reasons: string[] = [];

  if (!input.status || input.status === "Not Started") {
    score += 30;
    reasons.push("not started");
  } else if (input.status === "Practice Required") {
    score += 28;
    reasons.push("practice required");
  } else if (input.status === "Learning") {
    score += 20;
    reasons.push("still learning");
  } else if (input.status === "Revised") {
    score += 10;
    reasons.push("needs exam practice");
  }

  if (input.accuracy != null) {
    if (input.accuracy < 50) {
      score += 30;
      reasons.push("accuracy below 50%");
    } else if (input.accuracy < 70) {
      score += 20;
      reasons.push("accuracy below 70%");
    } else if (input.accuracy < 85) {
      score += 10;
      reasons.push("accuracy below exam-ready level");
    }
  }

  if (input.confidence != null && input.confidence <= 2) {
    score += 18;
    reasons.push("low confidence");
  } else if (input.confidence === 3) {
    score += 8;
    reasons.push("medium confidence");
  }

  const unresolvedErrors = input.unresolvedErrors ?? 0;
  if (unresolvedErrors > 0) {
    score += Math.min(24, unresolvedErrors * 8);
    reasons.push(`${unresolvedErrors} unresolved error${unresolvedErrors === 1 ? "" : "s"}`);
  }

  const marksLost = input.marksLost ?? 0;
  if (marksLost > 0) {
    score += Math.min(18, marksLost * 2);
    reasons.push(`${marksLost} recent mark${marksLost === 1 ? "" : "s"} lost`);
  }

  if (input.tutorFlag) {
    score += 20;
    reasons.push("tutor flagged");
  }

  const daysSinceRevised = daysSince(input.lastRevised);
  if (daysSinceRevised != null) {
    if (daysSinceRevised >= 21) {
      score += 16;
      reasons.push("not revised in 3+ weeks");
    } else if (daysSinceRevised >= 10) {
      score += 8;
      reasons.push("due for spaced review");
    }
  }

  const daysUntilRetest = daysUntil(input.retestDate);
  if (daysUntilRetest != null && daysUntilRetest <= 3) {
    score += 14;
    reasons.push("retest due soon");
  }

  if (input.cycleBlocked) {
    score += 24;
    reasons.push("paper cycle blocked");
  }

  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));
  return {
    score: boundedScore,
    label: priorityLabel(boundedScore),
    reasons: reasons.length ? reasons : ["steady rotation"],
  };
}

export function priorityLabel(score: number): TopicPriority {
  if (score >= 85) return "Critical";
  if (score >= 65) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

function daysSince(date?: string | null) {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.floor((Date.now() - parsed.getTime()) / 86_400_000);
}

function daysUntil(date?: string | null) {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.ceil((parsed.getTime() - Date.now()) / 86_400_000);
}
