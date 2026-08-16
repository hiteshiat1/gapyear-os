# TASK

You are working on the existing repository:

`hiteshiat1/sachith-gapyear`

Do NOT rebuild the application from scratch.

The current application is a functioning Next.js App Router frontend for **Sachith Gap-Year OS**. It currently uses mock/static data and already contains most of the UI/routes we want.

Your job is to transform the existing frontend into a **fully persistent, editable, tracked application backed by Supabase**, while preserving the current visual design and application structure as much as possible.

I, the developer/user, will perform any manual Supabase dashboard actions, including:

* creating the Supabase project
* running SQL in the Supabase SQL editor
* configuring Google OAuth if required
* obtaining project URL/API keys
* adding Vercel environment variables
* creating Storage buckets if required

Your responsibility is to implement all repository-side code and provide clear manual instructions for anything I need to do in Supabase.

---

# IMPORTANT EXISTING REPOSITORY CONTEXT

Inspect the entire repository before making changes.

Important existing files include:

```text
src/lib/data.ts
src/lib/supabase.ts
src/app/page.tsx
src/app/*
src/components/*
supabase/schema.sql
package.json
prompt.md
```

The repository already contains application routes including areas such as:

```text
/
analytics
errors
events
goals
journal
library
portfolio
projects
settings
startup
subjects
tests
today
tutoring
```

or similar routes present in the repository.

Do not assume route names. Inspect the actual tree.

The existing mock domain objects currently include concepts such as:

```typescript
Subject
Topic
DailyTask
Exam
ErrorEntry
```

The existing `src/lib/data.ts` currently contains static arrays and derived helper functions.

The goal is to replace static data access with Supabase-backed repositories/services while maintaining a small seed/mock fallback only for local development if explicitly enabled.

---

# CORE PRINCIPLE

The application must become:

```text
Next.js UI
      ↓
Server Actions / repository layer
      ↓
Supabase PostgreSQL
      ↓
History + analytics + snapshots
```

Excel should become:

```text
Excel → Import → Validate → Preview → Upsert → Supabase
Supabase → Export → Excel
```

Supabase PostgreSQL is the **single source of truth**.

Do NOT make Excel or Google Sheets the live primary database.

---

# PHASE 0 — INSPECT BEFORE CODING

Before changing anything:

1. Inspect every file under:

```text
src/app
src/components
src/lib
supabase
```

2. Identify every import from:

```typescript
@/lib/data
```

3. Produce an internal mapping:

```text
Current route/component
→ mock data dependency
→ proposed database entity
→ CRUD requirements
```

4. Inspect the existing `supabase/schema.sql`.

5. Reuse and improve the existing schema rather than unnecessarily replacing it.

6. Identify any places where statistics are hard-coded.

Examples may include:

```text
study streak
subject readiness
daily hours
mock scores
weak topic counts
portfolio project status
next tutoring session
```

All such metrics should ultimately derive from database records.

---

# PHASE 1 — SUPABASE CLIENT ARCHITECTURE

The app uses Next.js App Router.

Install if not already installed:

```bash
npm install @supabase/ssr
```

Keep:

```bash
@supabase/supabase-js
```

Replace the existing single global Supabase client pattern with proper helpers.

Create something similar to:

```text
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/supabase/middleware.ts
```

Use current recommended Supabase SSR patterns.

Browser components use a browser client.

Server Components, Server Actions and Route Handlers use the server client.

Use cookie-backed sessions.

Do not expose privileged service-role credentials to browser code.

Environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Support fallback naming if appropriate:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

but standardize the app internally.

Never expose:

```env
SUPABASE_SERVICE_ROLE_KEY
```

to client code.

Only use a service-role key in server-only code if absolutely necessary.

Prefer RLS-authenticated user operations instead.

---

# PHASE 2 — AUTHENTICATION

Implement authentication.

Initial methods:

```text
Email/password
Google OAuth-ready
```

Create pages/components as appropriate:

```text
/login
/auth/callback
/logout
```

Protect all private app routes.

The public portfolio route must remain publicly viewable.

After first login, ensure a corresponding `profiles` row exists.

Profile model:

```text
id
full_name
role
created_at
updated_at
```

Initial roles:

```text
student
parent
tutor
mentor
admin
```

Sachith initially uses:

```text
student
```

Do not fully implement advanced multi-user permissions yet, but design database and application code so they can be added later.

---

# PHASE 3 — DATABASE SCHEMA

Review and improve the existing:

```text
supabase/schema.sql
```

Keep its useful existing entities.

The final schema should support at least:

```text
profiles
subjects
topics
daily_plans
daily_tasks
study_sessions
exams
exam_errors
tutors
tutor_sessions
tutor_questions
goals
journal_entries
projects
project_logs
startup_experiences
startup_logs
startup_problems
events
contacts
learning_resources
weekly_reviews
monthly_reviews
portfolio_items
skills
attachments
activity_history
weekly_snapshots
topic_progress_history
```

Add missing tables if needed.

---

# COMMON COLUMNS

For most mutable user-owned tables add:

```sql
id uuid primary key default gen_random_uuid()
owner_id uuid
created_at timestamptz default now()
updated_at timestamptz default now()
created_by uuid
updated_by uuid
version integer default 1
is_deleted boolean default false
```

Use only columns that make sense for each entity.

Prefer soft delete for important user-generated data.

---

# UPDATED_AT SUPPORT

Create a Postgres trigger/function to automatically update:

```text
updated_at
```

whenever a mutable row changes.

---

# ROW LEVEL SECURITY

Enable RLS on every exposed `public` table.

Initial policy:

A logged-in student can:

```text
SELECT
INSERT
UPDATE
DELETE
```

only their own records.

Use:

```sql
auth.uid()
```

against the appropriate owner/profile field.

For child tables that do not directly contain `owner_id`, either:

1. add `owner_id`, or
2. create safe relational policies via parent ownership.

Prefer adding `owner_id` where it significantly simplifies secure access.

The public portfolio should NOT expose arbitrary private tables.

Create a safe public data path for portfolio data only.

---

# PHASE 4 — DOMAIN TYPES

Move types out of `src/lib/data.ts`.

Create:

```text
src/types/database.ts
src/types/domain.ts
```

or a similar clean arrangement.

Create typed models for:

```typescript
Subject
Topic
DailyPlan
DailyTask
StudySession
Exam
ExamError
Tutor
TutorSession
TutorQuestion
Goal
JournalEntry
Project
ProjectLog
StartupExperience
StartupLog
StartupProblem
Event
Contact
LearningResource
WeeklyReview
MonthlyReview
PortfolioItem
Skill
ActivityHistory
WeeklySnapshot
```

Avoid scattering raw Supabase row shapes across components.

Create mapping functions where database snake_case differs from frontend camelCase.

---

# PHASE 5 — REPOSITORY / DATA ACCESS LAYER

Do NOT query Supabase directly from dozens of React components.

Create a repository/service layer.

For example:

```text
src/lib/repositories/subjects.ts
src/lib/repositories/topics.ts
src/lib/repositories/daily-plans.ts
src/lib/repositories/exams.ts
src/lib/repositories/errors.ts
src/lib/repositories/journal.ts
src/lib/repositories/projects.ts
src/lib/repositories/startup.ts
src/lib/repositories/events.ts
src/lib/repositories/tutoring.ts
src/lib/repositories/analytics.ts
```

Each repository should expose well-named functions.

Example:

```typescript
getSubjects()
getSubject(id)
createSubject(input)
updateSubject(id, input)
softDeleteSubject(id)
```

For exams:

```typescript
getExams()
getExam(id)
createExam(input)
updateExam(id, input)
deleteExam(id)
```

For errors:

```typescript
getExamErrors()
getErrorsByExam(examId)
createExamError(input)
updateExamError(id, input)
resolveExamError(id, result)
```

---

# PHASE 6 — SERVER ACTIONS

Use Next.js Server Actions for authenticated mutations where appropriate.

Create:

```text
src/actions/*
```

Examples:

```text
subject-actions.ts
topic-actions.ts
daily-plan-actions.ts
exam-actions.ts
error-actions.ts
journal-actions.ts
project-actions.ts
startup-actions.ts
event-actions.ts
tutor-actions.ts
```

Implement proper validation.

Use a validation library such as Zod if useful.

If using Zod:

```bash
npm install zod
```

Do not trust client-provided `owner_id`.

Always derive owner identity from the authenticated Supabase user on the server.

After mutations use:

```typescript
revalidatePath()
```

where appropriate.

Use optimistic UI only where it improves experience.

---

# PHASE 7 — REMOVE MOCK DATA FROM UI

Systematically replace imports from:

```typescript
@/lib/data
```

with repository/server-backed data.

For each existing route:

1. preserve current layout
2. load real records
3. show useful empty states if there is no data
4. add creation/editing controls
5. support loading/error states

Do not delete the current design just because the data source changes.

---

# DASHBOARD

The existing dashboard currently derives things such as:

```text
active subjects
planned study hours
actual study hours
next mock
weakness
readiness
exam percentages
target marks
portfolio project action
```

Reimplement these from live database records.

The dashboard should show:

```text
Today's planned study
Today's actual study
Study streak
A*AA target
Active subjects
Next tutoring session
Next mock
Next project action
Journal status
Top repeated weakness
Recent exams
```

Do not hard-code:

```text
Sunday, 16 August 2026
5 days
Physics Tuesday 17:00
```

Dates and metrics must come from real data.

---

# PHASE 8 — SUBJECT CRUD

Each subject page must be editable.

Subject fields:

```text
name
short name
achieved grade
target grade
active
```

Derived fields should generally NOT be directly manually edited unless necessary:

```text
estimated grade
latest mock grade
study hours this week
weak topic count
syllabus completion
```

Prefer calculating these from related data.

---

# TOPIC MANAGEMENT

Each subject must support topics.

Topic fields:

```text
name
status
confidence
accuracy
error count
last revised
priority
notes
tutor feedback
```

Statuses:

```text
Not Started
Learning
Revised
Practice Required
Exam Ready
Mastered
```

Priority:

```text
Low
Medium
High
Critical
```

Allow:

```text
create
edit
archive/delete
filter
sort
search
```

---

# TOPIC HISTORY

Create:

```text
topic_progress_history
```

Store important progress changes:

```text
topic_id
owner_id
recorded_at
status
confidence
accuracy
error_count
source
```

Create history automatically when meaningful topic progress changes.

The user should later be able to see:

```text
Electric Fields
54% → 68% → 82%
```

over time.

---

# PHASE 9 — TODAY / DAILY PLAN

Make `/today` fully functional.

For each calendar day create or load one `daily_plan`.

Daily check-in fields:

```text
energy 1–5
focus 1–5
motivation 1–5
sleep hours
academic goal
personal/engineering goal
```

Daily tasks:

```text
task
category
subject
topic
start time
end time
planned duration
actual duration
status
difficulty
confidence before
confidence after
notes
```

Statuses:

```text
Planned
In Progress
Complete
Missed
Rescheduled
```

Support:

```text
Add task
Edit task
Start task
Complete task
Reschedule task
Delete/archive task
```

Calculate planned and actual totals.

Do not enforce exactly 6 hours, but show the configured normal academic target/cap.

---

# EVENING REFLECTION

Allow a quick end-of-day reflection:

```text
What went well?
What was difficult?
Biggest mistake?
Biggest learning?
What should change tomorrow?
Progress confidence 1–5
```

Persist this.

---

# PHASE 10 — STUDY SESSIONS

Allow study sessions independently of daily tasks.

Fields:

```text
date
subject
topic
duration
session type
notes
linked task optional
```

Session types:

```text
Content Revision
Topic Questions
Timed Questions
Past Paper
Mock
Corrections
Tutor Homework
Other
```

Use study sessions to calculate weekly study hours.

---

# PHASE 11 — TESTS & MOCKS

Turn the Tests & Mocks page into full CRUD.

Fields:

```text
subject
exam type
exam board
paper
paper year
date
duration
timed yes/no
raw marks
maximum marks
percentage
grade
target grade
next grade boundary
target grade boundary
time remaining
notes
cycle status
```

Percentage should be calculated.

Display:

```text
marks from next grade
marks from target grade
```

Do not assume a universal grade boundary.

Allow user to enter boundaries per exam.

Cycle statuses:

```text
Needs marking
Needs error review
Corrections scheduled
Complete
```

---

# PAPER COMPLETION CYCLE

A paper should only count as fully completed when:

```text
paper attempted
→ marked
→ errors reviewed
→ corrections made/scheduled
→ retest completed where required
```

Warn on unfinished cycles.

---

# PHASE 12 — ERROR LOG

Make the Error Log one of the strongest parts of the application.

Each error:

```text
date
subject
exam
topic
question number
marks available
marks lost
error category
description
correct approach
lesson learned
corrective action
retest date
retest result
resolved
```

Categories:

```text
Knowledge Gap
Formula Recall
Conceptual Error
Mathematical Error
Misread Question
Poor Explanation
Missing Working
Units
Significant Figures
Time Pressure
Careless Error
Practical / Experimental Question
Graph / Interpretation
Exam Technique
Other
```

Allow inline resolving and editing.

---

# ERROR AUTOMATION

When an exam error is created:

1. increment/recalculate the topic's error count
2. update topic priority if repeated
3. optionally generate a remediation task
4. write an audit event

When an error is resolved:

1. record result
2. record resolved timestamp
3. update analytics

Do not permanently mutate derived counters where they can instead be reliably calculated.

If using cached/denormalized values, keep them consistent.

---

# REPEATED WEAKNESS RULE

Create a configurable rule such as:

If same topic appears:

```text
3+ unresolved errors across 2+ exams
```

then mark/display:

```text
Critical Weakness
```

Suggested actions:

```text
Revise topic
Complete targeted questions
Tutor review
Retest
```

---

# PHASE 13 — TUTORING

Implement:

```text
tutors
tutor_sessions
tutor_questions
```

Tutor:

```text
name
subject
contact
frequency
lesson duration
notes
```

Tutor session:

```text
date/time
subject
topics covered
problems identified
recommendations
homework assigned
homework completed
confidence before/after
```

Tutor question:

```text
subject
question
status
created date
resolved date
linked tutor session optional
```

Statuses:

```text
Unanswered
Answered
Needs Practice
Resolved
```

Show open tutor questions before next lesson.

---

# PHASE 14 — JOURNAL

Make journal entries editable and persistent.

Each journal entry should support structured sections:

```text
Academic learning
Engineering learning
Startup learning
Problem solving
Failure
Reflection
New question
```

Support tags.

Support:

```text
publish_to_portfolio
```

Public portfolio publishing must always be opt-in.

Autosave long-form journal text where practical.

Show:

```text
Saving...
Saved
Save failed
```

---

# PHASE 15 — STARTUP EXPERIENCE

Support Hyderabad EV/drone startup tracking.

Create:

```text
startup_experiences
startup_logs
startup_problems
```

Experience:

```text
company
mentor
dates
department/team
objectives
```

Startup log:

```text
date
experience_id
activity
technical learning
business learning
people worked with
hours
evidence/link
reflection
```

Problem discovery:

```text
problem
who experiences it
frequency
impact
existing solution
possible improvement
status
```

Allow one problem to later be linked to an engineering project.

---

# PHASE 16 — ENGINEERING PROJECTS

Make projects persistent and editable.

Fields:

```text
title
problem
description
why it matters
technologies
engineering concepts
status
dates
GitHub URL
demo URL
publish to portfolio
```

Stages:

```text
Problem
Research
Requirements
Design
Prototype
Test
Iterate
Complete
```

Project logs:

```text
date
objective
test performed
result
unexpected behaviour
hypothesis
modification
lesson
```

---

# PHASE 17 — EVENTS / NYC

Implement events CRUD.

Event:

```text
name
date
venue
topic
speakers
people met
company
notes
publish to portfolio
```

Structured reflection:

```text
What was being built?
What problem does it solve?
What technology enables it?
What is the business model?
What surprised me?
What should I research further?
```

---

# PHASE 18 — NETWORKING

Implement lightweight contacts CRM:

```text
name
company
role
where met
date
LinkedIn
email
topics discussed
follow-up
next action
```

Keep it simple.

---

# PHASE 19 — LEARNING LIBRARY

CRUD for:

```text
title
URL
category
subject
why saved
completed
key takeaway
```

Types/categories can include:

```text
Article
Video
Book
Course
Paper
Podcast
GitHub Repository
Conference Resource
Other
```

---

# PHASE 20 — GOALS

Persist:

```text
Annual
Monthly
Weekly
```

goal types.

Goal fields:

```text
area
title
target
progress
status
start date
target date
notes
```

Default academic goals should include:

```text
Maths B → A*
Further Maths C → A
Physics D → A
```

Economics:

```text
B retained
inactive for resit by default
```

---

# PHASE 21 — ACTIVITY / AUDIT HISTORY

Create:

```text
activity_history
```

This is critical.

Fields:

```text
id
owner_id
entity_type
entity_id
action
field_name
old_value jsonb
new_value jsonb
metadata jsonb
changed_at
changed_by
```

Track at least:

```text
CREATE
UPDATE
DELETE/SOFT_DELETE
RESTORE
COMPLETE
RESOLVE
IMPORT
```

Do not log trivial system-calculated reads.

For important user mutations, create audit records automatically.

Prefer a reusable database trigger or centralized application function.

---

# HISTORY UI

Add reusable:

```text
View History
```

to important records/pages.

Example:

```text
18 Sep
Mock result added — 79%

15 Sep
Integration:
Practice Required → Exam Ready

12 Sep
Confidence:
3 → 4
```

---

# PHASE 22 — WEEKLY SNAPSHOTS

Create:

```text
weekly_snapshots
```

Fields should contain:

```text
owner_id
week_start
week_end
subject metrics jsonb
study metrics jsonb
exam metrics jsonb
error metrics jsonb
project metrics jsonb
created_at
```

Provide an application function/server action:

```text
generateWeeklySnapshot()
```

Do NOT require a cron job for V1.

Allow manual generation from Weekly Review.

Later it can be automated.

---

# PHASE 23 — ANALYTICS

Replace all mock analytics with queries/calculations over database data.

Academic analytics:

```text
study hours by subject
study hours by week
exam score trend
last exam
last 3 average
last 5 average
best result
worst result
topic accuracy
syllabus progress
unresolved errors
marks lost by category
marks lost by topic
marks recovered
paper completion cycles
```

Productivity:

```text
planned vs actual hours
task completion %
study streak
weekly consistency
```

Engineering:

```text
project hours
project milestones
project logs
skills/evidence
```

Startup:

```text
hours
logs
problems discovered
problems progressed
```

Events:

```text
events attended
contacts made
reflections completed
```

---

# INTERNAL READINESS SCORE

Create a transparent internal readiness calculation.

Do NOT represent it as an official prediction.

Label it:

```text
Internal Progress Estimate
```

Possible weighted inputs:

```text
recent exam performance
syllabus completion
topic mastery
error recurrence
consistency
```

Keep formula centralized and documented.

Example only:

```text
50% recent exam performance
20% syllabus/mastery
15% error resolution
15% consistency
```

Do not hard-code opaque magic numbers throughout UI.

---

# PHASE 24 — PUBLIC PORTFOLIO

The public `/portfolio` must NOT query unrestricted private records.

Create a safe portfolio model.

Use `portfolio_items` or a controlled view.

Only expose explicitly published items.

Public sections can include:

```text
About
Gap-Year Mission
Engineering Experience
Projects
Selected Events
Selected Journal Reflections
Skills
```

Do not expose:

```text
private journal entries
daily emotions/check-ins
tutor notes
contacts
personal emails
detailed academic errors
private startup information
```

---

# PHASE 25 — EXCEL IMPORT

Implement Excel upload.

Install:

```bash
npm install xlsx
```

Prefer parsing on the server.

Create:

```text
/settings/import
```

or add it to existing Settings.

Import flow:

### Step 1

Upload `.xlsx`

### Step 2

Read workbook sheet names

### Step 3

Preview sheet counts

Example:

```text
Daily Plan — 287 rows
Maths — 32 rows
Further Maths — 28 rows
Physics — 35 rows
Tests & Mocks — 12 rows
Error Log — 43 rows
```

### Step 4

Show mapping/validation results

### Step 5

Preview rows

### Step 6

Confirm import

### Step 7

Bulk upsert into Supabase

---

# EXCEL SHEET MAPPING

Support the Gap-Year workbook structure conceptually:

```text
Dashboard
Master Plan
Daily Plan
Maths
Further Maths
Physics
Tests & Mocks
Error Log
Tutoring
Weekly Review
Monthly Review
Journal
Startup HYD
Startup Learning
Engineering Projects
NYC Events
Networking
Learning Library
UCAS Evidence
University & UCAS
Portfolio
Habits
Lists
```

Only import sheets with database meaning.

Ignore presentation-only Dashboard/List sheets unless useful.

Suggested mapping:

```text
Daily Plan
→ daily_plans / daily_tasks

Maths
Further Maths
Physics
→ subjects / topics

Tests & Mocks
→ exams

Error Log
→ exam_errors

Tutoring
→ tutors / tutor_sessions

Weekly Review
→ weekly_reviews

Monthly Review
→ monthly_reviews

Journal
→ journal_entries

Startup HYD
→ startup_experiences / startup_logs

Engineering Projects
→ projects / project_logs

NYC Events
→ events

Networking
→ contacts

Learning Library
→ learning_resources

Portfolio
→ portfolio_items
```

---

# IMPORT IDEMPOTENCY

Importing the same workbook twice must NOT duplicate all rows.

Add import metadata where appropriate:

```text
source_type
source_file
source_sheet
source_row_key
imported_at
```

Use stable keys.

For example:

```text
owner + source_sheet + source_row_key
```

Create unique constraints where appropriate.

Use Supabase upsert with explicit `onConflict`.

---

# IMPORT VALIDATION

Validate:

```text
valid dates
valid grades
score ≤ max marks
percentage range
confidence range 1–5
duration ≥ 0
recognized subject
recognized status
recognized error category
```

Do not fail the entire workbook for a few bad rows.

Return:

```text
created
updated
skipped
warnings
errors
```

---

# IMPORT HISTORY

Every import should create an audit record.

Create optional:

```text
import_jobs
```

Fields:

```text
id
owner_id
filename
started_at
completed_at
status
rows_created
rows_updated
rows_skipped
warnings jsonb
errors jsonb
```

This is recommended.

---

# PHASE 26 — EXCEL EXPORT

Add export options:

```text
Full Workbook
Academics Only
Tests & Mocks
Error Log
Tutor Report
Journal
Startup Experience
UCAS Evidence
```

Generate `.xlsx` server-side.

Use current database content.

Do not attempt pixel-perfect reproduction of the original workbook.

Prioritize clean, structured data export.

---

# PHASE 27 — GOOGLE SHEETS

Do NOT build two-way Google Sheets sync in V1.

Design import/export so a user can:

```text
Export XLSX
→ open/import in Google Sheets
```

Leave two-way sync as a future enhancement.

---

# PHASE 28 — FILE ATTACHMENTS

Prepare Storage support.

Do not require it for core V1 functionality.

Attachment entity already exists or should exist.

Support future links to:

```text
journal
project
startup log
event
exam
```

Manual developer step may be required to create Supabase Storage bucket.

Document that step but do not block the app if Storage is not configured.

---

# PHASE 29 — EMPTY STATES

Because the database will initially be empty, every page needs useful empty states.

Example:

```text
No mock papers yet.

Add your first paper to begin tracking performance.
[Add Mock]
```

Do not show fake production values once Supabase is configured.

---

# PHASE 30 — SEED DATA

Provide a controlled seed mechanism.

Create:

```text
supabase/seed.sql
```

or a dev-only seed script.

Initial Sachith academic seed:

```text
Mathematics
achieved: B
target: A*
active: true

Further Mathematics
achieved: C
target: A
active: true

Physics
achieved: D
target: A
active: true

Economics
achieved: B
target: B
active: false
```

Do not automatically seed fake mock scores.

Seed topics only if clearly labeled/sample or based on current known starter topics.

Prefer allowing Excel import to provide full data.

---

# PHASE 31 — DEMO / MOCK MODE

Keep mock data only if useful for development.

Create an explicit environment flag:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Default production behavior must be:

```text
false
```

When Supabase is configured, live data wins.

Avoid silently mixing mock and real records.

---

# PHASE 32 — ERROR HANDLING

Create a reusable error strategy.

Users should see friendly messages:

```text
Could not save changes. Please try again.
```

Developer console/server log can contain detailed Supabase error.

Never expose database internals or secrets.

Use toast/status UI if an existing pattern exists.

Do not introduce a giant component framework if unnecessary.

---

# PHASE 33 — AUTOSAVE

Use autosave for:

```text
journal long-form content
reflection notes
project log notes
```

Use explicit save for:

```text
exam results
grade changes
error records
important structured entities
```

Debounce autosave.

Show:

```text
Saving...
Saved
Failed to save
```

---

# PHASE 34 — OPTIMISTIC UI

Use optimistic UI selectively.

Good candidates:

```text
task status
error resolved
resource complete
goal progress
```

Do not make complex exam or import writes optimistic unless rollback is robust.

---

# PHASE 35 — PERFORMANCE

Use Server Components by default.

Use Client Components only where needed for:

```text
forms
modals
charts
filters
interactive editing
```

Avoid loading the full database into the browser.

Paginate potentially large datasets:

```text
errors
journal
study sessions
events
history
```

---

# PHASE 36 — INDEXES

Add sensible indexes.

At minimum consider:

```sql
subjects(owner_id)
topics(subject_id)
daily_plans(owner_id, plan_date)
study_sessions(owner_id, session_date)
exams(owner_id, completed_on)
exam_errors(subject_id, error_date)
exam_errors(topic_id)
journal_entries(owner_id, entry_date)
project_logs(project_id, log_date)
events(owner_id, event_date)
activity_history(owner_id, changed_at)
weekly_snapshots(owner_id, week_start)
```

Also create unique constraints required for idempotent imports.

---

# PHASE 37 — DATABASE VIEWS / ANALYTICS HELPERS

Use SQL views where they materially simplify analytics.

Potential views:

```text
subject_weekly_study
subject_exam_stats
topic_error_stats
weekly_error_resolution
```

Do not overengineer.

It is acceptable to calculate smaller aggregates in the server repository layer.

---

# PHASE 38 — TESTING

Add practical tests for the highest-risk logic.

At minimum test:

```text
exam percentage
marks from boundary
last-3 average
last-5 average
readiness score
repeated weakness detection
Excel row validation
Excel mapping
upsert key generation
```

Use a lightweight test framework if one is not present.

Do not spend excessive time building broad UI test coverage yet.

---

# PHASE 39 — MANUAL SUPABASE SETUP DOCUMENTATION

Create:

```text
docs/SUPABASE_SETUP.md
```

It must tell me exactly what I need to do manually.

Include:

### 1. Create Supabase project

### 2. Run SQL

Tell me exactly which SQL file(s) to run and in what order.

For example:

```text
supabase/schema.sql
supabase/rls.sql
supabase/triggers.sql
supabase/seed.sql
```

or consolidate if cleaner.

### 3. Copy project URL

### 4. Copy publishable/anon key

### 5. Configure `.env.local`

### 6. Configure Vercel environment variables

### 7. Enable email/password auth

### 8. Optional Google OAuth configuration

### 9. Optional Storage bucket creation

### 10. Create first user

### 11. Seed Sachith profile/data

### 12. Verify RLS

Provide specific verification steps.

---

# PHASE 40 — README

Replace the generic create-next-app README with a useful project README.

Include:

```text
What Sachith Gap-Year OS is
Architecture
Local setup
Supabase setup
Environment variables
Commands
Import/export
Deployment
Data model overview
Security model
```

---

# PHASE 41 — MANUAL CHECKLIST

At the end of the implementation, provide a file:

```text
docs/GO_LIVE_CHECKLIST.md
```

Include:

```text
[ ] Supabase project created
[ ] Schema executed
[ ] RLS verified
[ ] User created
[ ] Environment variables set locally
[ ] Environment variables set in Vercel
[ ] Login tested
[ ] Subject CRUD tested
[ ] Daily task CRUD tested
[ ] Mock CRUD tested
[ ] Error log tested
[ ] Journal tested
[ ] Excel import tested
[ ] Excel duplicate import tested
[ ] Export tested
[ ] Public portfolio tested
[ ] Private routes blocked while logged out
[ ] npm run lint passes
[ ] npm run build passes
```

---

# IMPORTANT SECURITY RULES

1. Never trust owner/user IDs from the browser.

2. Derive authenticated user from Supabase session.

3. Enable RLS.

4. Never expose service-role key.

5. Public portfolio must be explicitly published data only.

6. Contacts, tutor notes, journal-private data and private startup notes must remain private.

7. Excel imports must validate ownership.

8. File uploads must validate type and ownership.

---

# IMPORTANT PRODUCT RULES

Do not turn the app into a giant generic LMS.

Keep Sachith Gap-Year OS focused on:

```text
Learn
→ Practice
→ Test
→ Analyse errors
→ Correct
→ Retest
→ Improve
→ Document
→ Demonstrate
```

Preserve the current visual simplicity.

The application exists to support daily use, not to create administrative overhead.

---

# IMPORTANT ACADEMIC DATA RULES

Primary target profile:

```text
Maths
B → A*

Further Maths
C → A

Physics
D → A

Economics
B retained
```

Economics should be inactive by default.

Never label internal analytics as official UCAS predictions.

Use terminology such as:

```text
Internal Progress Estimate
Current Performance
Exam Readiness
```

---

# IMPLEMENTATION ORDER

Work in this order.

## MILESTONE 1 — Foundation

Implement:

```text
Supabase SSR
Auth
schema cleanup
RLS
types
repositories
profile bootstrap
```

Make sure build passes.

---

## MILESTONE 2 — Academic Core

Implement real CRUD for:

```text
Subjects
Topics
Daily plans
Daily tasks
Study sessions
Tests/mocks
Error log
```

Replace dashboard mock data.

Make sure build passes.

---

## MILESTONE 3 — Coaching / Reflection

Implement:

```text
Tutors
Tutor sessions
Tutor questions
Journal
Goals
Weekly review
Monthly review
```

Make sure build passes.

---

## MILESTONE 4 — Gap-Year Experience

Implement:

```text
Startup experience
Startup logs
Startup problems
Projects
Project logs
Events
Networking
Learning library
```

Make sure build passes.

---

## MILESTONE 5 — History and Analytics

Implement:

```text
Audit log
Topic history
Weekly snapshots
Live analytics
History views
```

Make sure build passes.

---

## MILESTONE 6 — Excel

Implement:

```text
Excel import
Preview
Validation
Idempotent upsert
Import history
Excel export
```

Make sure build passes.

---

## MILESTONE 7 — Portfolio and Production Hardening

Implement:

```text
Public portfolio safety
Empty states
loading/error states
README
Supabase setup docs
go-live checklist
```

Run:

```bash
npm run lint
npm run build
```

Fix all errors.

---

# DO NOT DO THESE THINGS

Do not:

* rebuild all pages from scratch
* replace the current design without reason
* hard-code mock analytics in the new system
* store application state only in browser localStorage
* make Excel the primary datastore
* expose all database data through public portfolio
* use service role from client-side JavaScript
* remove existing useful functionality merely to simplify implementation
* create unnecessary microservices
* introduce Prisma unless there is a compelling requirement
* introduce a separate backend server unless required
* implement Google Sheets two-way sync now
* implement complicated parent/tutor authorization before the student app works
* generate fake mock exam results in production
* create opaque AI-generated grade predictions

---

# CODING STYLE

Use:

```text
TypeScript strict types
small reusable functions
Server Components by default
Server Actions for mutations
clear repository boundaries
meaningful file names
minimal duplication
```

Prefer existing styling/components.

Avoid huge single files.

Keep business logic outside presentation components.

---

# DEFINITION OF DONE

The task is complete when:

1. I can configure Supabase manually.

2. Sachith can sign in.

3. The app contains no required dependency on mock data.

4. He can create/edit/delete/archive his academic data.

5. Daily tasks persist.

6. Study hours persist.

7. Mock results persist.

8. Error logs persist.

9. Correcting an error is tracked.

10. Subject analytics are calculated from real records.

11. Tutor data persists.

12. Journal data persists.

13. Startup/project/event data persists.

14. History shows changes over time.

15. Excel workbook can be imported.

16. Importing the same workbook twice does not duplicate data.

17. Data can be exported to Excel.

18. The public portfolio only shows explicitly published information.

19. Private routes require authentication.

20. RLS prevents users accessing another user's records.

21. `npm run lint` succeeds.

22. `npm run build` succeeds.

23. `docs/SUPABASE_SETUP.md` explains every manual action I need to perform.

24. `docs/GO_LIVE_CHECKLIST.md` exists.

---

# FINAL RESPONSE REQUIRED FROM CODEX

When implementation is complete, give me:

## Files changed

Summarise the important files added/modified.

## Supabase actions I must perform

Give exact steps.

## SQL files to execute

Give their exact order.

## Environment variables

List all required variables.

## Local testing

Give commands.

## Vercel deployment

Tell me exactly what must be configured.

## Excel import test

Give a test procedure.

## Security test

Explain how to verify RLS.

## Remaining optional enhancements

Clearly distinguish these from required V1 functionality.

Do not claim something is complete unless it has actually been implemented and the build has been checked.
