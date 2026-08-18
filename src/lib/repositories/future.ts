import { analyseAcademicGap } from "@/lib/future/gap-analysis";
import { useMockData } from "@/lib/supabase/config";
import type {
  CareerFamily,
  CourseInterest,
  EvidenceLink,
  FutureMapColumn,
  InterestProfile,
  StudentCareerInterest,
  UniversityChoice,
} from "@/types/domain";
import { getSupabaseForRead, requireUser } from "./common";
import { getProjects } from "./projects";
import { getSubjects } from "./subjects";

export const broadInterestOptions = [
  "building things",
  "maths/problem solving",
  "technology",
  "science",
  "helping people",
  "business",
  "design",
  "finance",
  "research",
  "entrepreneurship",
  "politics/public affairs",
  "writing/communication",
];

export async function getInterestProfile() {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) return useMockData ? null : null;

  const { data, error } = await supabase
    .from("interest_profiles")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    broadInterests: data.broad_interests ?? [],
    freeText: data.free_text,
  } satisfies InterestProfile;
}

export async function saveInterestProfile(input: { broadInterests: string[]; freeText?: string | null }) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("interest_profiles").upsert(
    {
      owner_id: user.id,
      broad_interests: input.broadInterests,
      free_text: input.freeText ?? null,
    },
    { onConflict: "owner_id" },
  );

  if (error) throw new Error(error.message);
}

export async function getCourseInterests() {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("course_interests")
    .select("*")
    .eq("is_deleted", false)
    .order("interest_level", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    courseName: row.course_name,
    interestLevel: row.interest_level,
    reason: row.reason,
  })) satisfies CourseInterest[];
}

export async function createCourseInterest(input: {
  courseName: string;
  interestLevel: number;
  reason?: string | null;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("course_interests").insert({
    owner_id: user.id,
    course_name: input.courseName,
    interest_level: input.interestLevel,
    reason: input.reason ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function getUniversityChoices() {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("student_university_choices")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    university: row.university,
    course: row.course,
    entryYear: row.entry_year,
    typicalEntryRequirements: row.typical_entry_requirements,
    requiredSubjects: row.required_subjects,
    contextualRequirements: row.contextual_requirements,
    admissionsTests: row.admissions_tests,
    interestLevel: row.interest_level,
    status: row.status as UniversityChoice["status"],
    notes: row.notes,
    sourceUrl: row.source_url,
    lastChecked: row.last_checked,
  })) satisfies UniversityChoice[];
}

export async function createUniversityChoice(input: {
  university: string;
  course: string;
  entryYear?: string | null;
  typicalEntryRequirements?: string | null;
  requiredSubjects?: string | null;
  contextualRequirements?: string | null;
  admissionsTests?: string | null;
  interestLevel: number;
  status: string;
  notes?: string | null;
  sourceUrl?: string | null;
  lastChecked?: string | null;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("student_university_choices").insert({
    owner_id: user.id,
    university: input.university,
    course: input.course,
    entry_year: input.entryYear ?? null,
    typical_entry_requirements: input.typicalEntryRequirements ?? null,
    required_subjects: input.requiredSubjects ?? null,
    contextual_requirements: input.contextualRequirements ?? null,
    admissions_tests: input.admissionsTests ?? null,
    interest_level: input.interestLevel,
    status: input.status,
    notes: input.notes ?? null,
    source_url: input.sourceUrl ?? null,
    last_checked: input.lastChecked ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function getCareerFamilies() {
  const supabase = await getSupabaseForRead();
  if (!supabase) return fallbackCareerFamilies;

  const { data, error } = await supabase.from("career_families").select("*").order("name");

  if (error) {
    console.error("getCareerFamilies failed", error.message);
    return fallbackCareerFamilies;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    exampleRoles: row.example_roles ?? [],
    skills: row.skills ?? [],
    typicalDegreeRoutes: row.typical_degree_routes ?? [],
  })) satisfies CareerFamily[];
}

export async function getStudentCareerInterests() {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("student_career_interests")
    .select("*")
    .eq("is_deleted", false);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    careerFamilyId: row.career_family_id,
    interestLevel: row.interest_level,
    reason: row.reason,
    status: row.status,
  })) satisfies StudentCareerInterest[];
}

export async function saveCareerInterest(input: {
  careerFamilyId: string;
  interestLevel: number;
  reason?: string | null;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("student_career_interests").upsert(
    {
      owner_id: user.id,
      career_family_id: input.careerFamilyId,
      interest_level: input.interestLevel,
      reason: input.reason ?? null,
      status: "exploring",
      is_deleted: false,
    },
    { onConflict: "owner_id,career_family_id" },
  );

  if (error) throw new Error(error.message);
}

export async function getEvidenceLinks() {
  const supabase = await getSupabaseForRead();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("evidence_links")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    courseInterestId: row.course_interest_id,
    universityChoiceId: row.university_choice_id,
    careerFamilyId: row.career_family_id,
    skills: row.skills ?? [],
    ucasCategory: row.ucas_category,
    reflectionStrength: row.reflection_strength,
  })) satisfies EvidenceLink[];
}

export async function createEvidenceLink(input: {
  sourceType: string;
  sourceId?: string | null;
  courseInterestId?: string | null;
  universityChoiceId?: string | null;
  careerFamilyId?: string | null;
  skills?: string[];
  ucasCategory?: string | null;
  reflectionStrength?: string | null;
}) {
  const supabase = await getSupabaseForRead();
  const user = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("evidence_links").insert({
    owner_id: user.id,
    source_type: input.sourceType,
    source_id: input.sourceId ?? null,
    course_interest_id: input.courseInterestId ?? null,
    university_choice_id: input.universityChoiceId ?? null,
    career_family_id: input.careerFamilyId ?? null,
    skills: input.skills ?? [],
    ucas_category: input.ucasCategory ?? null,
    reflection_strength: input.reflectionStrength ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function getUniversityChoicesWithGapAnalysis() {
  const [subjects, choices] = await Promise.all([getSubjects(), getUniversityChoices()]);

  return choices.map((choice) => ({
    choice,
    gap: analyseAcademicGap(subjects, choice.typicalEntryRequirements),
  }));
}

export async function getFutureMapColumns(): Promise<FutureMapColumn[]> {
  const [subjects, interestProfile, courseInterests, universityChoices, careerFamilies, careerInterests, projects] =
    await Promise.all([
      getSubjects(),
      getInterestProfile().catch(() => null),
      getCourseInterests().catch(() => []),
      getUniversityChoices().catch(() => []),
      getCareerFamilies(),
      getStudentCareerInterests().catch(() => []),
      getProjects().catch(() => []),
    ]);

  const selectedCareerIds = new Set(careerInterests.map((interest) => interest.careerFamilyId));
  const selectedCareers = careerFamilies.filter((family) => selectedCareerIds.has(family.id));

  return [
    {
      title: "Student",
      nodes: [
        {
          id: "student",
          nodeType: "student",
          label: "Current learner",
          detail: interestProfile?.broadInterests.join(", ") || "Add interests in Explore",
        },
      ],
    },
    {
      title: "A-Level Subjects",
      nodes: subjects.map((subject) => ({
        id: subject.id,
        nodeType: "subject",
        label: subject.name,
        detail: `${subject.examBoard ?? "Board not set"} · target ${subject.targetGrade ?? "not set"}`,
      })),
    },
    {
      title: "Course Interests",
      nodes: courseInterests.map((interest) => ({
        id: interest.id,
        nodeType: "course_interest",
        label: interest.courseName,
        detail: interest.reason || `Interest ${interest.interestLevel}/5`,
      })),
    },
    {
      title: "University Choices",
      nodes: universityChoices.map((choice) => ({
        id: choice.id,
        nodeType: "university_choice",
        label: `${choice.university} · ${choice.course}`,
        detail: choice.typicalEntryRequirements || "Requirements not entered",
      })),
    },
    {
      title: "Evidence / Experiences",
      nodes: projects.map((project) => ({
        id: project.id,
        nodeType: "evidence",
        label: project.title,
        detail: project.status,
      })),
    },
    {
      title: "Career Families",
      nodes: selectedCareers.map((family) => ({
        id: family.id,
        nodeType: "career_family",
        label: family.name,
        detail: family.exampleRoles.slice(0, 3).join(", "),
      })),
    },
  ];
}

const fallbackCareerFamilies: CareerFamily[] = [
  {
    id: "software-ai",
    name: "Software & AI",
    description: "Building software systems, data products and AI-enabled tools.",
    exampleRoles: ["Software engineer", "Data scientist", "AI engineer"],
    skills: ["programming", "logic", "data analysis"],
    typicalDegreeRoutes: ["Computer Science", "Mathematics", "Engineering"],
  },
  {
    id: "engineering",
    name: "Engineering & Manufacturing",
    description: "Designing, building and improving physical systems.",
    exampleRoles: ["Mechanical engineer", "Electrical engineer"],
    skills: ["CAD", "testing", "systems thinking"],
    typicalDegreeRoutes: ["Engineering", "Physics"],
  },
];
