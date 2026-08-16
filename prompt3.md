# TASK

Continue working on the existing repository:

`hiteshiat1/sachith-gapyear`

The application already has:

* Supabase persistence
* Subjects
* Topics
* Daily Plan
* Tests / Mocks
* Error Log
* CRUD
* Authentication
* existing UI

Do NOT rebuild these features.

The next task is to create a **real exam-specification-backed syllabus system** and an **adaptive daily study planner**.

The system must support Sachith's exact qualifications:

## Mathematics

Pearson Edexcel A Level Mathematics

```text
Specification: 9MA0
Achieved grade: B
Target grade: A*
```

Papers:

```text
Paper 1 — Pure Mathematics 1
Paper 2 — Pure Mathematics 2
Paper 3 — Statistics & Mechanics
```

---

## Further Mathematics

Pearson Edexcel A Level Further Mathematics

```text
Specification: 9FM0
Option combination: E0
Achieved grade: C
Target grade: A
```

Papers:

```text
Paper 1 — Core Pure Mathematics 1
Paper 2 — Core Pure Mathematics 2
Paper 3B — Further Statistics 1
Paper 3C — Further Mechanics 1
```

Do NOT include:

```text
Further Pure
Decision Mathematics
Further Statistics 2
Further Mechanics 2
```

unless explicitly enabled in future.

---

## Physics

AQA A Level Physics

```text
Specification: 7408
Entry option: 7408C
Optional topic: Engineering Physics
Achieved grade: D
Target grade: A
```

Core content:

```text
3.1 Measurements and their errors
3.2 Particles and radiation
3.3 Waves
3.4 Mechanics and materials
3.5 Electricity
3.6 Further mechanics and thermal physics
3.7 Fields and their consequences
3.8 Nuclear physics
3.11 Engineering physics
```

Do NOT seed other optional units:

```text
Astrophysics
Medical Physics
Turning Points
Electronics
```

---

# 1. IMPORTANT PRINCIPLE

The syllabus data is reference/master data.

Student progress is separate.

Do NOT put fake values such as:

```text
confidence = 4
accuracy = 72
errors = 3
```

into syllabus seed records.

Initial student progress should be:

```text
status = Not Started
confidence = null
accuracy = null
priority = Medium
last_revised = null
```

Real values must come from Sachith's diagnostic work, study sessions, tests, mocks and error logs.

---

# 2. IMPROVE TOPIC DATA MODEL

Review the existing topic schema.

Support hierarchical topics.

Add fields where needed:

```text
parent_topic_id
specification_code
specification_ref
paper_code
paper_name
topic_level
sort_order
is_optional
active
```

Use a self-referencing topic structure rather than separate module/topic/subtopic tables unless the existing schema makes another design clearly better.

Example:

```text
Physics
└── 3.7 Fields and their consequences
    ├── Gravitational fields
    ├── Electric fields
    ├── Capacitance
    ├── Magnetic fields
    └── Electromagnetic induction
```

Possible topic levels:

```text
module
topic
subtopic
skill
```

---

# 3. SEPARATE SYLLABUS FROM STUDENT PROGRESS

If the current `topics` table mixes master syllabus and student progress, refactor cleanly.

Preferred design:

```text
syllabus_topics
```

contains:

```text
id
subject_id
parent_topic_id
name
specification_ref
paper_code
paper_name
topic_level
sort_order
is_optional
active
```

and:

```text
topic_progress
```

contains:

```text
id
owner_id
syllabus_topic_id
status
confidence
accuracy
priority
last_revised
notes
tutor_feedback
created_at
updated_at
```

If refactoring would unnecessarily break much of the existing application, it is acceptable to keep one topics table, but clearly separate reference fields from progress fields.

Document the decision.

---

# 4. CREATE SYLLABUS SEED FILES

Create repository-managed syllabus definitions.

For example:

```text
src/data/syllabuses/
  edexcel-maths-9ma0.ts
  edexcel-further-maths-9fm0-e0.ts
  aqa-physics-7408c.ts
```

JSON is also acceptable if more suitable:

```text
src/data/syllabuses/
  edexcel-maths-9ma0.json
  edexcel-further-maths-9fm0-e0.json
  aqa-physics-7408c.json
```

Use stable IDs/codes for every topic.

Example:

```text
9MA0.PURE.PROOF
9MA0.PURE.ALGEBRA
7408.3.7.ELECTRIC_FIELDS
9FM0.CP1.COMPLEX_NUMBERS
```

Stable codes are essential so seeding is idempotent.

---

# 5. EDEXCEL MATHEMATICS 9MA0 STRUCTURE

Seed the full relevant syllabus.

At minimum organise it as:

```text
Pure Mathematics
├── Proof
├── Algebra and Functions
├── Coordinate Geometry
├── Sequences and Series
├── Trigonometry
├── Exponentials and Logarithms
├── Differentiation
├── Integration
├── Numerical Methods
└── Vectors
```

Applied:

```text
Statistics
├── Statistical Sampling
├── Data Presentation and Interpretation
├── Probability
├── Statistical Distributions
└── Statistical Hypothesis Testing
```

```text
Mechanics
├── Quantities and Units in Mechanics
├── Kinematics
├── Forces and Newton's Laws
└── Moments
```

Create useful subtopics underneath these based on the Pearson specification.

Do not create meaningless ultra-granular records for every sentence of the specification.

Granularity should be useful for:

```text
revision
mock analysis
error tagging
daily plan generation
```

---

# 6. EDEXCEL FURTHER MATHEMATICS 9FM0 E0

Only include:

```text
Core Pure Mathematics 1
Core Pure Mathematics 2
Further Statistics 1
Further Mechanics 1
```

Structure relevant specification topics under each paper.

Examples of Core Pure topic areas include concepts such as:

```text
Proof
Complex numbers
Matrices
Further algebra/functions
Further calculus
Vectors
Polar coordinates
Hyperbolic functions
Differential equations
Series
```

Use the actual specification organisation.

Further Statistics 1 should contain the topics relevant to that option only.

Further Mechanics 1 should contain the topics relevant to that option only.

Every syllabus topic must carry its correct paper mapping:

```text
9FM0-01
9FM0-02
9FM0-3B
9FM0-3C
```

Do NOT generate topics from irrelevant optional modules.

---

# 7. AQA PHYSICS 7408C

Seed all core modules:

```text
3.1 Measurements and their errors
3.2 Particles and radiation
3.3 Waves
3.4 Mechanics and materials
3.5 Electricity
3.6 Further mechanics and thermal physics
3.7 Fields and their consequences
3.8 Nuclear physics
```

Also seed:

```text
3.11 Engineering physics
```

Engineering Physics should include the actual specification hierarchy, including its major areas such as:

```text
Rotational dynamics
Thermodynamics / engines
```

and their relevant subtopics.

Use the official AQA specification terminology.

---

# 8. PHYSICS PAPER MAPPING

Use the AQA assessment structure.

## Paper 1

Tag topics assessed principally under:

```text
Sections 3.1–3.5
plus 3.6.1 Periodic Motion
```

## Paper 2

Tag:

```text
Thermal Physics
Fields
Nuclear Physics
```

while recognising that earlier knowledge is assumed.

## Paper 3

Create explicit competency/topic records for:

```text
Practical Skills
Data Analysis
```

and map:

```text
Engineering Physics
```

to Paper 3 Section B.

Paper 3 should therefore support analytics such as:

```text
Paper 3A — Practical / Data Analysis
Paper 3B — Engineering Physics
```

---

# 9. CROSS-CUTTING PHYSICS SKILLS

Create skill-style syllabus records for:

```text
Mathematical Skills
Practical Skills
Data Analysis
Graph Interpretation
Uncertainty
Significant Figures
Experimental Design
```

These should be taggable from Error Log entries.

Do not treat them exactly like normal content topics if the data model supports `topic_level = skill`.

This is important because Sachith may know the content but repeatedly lose marks through practical/mathematical technique.

---

# 10. SYLLABUS SETUP PAGE

Add:

```text
Settings
→ Academic Setup
→ Syllabus
```

Show:

```text
Mathematics
Pearson Edexcel
9MA0
[Loaded ✓]

Further Mathematics
Pearson Edexcel
9FM0
Option E0
[Loaded ✓]

Physics
AQA
7408C
Engineering Physics
[Loaded ✓]
```

Buttons:

```text
Load Syllabus
Reload/Repair Syllabus
Reset Progress
```

Be VERY careful with Reset Progress.

Require explicit confirmation.

Never delete exams/errors/history when simply repairing syllabus reference data.

---

# 11. IDEMPOTENT SYLLABUS GENERATION

Calling:

```text
Load Syllabus
```

multiple times must NOT duplicate topics.

Use stable syllabus codes and upsert.

Example:

```text
9MA0.PURE.INTEGRATION
```

must always refer to the same syllabus item.

---

# 12. SYLLABUS COVERAGE PAGE

For each subject display:

```text
Not Started
Learning
Revised
Practice Required
Exam Ready
Mastered
```

Counts and percentages.

Example:

```text
Physics

Not Started       18
Learning            7
Practice Required   9
Exam Ready           4
Mastered             2
```

Calculate progress from actual student progress records.

---

# 13. TOPIC DETAIL PAGE

When Sachith opens a topic show:

```text
Specification reference
Paper
Current status
Confidence
Accuracy
Errors
Last revised
Recent tests
Recent errors
Tutor feedback
Study sessions
```

Also provide:

```text
Start Diagnostic
Start Revision
View Errors
Schedule Retest
```

---

# 14. DIAGNOSTIC SYSTEM

Add a lightweight diagnostic workflow.

A diagnostic record should capture:

```text
subject
topic
date
questions attempted
correct
marks scored
marks available
percentage
confidence before
confidence after
notes
```

The app does not need to supply question content.

Sachith can use textbook/past-paper questions externally and record the result.

After diagnostic submission:

update/recalculate:

```text
accuracy
confidence
priority
status
```

Do NOT automatically mark `Mastered`.

---

# 15. TOPIC STATUS RULES

Use configurable defaults.

Example:

## Not Started

No meaningful learning or diagnostic evidence.

## Learning

Content currently being revised.

## Revised

Content revision completed but exam performance not yet validated.

## Practice Required

Weak diagnostic/test performance or recurring errors.

## Exam Ready

Recent evidence is consistently good.

Suggested initial rule:

```text
accuracy >= 75%
confidence >= 4
no serious unresolved repeated weakness
```

## Mastered

Require stronger evidence.

Suggested:

```text
accuracy >= 80%
successful evidence in at least 2 later assessments
confidence >= 4
no recurring unresolved error cluster
```

Centralize these thresholds in configuration.

Do not scatter values around the codebase.

---

# 16. BUILD ADAPTIVE PRIORITY SCORE

Implement:

```typescript
calculateTopicPriority(topic, context)
```

Return:

```text
0–100
```

and a label:

```text
Low
Medium
High
Critical
```

Use evidence including:

```text
accuracy
unresolved errors
marks lost
confidence
days since revision
scheduled retest
recent exam appearance
current topic status
tutor flag
```

Example weighting:

```text
Low accuracy                     up to +25
Unresolved/repeated errors       up to +25
Marks lost recently              up to +15
Low confidence                   up to +10
Retest overdue                   +15
Not revised recently             up to +10
Tutor priority flag              +10
```

Cap at 100.

These are internal planning weights, not educational claims.

Keep them configurable.

---

# 17. ERROR → TOPIC FEEDBACK LOOP

When an Error Log entry is created:

```text
Mock/Test
    ↓
Error
    ↓
Linked syllabus topic
    ↓
Topic weakness recalculated
    ↓
Priority recalculated
```

Do not require manually updating topic accuracy/error counts.

Derived values should come from real linked records whenever practical.

---

# 18. MOCK → PAPER ANALYTICS

Every exam must have:

```text
subject
paper_code
```

Examples:

```text
9MA0-01
9MA0-02
9MA0-03

9FM0-01
9FM0-02
9FM0-3B
9FM0-3C

7408-P1
7408-P2
7408-P3
```

For AQA Paper 3 also allow section:

```text
Practical/Data Analysis
Engineering Physics
```

---

# 19. PAPER-LEVEL DASHBOARDS

For Maths show:

```text
Pure Paper 1 average
Pure Paper 2 average
Statistics & Mechanics average
```

For Further Maths:

```text
Core Pure 1 average
Core Pure 2 average
Further Statistics 1 average
Further Mechanics 1 average
```

For Physics:

```text
Paper 1 average
Paper 2 average
Paper 3 average

Paper 3 Practical/Data Analysis
Paper 3 Engineering Physics
```

---

# 20. MARKS-LOST ANALYTICS

Because errors link to syllabus topics, calculate:

```text
Marks lost by topic
Marks lost by module
Marks lost by paper
Marks lost by error category
```

Examples:

```text
Physics – last 5 papers

Fields                       24 marks
Practical/Data Analysis      19 marks
Electricity                  12 marks
Engineering Physics           9 marks
```

Use these figures in planning.

---

# 21. DAILY PLAN GENERATOR

Build:

```typescript
generateDailyPlan(date, mode)
```

Modes:

```text
Normal Day
Mock Day
Startup Day
Conf/Event Day
Light/Recovery Day
Custom
```

---

# 22. DEFAULT HOURS

Normal Day:

```text
maximum target ≈ 6 focused academic hours
```

Default subject balance:

```text
Physics             2h
Mathematics         2h
Further Mathematics 2h
```

But allow adaptive redistribution.

Example:

```text
Physics 3h
Further Maths 1.5h
Maths 1.5h
```

when Physics has substantially higher priority.

---

# 23. SUBJECT FLOOR

Do not let the adaptive algorithm completely neglect a subject.

Normal default minimum:

```text
Maths             1 hour
Further Maths     1 hour
Physics           1 hour
```

unless:

```text
Mock Day
Rest Day
Travel restrictions
manual override
```

---

# 24. DAILY TASK GENERATION

Use ranked topic priority.

Example generated block:

```text
Physics — Electric Fields — 2h

40 min Content Recovery
60 min Targeted Questions
20 min Error Corrections
```

Another:

```text
Further Maths — Complex Numbers — 90m

30 min Relearn
45 min Exam Questions
15 min Corrections
```

Tasks must link to:

```text
subject_id
syllabus_topic_id
reason
priority_score
source
```

Suggested source values:

```text
adaptive-planner
manual
tutor
retest
mock-followup
```

---

# 25. EXPLAIN WHY TASK WAS GENERATED

Every generated task should store/display a concise explanation.

Examples:

```text
Scheduled because this topic has 4 unresolved errors across your last 3 papers.
```

```text
Scheduled because accuracy is 52% and confidence is 2/5.
```

```text
Scheduled because the retest is overdue.
```

This makes the planner transparent.

---

# 26. PAPER-CYCLE PROTECTION

Do not allow endless paper grinding.

If a recent mock has:

```text
cycle_status != Complete
```

prioritize:

```text
mark paper
error review
corrections
retest
```

before scheduling another paper in the same subject, unless manually overridden.

---

# 27. MOCK SCHEDULE

Create configurable weekly mock scheduling.

Suggested starting template:

```text
Monday
Mathematics paper

Tuesday
Physics paper

Wednesday
Further Mathematics paper

Thursday
Mathematics paper

Friday
Physics paper

Saturday
Further Mathematics or diagnostic

Sunday
Corrections / review / light study
```

Do NOT automatically enforce this exact schedule.

Store as a configurable template.

---

# 28. STARTUP DAY MODE

Default template:

```text
Morning academic block
Startup/work day
Evening academic block
```

Academic target:

```text
approximately 4–5 hours
```

Prioritize critical topics/retests.

---

# 29. NYC / EVENT DAY MODE

Default:

```text
Morning study
Conference/meetup/activity
Evening study
Event reflection
```

Academic target:

```text
approximately 4 hours
```

Allow manual override.

---

# 30. WEEKLY PLAN

Add:

```text
Generate Week
```

The weekly generator should distribute:

```text
content revision
diagnostics
topic practice
mock papers
corrections
retests
```

across seven days.

Avoid generating six identical days.

---

# 31. REVISION PHASES

Allow academic phases:

```text
Content Recovery
Diagnostic Mapping
Topic Practice
Past Paper Intensive
Exam Performance
Final Revision
```

Daily-plan weighting should depend on current phase.

Example:

## Content Recovery

More:

```text
learning
diagnostics
targeted questions
```

Less:

```text
full papers
```

## Past Paper Intensive

More:

```text
papers
error analysis
retests
```

---

# 32. DAILY PLAN MANUAL OVERRIDE

Generated plans must remain editable.

Sachith should be able to:

```text
drag/reorder
change duration
replace topic
add task
remove task
regenerate remaining tasks
```

Never force an algorithmic plan.

---

# 33. REGENERATE SAFELY

Provide:

```text
Regenerate Today's Plan
```

Options:

```text
Keep completed tasks
Keep manually-added tasks
Replace only unstarted generated tasks
```

Never wipe completed work.

---

# 34. TOMORROW RECOMMENDATION

Add dashboard card:

```text
Tomorrow's Highest Priorities
```

showing 3–5 topics.

Example:

```text
1. Physics — Electric Fields
2. Further Maths — Complex Numbers
3. Physics — Practical Data Analysis
4. Maths — Integration
```

---

# 35. WEEKLY REVIEW ANALYTICS

Show:

```text
hours by subject
planned vs actual
topics progressed
diagnostics completed
papers completed
papers awaiting error review
errors created
errors resolved
marks recovered
highest-priority weaknesses
```

---

# 36. PROGRESS HEATMAP

Create syllabus heatmaps.

Suggested statuses/colors should use the existing design system rather than hard-coding arbitrary colours.

Display:

```text
topic
accuracy
confidence
priority
status
recent errors
```

Allow:

```text
filter by paper
filter by module
filter by priority
```

---

# 37. EXCEL RELATIONSHIP

Do NOT use Excel as the syllabus source after this implementation.

The repository syllabus definitions are the source of curriculum structure.

Excel remains for:

```text
initial progress import
bulk data import
backup
export
tutor review
parent review
```

---

# 38. IMPORT OLD EXCEL TOPIC DATA

If existing Excel topic rows match syllabus topics by name, try to map them.

Mapping order:

```text
stable specification code
exact normalized topic name
manual mapping
```

Never create duplicate official syllabus topics from Excel.

If a row cannot be mapped:

```text
flag for manual review
```

---

# 39. SEED ACTION

Create a server-side action such as:

```typescript
seedSachithSyllabuses()
```

or separate:

```typescript
seedMaths9MA0()
seedFurtherMaths9FM0E0()
seedPhysics7408C()
```

It must be:

```text
idempotent
safe
authenticated
```

---

# 40. INITIAL SETUP

After syllabus load, Sachith should see:

```text
Maths
B → A*
Syllabus loaded
0% assessed

Further Maths
C → A
Syllabus loaded
0% assessed

Physics
D → A
Syllabus loaded
0% assessed
```

Do not falsely show poor performance simply because no diagnostic data exists.

Use:

```text
Not assessed
```

instead of 0% accuracy where appropriate.

---

# 41. FIRST 3-WEEK DIAGNOSTIC MODE

Add optional:

```text
Diagnostic Phase
```

The goal is to baseline all major topics.

During this mode, plan generation should prioritize:

```text
major syllabus coverage
short diagnostics
weakness identification
```

rather than immediately doing excessive full papers.

At the end show:

```text
Strong
Developing
Weak
Critical
Not Assessed
```

topic groups.

---

# 42. NO FAKE AI

V1 planner should be deterministic/rule-based.

Do not require an LLM.

Architecture may later support:

```text
AI Coach
```

which receives structured planner context and explains/refines plans.

But the rule engine must work fully without AI.

---

# 43. AUDIT EVERYTHING IMPORTANT

Track:

```text
syllabus seeded
diagnostic entered
priority changed
daily plan generated
plan regenerated
topic status changed
topic mastery achieved
```

using the existing activity-history system.

---

# 44. TESTS

Add tests for:

```text
syllabus idempotency
topic hierarchy
priority scoring
daily hour allocation
subject minimum allocation
overdue retest priority
unfinished mock cycle priority
normal-day generation
startup-day generation
NYC-day generation
mock-day generation
regeneration preserving completed tasks
```

---

# 45. DOCUMENTATION

Create:

```text
docs/SYLLABUS_AND_PLANNER.md
```

Explain:

```text
qualifications configured
paper mappings
syllabus seed architecture
topic/progress model
priority algorithm
daily planner logic
daily modes
diagnostics
mock feedback loop
Excel relationship
```

---

# 46. FINAL USER EXPERIENCE

The desired feedback loop is:

```text
Official Syllabus
       ↓
Diagnostic
       ↓
Weakness Map
       ↓
Daily Plan
       ↓
Study
       ↓
Mock
       ↓
Error Log
       ↓
Topic Priority
       ↓
Correction / Retest
       ↓
Next Daily Plan
       ↓
Improvement
```

This loop is the central purpose of the academic portion of Sachith Gap-Year OS.

---

# 47. DEFINITION OF DONE

Implementation is complete when:

* Edexcel Maths 9MA0 syllabus is loaded.
* Edexcel Further Maths 9FM0 E0 syllabus is loaded.
* AQA Physics 7408C + Engineering Physics syllabus is loaded.
* No irrelevant optional modules are present.
* Topics are hierarchical.
* Topics map to papers.
* Student progress is separated cleanly from syllabus structure.
* Initial topics contain no fake performance data.
* Diagnostics can be recorded.
* Topic priority is calculated.
* Mock errors influence topic priority.
* Daily plans are automatically generated.
* Plans explain why each task was selected.
* Normal/Mock/Startup/NYC/Light modes work.
* Users can manually override plans.
* Unfinished paper error-analysis cycles are prioritised.
* Weekly plans can be generated.
* Analytics work by paper and topic.
* Marks-lost analytics work.
* Excel import does not duplicate syllabus topics.
* Existing CRUD/UI remains functional.
* `npm run lint` passes.
* `npm run build` passes.

At completion, report:

1. Files changed.
2. SQL changes/manual Supabase migration required.
3. Syllabus data created.
4. Priority algorithm implemented.
5. Planner rules implemented.
6. How to seed all three syllabuses.
7. How to reset progress safely.
8. How to test the feedback loop manually.
9. Any optional enhancements left for later.
