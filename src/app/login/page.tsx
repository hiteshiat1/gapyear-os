import { signInWithPasswordAction, signUpWithPasswordAction } from "@/actions/auth-actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Card, PageHeader } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#FAFAFF] px-4 py-10 text-[#30343F]">
      <div className="mx-auto max-w-md">
        <PageHeader
          title="Sign in"
          description="Private A-Level planning, assessment, progress, and evidence tracking for students."
        />
        {params.error ? (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {params.error}
          </div>
        ) : null}
        {params.message ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {params.message}
          </div>
        ) : null}
        {!isSupabaseConfigured ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Supabase is not configured yet. Add environment variables before login will work.
          </div>
        ) : null}
        <Card className="border-[#E4D9FF]">
          <form action={signInWithPasswordAction} className="space-y-4">
            <label className="block text-sm font-medium">
              Email
              <input name="email" type="email" required className="mt-1 w-full rounded-md border border-[#E4D9FF] px-3 py-2 focus:border-[#273469] focus:outline-none" />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input name="password" type="password" required className="mt-1 w-full rounded-md border border-[#E4D9FF] px-3 py-2 focus:border-[#273469] focus:outline-none" />
            </label>
            <button className="w-full rounded-md bg-[#273469] px-4 py-2 text-sm font-medium text-[#FAFAFF] transition hover:bg-[#1E2749]">
              Sign in
            </button>
          </form>
        </Card>
        <Card id="create-account" className="mt-4 border-[#E4D9FF] scroll-mt-10">
          <form action={signUpWithPasswordAction} className="space-y-4">
            <p className="text-sm font-medium">Create student account</p>
            <label className="block text-sm font-medium">
              Full name
              <input name="fullName" placeholder="Your name" className="mt-1 w-full rounded-md border border-[#E4D9FF] px-3 py-2 focus:border-[#273469] focus:outline-none" />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input name="email" type="email" required className="mt-1 w-full rounded-md border border-[#E4D9FF] px-3 py-2 focus:border-[#273469] focus:outline-none" />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-md border border-[#E4D9FF] px-3 py-2 focus:border-[#273469] focus:outline-none" />
            </label>
            <button className="w-full rounded-md border border-[#273469] px-4 py-2 text-sm font-medium text-[#273469] transition hover:bg-[#E4D9FF]">
              Create account
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}
