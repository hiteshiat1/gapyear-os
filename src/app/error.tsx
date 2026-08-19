"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-950">Something went wrong</h1>
      <p className="max-w-md text-sm text-slate-600">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
        <Link href="/" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">
          Go home
        </Link>
      </div>
    </div>
  );
}
