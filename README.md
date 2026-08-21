# Alevs.io

A private A-Levels operating system for academic planning, tutoring, projects, evidence, reflection, analytics, and a selective public portfolio.

## Architecture

```text
Next.js App Router
  -> Server Components / Server Actions
  -> Repository layer
  -> Supabase Auth + PostgreSQL + RLS
  -> Excel import/export utilities
```

Supabase PostgreSQL is the source of truth. Excel is supported for import/export, not as the live database.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK_DATA=false
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is supported as a fallback, but new setups should use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.

## Commands

```bash
npm run dev
npm run lint
npm run test
npm run build
```

## Supabase Setup

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Data Model

Core tables include:

- profiles
- subjects, topics, topic_progress_history
- daily_plans, daily_tasks, study_sessions
- exams, exam_errors
- tutors, tutor_sessions, tutor_questions
- journal_entries, goals, weekly_reviews, monthly_reviews
- projects, project_logs
- startup_experiences, startup_logs, startup_problems
- events, contacts, learning_resources
- portfolio_items, skills, attachments
- activity_history, weekly_snapshots, import_jobs

## Security Model

Private app routes are protected by Supabase Auth when Supabase is configured. RLS policies restrict private tables to `auth.uid() = owner_id`. Public portfolio data is limited to explicitly published records only.

## Import / Export

- Import preview: `/settings/import`
- Export academic workbook: `/api/export`

The import mapper supports known workbook sheets and uses source file/sheet/row keys for idempotency.

## Deployment

Deploy on Vercel. Add the same public Supabase environment variables to the Vercel project and configure the production site URL for OAuth callbacks.
