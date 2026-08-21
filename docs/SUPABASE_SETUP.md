# Supabase Setup

## 1. Create Supabase Project

Create a new Supabase project from the Supabase dashboard.

## 2. Run SQL

Link the Supabase CLI to your project once (`supabase login`, then `supabase link --project-ref YOUR_PROJECT_REF`), then apply everything with:

```bash
supabase db push
```

This runs `supabase/schema.sql`-equivalent setup plus every file in `supabase/migrations/`, in timestamp order, tracked in Supabase's own migration history table. Do not paste migration SQL into the dashboard SQL editor by hand — doing so leaves the CLI's tracking table out of sync with what's actually applied, which previously caused a production incident (a column the app code depended on silently didn't exist, because a migration was applied via the SQL editor but never recorded in migration history, so nobody could tell it was missing until a query failed at runtime).

If you ever do need to run something manually in the SQL editor (e.g. a one-off hotfix before a proper migration file exists), immediately follow up with `supabase migration repair --status applied <version>` so the CLI's tracking stays accurate, and add the equivalent migration file afterward.

After `db push`, run `supabase/seed.sql` in the SQL editor — it creates a helper function only and does not insert data until you call it with the first user UUID (see step 5).

## 3. Configure Local Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK_DATA=false
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is supported as a fallback if your dashboard labels the key that way.

Do not add `SUPABASE_SERVICE_ROLE_KEY` to client-facing environment variables.

## 4. Enable Auth

In Supabase Auth:

1. Enable email/password sign in.
2. Optional: disable email confirmation for local testing.
3. Optional Google OAuth:
   - Add Google provider credentials.
   - Add callback URL: `http://localhost:3000/auth/callback`.
   - For production, add `https://YOUR_DOMAIN/auth/callback`.

## 5. Create First User

Start the app and create the first account from `/login`.

Then copy the new user UUID from Supabase Auth Users.

Run:

```sql
select public.seed_sachith_academic_data('PASTE_AUTH_USER_UUID_HERE');
```

This seeds:

- Mathematics: B to A*
- Further Mathematics: C to A
- Physics: D to A
- Economics: B retained/inactive
- starter annual goals

## 6. Optional Storage

Create a private Storage bucket later for attachments, for example:

```text
gap-year-attachments
```

The core V1 app does not require Storage.

## 7. Vercel Environment Variables

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=https://YOUR_VERCEL_DOMAIN
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## 8. Verify RLS

1. Create user A and seed data for user A.
2. Create user B.
3. Sign in as user B.
4. Confirm user B cannot see user A subjects, exams, errors, journal entries, contacts, or projects.
5. In SQL editor, run a query as authenticated user context if available, or test through the app UI.
6. Confirm `/portfolio` only shows projects where `publish_to_portfolio = true`.

## 9. Verify App

Run locally:

```bash
npm run lint
npm run test
npm run build
npm run dev
```

Then test:

- `/login`
- `/onboarding`
- `/subjects`
- `/settings/syllabus`
- `/settings/reference-data`
- `/today`
- `/explore`
- `/universities`
- `/careers`
- `/future-map`
- `/tests`
- `/errors`
- `/analytics`
- `/settings/import`
- `/api/export`
- `/portfolio`
