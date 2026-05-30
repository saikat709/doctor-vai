import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_38%)]" />
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-2xl font-semibold text-sky-700">
          404
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
          Route Not Found
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          This page does not exist anymore
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
          The address may be mistyped, outdated, or moved to a different section. Use one of the
          quick actions below to continue.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Open dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Go to home
          </Link>
        </div>
        <div className="mt-7 grid gap-3 text-left text-sm text-slate-600 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            Check URL spelling
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            Use sidebar navigation
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            Return to recent page
          </div>
        </div>
      </div>
    </div>
  );
}