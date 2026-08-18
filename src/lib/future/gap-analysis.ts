import type { Subject } from "@/types/domain";

const gradeRank: Record<string, number> = {
  "A*": 6,
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
};

type ComparableGrade = keyof typeof gradeRank;

export type AcademicGapResult = {
  label: "above typical profile" | "aligned with typical profile" | "below typical profile" | "needs manual review";
  requirement: string;
  currentEvidence: string;
  gap: string;
  nextStep: string;
};

export function analyseAcademicGap(subjects: Subject[], requirements?: string | null): AcademicGapResult {
  const requiredGrades = parseRequirementGrades(requirements);
  const evidenceGrades = subjects
    .filter((subject) => subject.active)
    .map((subject) => subject.estimatedGrade ?? subject.schoolPredictedGrade ?? subject.targetGrade ?? subject.achievedGrade)
    .filter((grade): grade is string => Boolean(grade));

  if (!requirements || requiredGrades.length === 0 || evidenceGrades.length === 0) {
    return {
      label: "needs manual review",
      requirement: requirements || "Not entered",
      currentEvidence: evidenceGrades.join("") || "Not enough evidence",
      gap: "Requirement or evidence data is incomplete.",
      nextStep: "Add published requirements and keep school predictions separate from current evidence estimates.",
    };
  }

  const normalizedEvidence = evidenceGrades
    .map(normalizeGrade)
    .filter(isComparableGrade)
    .sort((a, b) => gradeRank[b] - gradeRank[a]);

  const normalizedRequirements = requiredGrades
    .map(normalizeGrade)
    .filter(isComparableGrade)
    .sort((a, b) => gradeRank[b] - gradeRank[a]);

  const comparableLength = Math.min(normalizedEvidence.length, normalizedRequirements.length);
  if (comparableLength === 0) {
    return {
      label: "needs manual review",
      requirement: requirements,
      currentEvidence: evidenceGrades.join(""),
      gap: "Grades could not be compared automatically.",
      nextStep: "Review subject-specific requirements manually.",
    };
  }

  const totalGap = normalizedRequirements
    .slice(0, comparableLength)
    .reduce((sum, required, index) => sum + Math.max(0, gradeRank[required] - gradeRank[normalizedEvidence[index]]), 0);
  const surplus = normalizedRequirements
    .slice(0, comparableLength)
    .reduce((sum, required, index) => sum + Math.max(0, gradeRank[normalizedEvidence[index]] - gradeRank[required]), 0);

  if (totalGap > 0) {
    return {
      label: "below typical profile",
      requirement: requirements,
      currentEvidence: normalizedEvidence.join(""),
      gap: `Current evidence is ${totalGap} grade step${totalGap === 1 ? "" : "s"} below the typical published profile.`,
      nextStep: "Prioritise topic gaps, assessment corrections, and evidence-backed improvement before treating this as a firm shortlist choice.",
    };
  }

  if (surplus > 0) {
    return {
      label: "above typical profile",
      requirement: requirements,
      currentEvidence: normalizedEvidence.join(""),
      gap: "Current evidence is above the typical published entry profile.",
      nextStep: "Check required subjects, admissions tests, interviews, and whether the course still fits the student's interests.",
    };
  }

  return {
    label: "aligned with typical profile",
    requirement: requirements,
    currentEvidence: normalizedEvidence.join(""),
    gap: "Current evidence is aligned with the typical published entry profile.",
    nextStep: "Keep building assessment evidence and course-relevant experiences.",
  };
}

export function parseRequirementGrades(requirements?: string | null) {
  if (!requirements) return [];
  const match = requirements.toUpperCase().match(/(?:A\*|[A-E])(?:\s*[-/ ]?\s*(?:A\*|[A-E])){1,5}/);
  return match?.[0].match(/A\*|[A-E]/g) ?? [];
}

function normalizeGrade(grade: string): ComparableGrade | null {
  const value = grade.trim().toUpperCase();
  if (value.startsWith("A*")) return "A*";
  if (value.startsWith("A")) return "A";
  if (value.startsWith("B")) return "B";
  if (value.startsWith("C")) return "C";
  if (value.startsWith("D")) return "D";
  if (value.startsWith("E")) return "E";
  return null;
}

function isComparableGrade(grade: ComparableGrade | null): grade is ComparableGrade {
  return grade != null;
}
