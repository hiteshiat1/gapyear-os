import { z } from "zod";

const optionalText = z.string().trim().optional().transform((value) => value || null);
const optionalNumber = z.coerce.number().optional().transform((value) => Number.isFinite(value) ? value : null);

export const subjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Subject name is required"),
  shortName: z.string().trim().min(1, "Short name is required"),
  achievedGrade: optionalText,
  targetGrade: optionalText,
  active: z.coerce.boolean().default(false),
});

export const topicSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  name: z.string().trim().min(1, "Topic name is required"),
  status: z.enum(["Not Started", "Learning", "Revised", "Practice Required", "Exam Ready", "Mastered"]),
  confidence: z.coerce.number().min(1).max(5).optional(),
  accuracy: z.coerce.number().min(0).max(100).optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  notes: optionalText,
});

export const dailyPlanSchema = z.object({
  planDate: z.string().min(1),
  energy: z.coerce.number().min(1).max(5).optional(),
  focus: z.coerce.number().min(1).max(5).optional(),
  motivation: z.coerce.number().min(1).max(5).optional(),
  sleepHours: optionalNumber,
  academicGoal: optionalText,
  personalGoal: optionalText,
});

export const dailyTaskSchema = z.object({
  dailyPlanId: z.string().min(1),
  subjectId: optionalText,
  task: z.string().trim().min(1),
  category: z.string().trim().min(1),
  topic: optionalText,
  startsAt: optionalText,
  endsAt: optionalText,
  estimatedDuration: optionalNumber,
  actualDuration: optionalNumber,
  status: z.enum(["Planned", "In Progress", "Complete", "Missed", "Rescheduled"]),
});

export const examSchema = z
  .object({
    subjectId: z.string().min(1),
    examType: z.string().trim().min(1),
    examBoard: optionalText,
    paperCode: optionalText,
    paperSection: optionalText,
    paper: z.string().trim().min(1),
    paperYear: optionalText,
    completedOn: z.string().min(1),
    durationMinutes: optionalNumber,
    timed: z.coerce.boolean().default(false),
    rawMarks: z.coerce.number().min(0),
    maxMarks: z.coerce.number().min(1),
    grade: optionalText,
    targetGrade: optionalText,
    nextBoundary: optionalNumber,
    targetBoundary: optionalNumber,
    timeRemainingMinutes: optionalNumber,
    cycleStatus: z.enum(["Needs marking", "Needs error review", "Corrections scheduled", "Complete"]),
    notes: optionalText,
  })
  .refine((value) => value.rawMarks <= value.maxMarks, {
    message: "Raw marks cannot exceed maximum marks",
    path: ["rawMarks"],
  });

export const errorSchema = z.object({
  examId: optionalText,
  subjectId: z.string().min(1),
  topicId: optionalText,
  syllabusTopicId: optionalText,
  topicName: optionalText,
  paperName: optionalText,
  errorDate: z.string().min(1),
  questionNumber: optionalText,
  marksAvailable: optionalNumber,
  marksLost: z.coerce.number().min(0),
  category: z.string().trim().min(1),
  description: optionalText,
  correctApproach: optionalText,
  lessonLearned: optionalText,
  correctiveAction: optionalText,
  retestDate: optionalText,
});

export function formValue(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}
