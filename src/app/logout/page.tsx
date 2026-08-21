import { signOutAction } from "@/actions/auth-actions";

export default function LogoutPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form action={signOutAction} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Sign out of Alevs.io?</p>
        <button className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
          Sign out
        </button>
      </form>
    </main>
  );
}
