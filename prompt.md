# Build Prompt: Sachith Gap-Year OS

Build a simple, polished, responsive web application called **“Sachith Gap-Year OS”**.

The app will be deployed on **Vercel** and should work as both:

1. a **private daily operating system** for Sachith to plan, study, log progress, analyse A-level performance, record tutoring, track startup/engineering experience, maintain journals and manage his gap year; and
2. a **selective public portfolio/showcase** that can later be shared with universities, tutors, mentors or internship contacts.

The entire product should feel simple, motivating and lightweight rather than like a complicated school-management system.

---

# 1. PURPOSE

Sachith is taking a structured gap year with four major goals:

## Academic Goal

Improve A-level results from:

* Mathematics — B
* Economics — B
* Further Mathematics — C
* Physics — D

Primary resit focus:

* Mathematics
* Further Mathematics
* Physics

Economics B should normally be retained and not consume significant study time unless explicitly enabled.

Target grades:

* Mathematics — A*
* Further Mathematics — A
* Physics — A

The academic system should help Sachith achieve these through:

* structured revision
* tutoring
* topic completion
* daily practice
* past papers
* mocks
* detailed error analysis
* weekly and monthly analytics
* adaptive planning

---

# 2. GAP-YEAR GOALS

The app should track six parallel areas:

1. **A-Level Academic Recovery**
2. **Tutoring**
3. **Engineering / Startup Apprenticeship**
4. **Engineering Projects**
5. **Startup & Entrepreneurial Learning**
6. **Personal Development / Conferences / Networking / NYC Experience**

Create separate dashboards for each but bring the important information together on the home dashboard.

---

# 3. TECH STACK

Build using:

* Next.js latest stable version
* TypeScript
* Tailwind CSS
* shadcn/ui or similarly clean component library
* Supabase or Firebase for database/authentication
* Vercel deployment
* Recharts for analytics
* responsive desktop/mobile layout

Prefer Supabase unless there is a strong implementation reason to choose Firebase.

Authentication:

* Email/password
* Google login

Initially support one main user: **Sachith**.

Architecture should allow adding Mentor, Tutor and Parent accounts later.

---

# 4. APP STRUCTURE

Main navigation:

* Dashboard
* Today
* Study Plan
* Subjects
* Tests & Mocks
* Error Log
* Tutoring
* Gap-Year Journal
* Startup Experience
* Engineering Projects
* NYC / Events
* Learning Library
* Analytics
* Goals
* Portfolio
* Settings

Keep the UI clean.

Avoid excessive menus, animations and complexity.

---

# 5. MAIN DASHBOARD

Create a motivating dashboard showing:

## Today's Focus

Display:

* Today's date
* current study streak
* today's planned study hours
* completed study hours
* next tutoring session
* next mock test
* current academic targets
* today's engineering/startup activity

Show three prominent subject cards:

### Mathematics

Current: B
Target: A*

### Further Mathematics

Current: C
Target: A

### Physics

Current: D
Target: A

Each card should show:

* syllabus completion %
* current estimated grade
* latest mock grade
* last 5-paper average
* revision hours this week
* weak-topic count
* next action

---

# 6. DAILY ACTION PLAN

Create a **Today page**.

Every day should generate or allow creation of a daily schedule.

Default academic target:

### Physics

2 hours

### Mathematics

2 hours

### Further Mathematics

2 hours

Maximum planned academic study:

**6 hours per day**

Allow flexibility.

Example schedule:

07:30–09:30 — Physics
09:45–11:45 — Mathematics
12:00–14:00 — Further Mathematics

When Sachith is working at the startup or travelling, allow:

Morning:
2–3 hours

Evening:
2–3 hours

but maintain the daily academic target.

Each daily item should have:

* task
* subject/category
* topic
* estimated duration
* actual duration
* status
* difficulty
* confidence before
* confidence after
* notes

Statuses:

* Planned
* In Progress
* Complete
* Missed
* Rescheduled

---

# 7. DAILY CHECK-IN

At the beginning of the day ask:

## Daily Check-in

* Energy: 1–5
* Focus: 1–5
* Motivation: 1–5
* Sleep hours
* Today's main academic goal
* Today's main personal/engineering goal

At the end of the day ask:

* Total focused study time
* What went well?
* What was difficult?
* Biggest mistake today
* Biggest learning today
* What should change tomorrow?
* Confidence about current progress: 1–5

Keep this quick enough to complete in under 3 minutes.

---

# 8. SUBJECT DASHBOARDS

Create individual pages for:

## Mathematics

## Further Mathematics

## Physics

Each should contain:

### Overview

* Current achieved grade
* Target grade
* Current estimated grade
* syllabus completion
* total study hours
* number of papers completed
* average recent paper score
* grade trend

### Topic Tracker

Allow all syllabus topics to be entered manually initially.

Each topic has status:

* Not Started
* Learning
* Revised
* Practice Required
* Exam Ready
* Mastered

Also store:

* confidence 1–5
* last revised
* question accuracy
* number of errors
* notes
* tutor feedback

Display topics grouped by:

### Strong

### Developing

### Weak

### Critical

---

# 9. REVISION WORKFLOW

For every topic support the workflow:

**Learn → Practice → Timed Questions → Past Paper → Error Analysis → Relearn → Retest → Master**

Display this as a progress pipeline.

Do not allow a topic to become “Mastered” simply because it has been revised.

Suggested mastery criteria:

* at least 80% accuracy on topic questions
* successfully answered in at least two later tests
* confidence 4/5 or higher

Allow criteria to be configured.

---

# 10. CONTENT REVISION PLAN

Create a revision-planning system.

For each subject:

* syllabus topics
* target completion date
* priority
* estimated revision hours
* completed hours
* confidence
* status

The user should be able to create phases such as:

### Phase 1 — Content Recovery

Review entire syllabus.

### Phase 2 — Topic Practice

Complete targeted examination questions.

### Phase 3 — Past Paper Intensive

Full timed papers.

### Phase 4 — Exam Performance

Time management, accuracy and high-grade questions.

### Phase 5 — Final Revision

Weak-area elimination.

Show progress across phases.

---

# 11. TEST & MOCK SYSTEM

This is one of the most important parts of the application.

Allow Sachith to log:

* full past papers
* mock papers
* topic tests
* tutor assessments
* timed exercises

For each exam record:

* subject
* exam board
* paper
* year
* paper number
* date
* duration
* timed / untimed
* raw marks
* maximum marks
* percentage
* grade
* grade boundaries if available
* target grade
* time remaining
* notes

Calculate:

### Score %

### Grade

### Marks from next grade

### Marks from target grade

Example:

Physics Paper 1
63 / 100
63%

Current grade: B
A boundary: 68

Display:

**5 marks away from A**

---

# 12. PAST PAPER ROUTINE

Support a scheduled examination routine.

The goal is frequent papers, but the system must prevent “paper grinding” without learning.

After every paper require:

1. Paper completed
2. Marked
3. Errors logged
4. Weak topics identified
5. Corrections completed
6. Retest scheduled

Show incomplete papers in a warning state if the student has completed a paper but has not analysed mistakes.

Call this:

**Paper Completion Cycle**

A paper only counts as fully complete after correction and error review.

---

# 13. ERROR LOG

Create a dedicated **Error Log**.

Every missed mark should optionally be logged.

Fields:

* date
* subject
* paper
* question number
* topic
* marks available
* marks lost
* error category
* description
* correct approach
* lesson learned
* corrective action
* retest date
* retest result
* resolved yes/no

Error categories:

* Knowledge Gap
* Formula Recall
* Conceptual Error
* Mathematical Error
* Misread Question
* Poor Explanation
* Missing Working
* Units
* Significant Figures
* Time Pressure
* Careless Error
* Practical / Experimental Question
* Graph / Interpretation
* Exam Technique
* Other

Build analytics showing:

### Most common error types

### Marks lost by category

### Marks lost by topic

### Marks recovered after retesting

This should become one of the most important analytics pages.

---

# 14. ERROR-RECOVERY SYSTEM

When the same topic/error occurs repeatedly, automatically flag it.

Example:

“Electromagnetic Induction has appeared in 4 errors across 3 papers.”

Display:

### Critical Weakness

Suggested action:

* revise topic
* complete 20 targeted questions
* tutor review
* retest in 7 days

Allow the app to automatically generate remediation tasks.

---

# 15. GRADE ANALYTICS

Create charts for:

## Grade Trend

For each subject show:

* paper score over time
* estimated grade
* target grade line

## Rolling Performance

Show:

* latest paper
* last 3-paper average
* last 5-paper average
* best paper
* worst paper

## Subject Readiness

Calculate a simple readiness score using:

* syllabus completion
* recent mock performance
* consistency
* error recurrence
* confidence

Example:

Mathematics
Exam Readiness: 82%

Physics
Exam Readiness: 58%

Avoid pretending this is an official grade prediction.

Label clearly:

**Internal Progress Estimate**

---

# 16. TUTORING SYSTEM

Create a Tutoring page.

For each tutor store:

* name
* subject
* contact
* frequency
* lesson duration
* notes

For each tutoring session:

* date
* subject
* topics covered
* problems identified
* tutor recommendations
* homework assigned
* homework completed
* confidence before
* confidence after

Create:

### Questions for Tutor

Sachith should be able to add questions during independent study.

At the next tutoring session, display unanswered questions.

After the session, allow them to be marked:

* Answered
* Needs Practice
* Resolved

---

# 17. WEEKLY TUTOR REPORT

Generate a simple weekly report that can be shared with tutors.

Include:

* hours studied
* topics completed
* papers attempted
* mock scores
* recurring errors
* weak topics
* questions for tutor
* next week's goals

Allow export/print as PDF later.

---

# 18. GAP-YEAR JOURNAL

Create a structured journal.

Daily entries can contain:

### Academic

What did I learn?

### Engineering

What technical concept did I encounter?

### Startup

What business/product lesson did I learn?

### Problem Solving

What problem did I face and how did I approach it?

### Failure

What didn't work?

### Reflection

What would I do differently?

### New Question

What am I curious about now?

### Evidence

Photos, links, GitHub commits, documents, videos.

Tag entries:

* Academic
* Maths
* Physics
* Further Maths
* Engineering
* Startup
* EV
* Drone
* Manufacturing
* Electronics
* Software
* New York
* Conference
* Networking
* Project
* Personal

---

# 19. WEEKLY REFLECTION

Every Sunday generate a structured reflection:

## Academic

* Hours studied
* Topics completed
* Papers completed
* Best score
* Weakest area
* Improvement from previous week

## Engineering

* What did I build?
* What did I observe?
* What engineering principle did I learn?

## Startup

* What customer/business problem did I notice?
* What did I learn about product development?
* What did I learn about manufacturing/cost?

## Personal

* What challenged me?
* What am I proud of?
* What will I do differently next week?

Then create:

### Top 3 Goals for Next Week

---

# 20. MONTHLY REVIEW

Generate a monthly scorecard.

Show:

### Academic

Maths grade trend
Further Maths grade trend
Physics grade trend

Study hours

Mock count

Average paper score

Error reduction

### Engineering

Projects worked on

Skills learned

Prototype progress

### Startup

Problems observed

Customer/business lessons

Mentor conversations

### Exposure

Events attended

People met

Interesting companies

### Personal Development

Independence

Communication

Confidence

Reflection quality

---

# 21. HYDERABAD STARTUP EXPERIENCE

Create a dedicated **Startup Experience** section.

Sachith will potentially spend 1–2 months with an electric scooter and drone manufacturing startup in Hyderabad.

Track:

* company
* mentor
* dates
* department/team
* objectives

Create weekly phases:

### Week 1–2: Observe & Learn

Learn:

* electric motors
* batteries
* BMS
* motor controllers
* EV architecture
* drone systems
* flight controllers
* sensors
* embedded electronics
* manufacturing
* testing
* BOM
* quality
* supply chain

### Week 3–4: Identify Problems

Ask employees/engineers:

* What wastes time?
* What fails frequently?
* What is difficult to measure?
* What process is manual?
* What costs too much?
* What causes customer complaints?

Create a:

## Problem Discovery Log

Fields:

* problem
* who experiences it
* frequency
* impact
* existing solution
* possible improvement

### Week 5–7: Build

Select one problem.

Document:

Problem
Hypothesis
Design
Prototype
Testing
Failure
Iteration

### Week 8: Present

Create a presentation:

* Problem
* Evidence
* Solution
* Prototype
* Results
* Business value
* Next steps

---

# 22. STARTUP LEARNING

Create a simple Startup Learning module.

Track concepts such as:

* Customer Problem
* MVP
* Customer Discovery
* Product-Market Fit
* BOM
* Unit Economics
* Gross Margin
* Prototype vs Production
* Manufacturing
* Supply Chain
* Pricing
* Distribution
* Customer Acquisition
* Funding
* Cash Flow
* Competition
* Moat
* Iteration

Each concept should allow:

* definition
* example observed
* notes
* applied yes/no

Avoid making this a formal business course.

The goal is learning from real experience.

---

# 23. ENGINEERING PROJECTS

Create an Engineering Projects section.

Each project includes:

* title
* problem
* description
* why it matters
* technologies
* engineering concepts
* status
* start/end dates
* GitHub
* demo
* images
* videos
* documents

Workflow:

**Problem → Research → Requirements → Design → Prototype → Test → Failure → Iterate → Final Result → Reflection**

Suggested first projects:

### Project 1 — EV Battery / Telemetry Monitor

Possible technology:

* ESP32
* sensors
* Python
* API
* simple dashboard

Potential measurements:

* voltage
* current
* temperature
* battery state
* trip data

### Project 2 — Drone Telemetry / Autonomous System

Possible areas:

* sensors
* GPS
* flight data
* embedded software
* telemetry
* basic computer vision

Do not require both projects.

One high-quality project is preferable to several shallow ones.

---

# 24. PROJECT ENGINEERING LOGBOOK

For every project allow daily/weekly engineering notes:

* objective
* test performed
* result
* unexpected behaviour
* hypothesis
* modification
* new result
* lesson

Emphasise documenting failures as well as successes.

---

# 25. NYC / CONFERENCE EXPERIENCE

Create an **NYC Experience** section.

Track:

* meetups
* conferences
* university events
* startup events
* engineering events
* founder conversations
* technology demonstrations

For each event:

* event name
* date
* venue
* topic
* speakers
* people met
* company/startup
* notes

Require short reflection:

### What was being built?

### What problem does it solve?

### What technology enables it?

### What is the business model?

### What surprised me?

### What would I research further?

At the end of NYC experience automatically create:

## “10 Ideas That Changed How I Think About Engineering and Startups”

based on journal entries.

---

# 26. NETWORKING LOG

Create a lightweight CRM.

Fields:

* name
* company
* role
* where we met
* date
* LinkedIn
* email
* topics discussed
* follow-up
* next action

Do not overcomplicate it.

---

# 27. LEARNING LIBRARY

Allow Sachith to save:

* articles
* YouTube videos
* papers
* books
* courses
* GitHub repos
* podcasts
* conference notes

Fields:

* title
* URL
* category
* subject
* why saved
* completed yes/no
* key takeaway

---

# 28. GOALS

Create annual, monthly and weekly goals.

Main annual goals should initially be:

### Academic

Maths → A*

Further Maths → A

Physics → A

### Engineering

Complete at least one substantial engineering project.

### Startup

Complete meaningful work inside the EV/drone startup.

### Exposure

Attend relevant engineering/startup events.

### Portfolio

Build documented evidence of the gap year.

---

# 29. HABITS / CONSISTENCY

Track:

* study completed
* revision hours
* paper completed
* exercise
* reading
* journal entry
* sleep

Do not make this feel like a gamified children's app.

Use subtle streaks and consistency indicators.

---

# 30. PUBLIC PORTFOLIO MODE

The majority of the application is private.

Create a separate public portfolio route:

`/portfolio`

This can later be shared with:

* universities
* internship providers
* mentors
* professional contacts

Do NOT show:

* private journal entries
* daily emotions
* tutor private notes
* detailed grades unless explicitly selected
* personal information

Public sections:

## About Sachith

Engineering student / aspiring engineer interested in:

* electrical engineering
* mechanical engineering
* EVs
* drones
* robotics
* startups

## Gap-Year Mission

Explain briefly that the year is being used to strengthen academic foundations while gaining practical engineering and startup exposure.

## Engineering Experience

Startup experience.

## Projects

Project cards with:

* problem
* technology
* outcome
* images
* GitHub
* lessons

## Events & Learning

Selected NYC/Hyderabad experiences.

## Skills

Potentially:

* Mathematics
* Physics
* Electronics
* Python
* Embedded Systems
* CAD
* EV technologies
* Drone systems

Only show actual acquired skills.

## Engineering Journal

Allow selected journal entries to be published.

---

# 31. UCAS EVIDENCE BUILDER

Create a page called:

**UCAS Evidence**

The purpose is NOT to automatically write a personal statement.

Instead collect evidence Sachith can later use.

Organise evidence around:

### Why do you want to study this subject?

### How have your qualifications prepared you?

### What have you done outside formal education to prepare?

For every experience allow:

* what happened
* what I personally did
* what I learned
* what engineering concept it relates to
* why it increased my interest
* evidence/link

Flag weak entries such as:

“I attended a conference.”

Encourage stronger reflections such as:

“I attended X, where I learned Y. This changed my understanding of Z because…”

---

# 32. TIMELINE

Create a full gap-year timeline.

Initial phases:

## August–September 2026

Academic diagnostic
Tutor selection
Content recovery
Cardiff deferral request

## September–December 2026

Core academic rebuild
Regular mocks
UCAS preparation
Potential startup preparation

## Hyderabad — 1–2 months

EV/drone apprenticeship
Engineering project
Daily A-level study maintained

## NYC — approximately 1 month

Meetups/conferences
Independent learning
Networking
A-level study maintained

## January–March 2027

Advanced exam preparation
Projects
UCAS/interview activity

## April–May 2027

Intensive past-paper phase
Weak-topic elimination

## May–June 2027

Final revision
A-level examinations

## Summer 2027

Engineering learning/project/work experience

## September 2027

University

All dates should be editable.

---

# 33. DAILY ACADEMIC RULES

Build configurable rules.

Default:

### Rule 1

Academic work happens even during travel/startup periods.

### Rule 2

Maximum normal study target ≈ 6 focused hours per day.

### Rule 3

Every mock must generate an error review.

### Rule 4

Every repeated error creates a remediation task.

### Rule 5

No topic is considered mastered based only on reading/revision.

### Rule 6

Recent exam performance matters more than historical confidence.

### Rule 7

Quality of review matters more than number of papers completed.

---

# 34. ANALYTICS DASHBOARD

Build a visually clean analytics dashboard showing:

## Academics

* study hours by subject
* grade trend
* paper score trend
* syllabus completion
* weak topics
* errors by category
* marks lost
* marks recovered
* mock frequency
* rolling average

## Productivity

* planned vs actual hours
* completion rate
* consistency

## Engineering

* project hours
* milestones completed
* skills acquired

## Startup

* experience hours
* problems identified
* experiments/projects completed

## Journal

* entries
* learning themes

---

# 35. SMART INSIGHTS

Implement simple rule-based insights initially.

Examples:

“Physics scores have improved for 3 consecutive papers.”

“Mathematics average over the last five papers is 78%.”

“Further Mathematics integration has caused 14 marks of loss across the last four papers.”

“You have completed six past papers but two still need error analysis.”

“Your average Physics performance has improved by 9 percentage points this month.”

“You have not revised Electromagnetism for 18 days.”

Do NOT claim AI-generated certainty.

These are progress observations.

---

# 36. OPTIONAL AI ASSISTANT

Design the data model so an AI assistant can later be added.

Possible prompts:

### Daily Planner

“Based on my weak topics and upcoming mocks, what should I study tomorrow?”

### Error Analyst

“Analyse my recent error log and identify the highest-value topics to fix.”

### Weekly Coach

“Review my week and recommend the top priorities for next week.”

### Tutor Preparation

“Generate the five most important questions to discuss with my Physics tutor.”

### Reflection Assistant

“Help me turn this startup experience into a meaningful engineering reflection.”

Do not require AI integration for V1.

---

# 37. DATABASE MODEL

Design entities approximately like:

User

Subject

Topic

StudySession

DailyPlan

Task

Exam

ExamQuestionError

Tutor

TutorSession

TutorQuestion

Goal

JournalEntry

Project

ProjectLog

StartupExperience

StartupProblem

Event

Contact

LearningResource

WeeklyReview

MonthlyReview

PortfolioItem

Skill

Attachment

Make relationships clean and extensible.

---

# 38. UI DESIGN

The application should feel:

* modern
* clean
* calm
* engineering-oriented
* professional
* mature

Avoid:

* childish gamification
* excessive gradients
* clutter
* complicated LMS appearance

Use cards, progress bars, simple charts and good typography.

Desktop should be excellent but mobile must be fully functional.

---

# 39. HOME SCREEN PRIORITIES

On opening the app Sachith should immediately see:

### TODAY

6 hours planned

Physics — 2h
Maths — 2h
Further Maths — 2h

### NEXT MOCK

Physics Paper 1
Saturday

### CURRENT PERFORMANCE

Maths — A
Target A*

FM — B
Target A

Physics — C
Target A

### TOP WEAKNESS

Physics — Electric Fields

### STARTUP / ENGINEERING

EV Telemetry Project
Next task: Integrate current sensor

### DAILY JOURNAL

Not completed

---

# 40. MVP

Build the first version around these features only:

1. Authentication
2. Dashboard
3. Daily Plan
4. Subject tracking
5. Topic tracking
6. Study sessions
7. Mock/past papers
8. Error log
9. Tutoring
10. Journal
11. Startup experience
12. Engineering projects
13. Events/NYC log
14. Analytics
15. Public portfolio

Do not overengineer V1.

---

# 41. SEED DATA

Populate the app initially with:

## Mathematics

Achieved grade: B
Target grade: A*

## Further Mathematics

Achieved grade: C
Target grade: A

## Physics

Achieved grade: D
Target grade: A

## Economics

Achieved grade: B
Status: Completed / no active resit by default

Initial overall objective:

**A*AA across Maths, Further Maths and Physics.**

---

# 42. DAILY EXPERIENCE

The product should encourage this operating loop:

## Morning

Open dashboard.

Review priorities.

Start first study session.

## During Study

Track topic and focused time.

Add questions/errors when encountered.

## After Mock

Enter score.

Log errors.

Schedule corrections.

## Startup / Engineering

Log what was learned/built.

## Evening

Complete 3-minute reflection.

## Sunday

Complete weekly review.

The app should make this behaviour easier, not create additional administration.

---

# 43. SUCCESS CRITERIA

The website succeeds if, after 9–12 months, we can clearly answer:

### Academics

Did Maths improve from B toward A*?

Did Further Maths improve from C toward A?

Did Physics improve from D toward A?

What caused lost marks?

Which weaknesses were corrected?

How consistent was Sachith?

### Engineering

What did he actually build?

What technical skills did he develop?

What engineering problems did he encounter?

### Startup

What did he understand about turning engineering into a product/business?

### Personal Development

How did his thinking, independence, communication and problem-solving develop?

### University Application

What concrete evidence does he now have to demonstrate motivation and readiness for engineering?

---

# 44. FINAL PRODUCT REQUIREMENT

Build this as a **Gap-Year Operating System**, not simply a study tracker.

The core philosophy is:

> **Learn → Apply → Test → Fail → Analyse → Improve → Document → Demonstrate**

The year should produce three major outcomes:

## 1. Academic Outcome

A*/A-level performance in the subjects required for engineering.

## 2. Engineering Outcome

Real experience building and solving technical problems.

## 3. Personal Outcome

A more independent, curious and startup-minded university entrant.

Keep all components simple enough that Sachith will genuinely use the application every day.

Build this in 3 versions 
V1: daily plan + subjects + study sessions + mocks + error log + analytics.
V2: tutoring + journal + Hyderabad startup + engineering projects.
V3: NYC/events + UCAS evidence + public portfolio + AI coach.