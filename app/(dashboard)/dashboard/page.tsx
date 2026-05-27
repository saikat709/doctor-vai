import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          Dashboard
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Clinical workspace overview
        </h1>
        <p className="text-sm text-slate-600">
          Start a session, review guidance, or move into risk and disease detection.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link href="/dashboard/session" className="rounded-2xl border border-slate-200 p-5 transition hover:border-sky-300 hover:bg-sky-50">
          <p className="text-sm font-semibold text-slate-900">Patient intake session</p>
          <p className="mt-2 text-sm text-slate-600">Capture symptoms and triage details.</p>
        </Link>
        <Link href="/dashboard/guidance" className="rounded-2xl border border-slate-200 p-5 transition hover:border-sky-300 hover:bg-sky-50">
          <p className="text-sm font-semibold text-slate-900">Treatment guidance</p>
          <p className="mt-2 text-sm text-slate-600">Follow structured medical procedures.</p>
        </Link>
        <Link href="/dashboard/interactions" className="rounded-2xl border border-slate-200 p-5 transition hover:border-sky-300 hover:bg-sky-50">
          <p className="text-sm font-semibold text-slate-900">Medicine interaction</p>
          <p className="mt-2 text-sm text-slate-600">Verify prescriptions and alternatives.</p>
        </Link>
      </div>
    </div>
  );
}
