
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { auth } from "@/auth";

const highlights = [
  { title: "Offline Utility", description: "Forms, session state, and intake workflows stay usable in low-connectivity clinics.", icon: Wifi },
  { title: "Data Privacy", description: "Patient profiles and queries stay localized before any controlled sync step.", icon: ShieldCheck },
  { title: "Decision Support", description: "Grounded AI verification helps workers confirm actions without replacing clinical judgment.", icon: Sparkles },
];

const quickActions = [
  { title: "Patient intake", subtitle: "Start a session", href: "/dashboard/session" },
  { title: "Medication check", subtitle: "Interactions & alerts", href: "/dashboard/interactions" },
  { title: "Diagnostics", subtitle: "Run AI-assisted checks", href: "/dashboard/diagnostics" },
  { title: "Reminders", subtitle: "Vaccinations & meds", href: "/dashboard/reminders" },
];

export default async function HomePage() {
  const session = await auth();

  if (session?.user) redirect("/dashboard/session");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-emerald-50 px-3 py-2 text-xl font-semibold text-emerald-700">DV</div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-sky-600">Clinical Companion</p>
              <h1 className="mt-1 text-lg font-semibold text-slate-900">Doctor Vai</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">Field-ready decision support</div>

            <div className="space-y-4">
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">Clinical Companion: Grounded Decision Support for Field Healthcare Workers.</h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Built for frontline teams that need a fast, clear, privacy-preserving workflow. Doctor Vai keeps intake usable offline, keeps patient data localized, and uses local AI verification to support decisions instead of replacing them.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(5,150,105,0.22)] transition hover:-translate-y-px hover:bg-emerald-700">Go to Dashboard <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/dashboard/session" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">View workspace preview</Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((h) => (
                <div key={h.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{h.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{h.description}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-lg">
            <div className="space-y-5">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">Operational status</p>
                <p className="mt-2 text-sm text-sky-900">Ready for low-bandwidth field deployment with privacy-first local workflows.</p>
              </div>

              <div className="grid gap-3">
                {quickActions.map((a) => (
                  <Link key={a.title} href={a.href} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{a.subtitle}</p>
                  </Link>
                ))}
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">Clinical work continues even when connectivity is unreliable. The dashboard, forms, and AI verification keep a local-first posture.</div>
            </div>
          </aside>
        </section>

        <section className="mt-10">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live Insights</h3>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
            <div className="min-w-70 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Urgent</p>
              <h4 className="mt-2 font-semibold text-slate-900">Bed 4: Vitals trending low</h4>
              <p className="mt-1 text-sm text-slate-600">BP 90/60. Pulse 105. AI predicts 85% risk of sepsis shock within 2 hours.</p>
              <div className="mt-3 flex gap-2">
                <button className="rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white">View Charts</button>
                <button className="rounded-md border border-slate-200 px-3 py-2 text-xs">Acknowledge</button>
              </div>
            </div>
              <div className="min-w-70 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Update</p>
              <h4 className="mt-2 font-semibold text-slate-900">Shift Handover Ready</h4>
              <p className="mt-1 text-sm text-slate-600">Summary of 12 patients generated. Ready for review and digital signature.</p>
            </div>
              <div className="min-w-70 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Check</p>
              <h4 className="mt-2 font-semibold text-slate-900">Local RAG verification complete</h4>
              <p className="mt-1 text-sm text-slate-600">Latest medication guidance is grounded against the uploaded clinic knowledge set.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-semibold text-slate-900">HIPAA Compliant</p>
            <p className="mt-2 text-sm text-slate-600">Patient data and identities are sandboxed locally.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-semibold text-slate-900">Local-first Security</p>
            <p className="mt-2 text-sm text-slate-600">Offline-first workflows with optional sync.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-semibold text-slate-900">Verified Guidance</p>
            <p className="mt-2 text-sm text-slate-600">RAG-backed checks support clinical decisions.</p>
          </div>
        </section>

        <footer className="mt-12 border-t border-slate-200/60 pt-8 text-sm text-slate-600">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">DV</div>
                <div>
                  <div className="font-semibold text-slate-900">Doctor Vai</div>
                  <div className="text-xs text-slate-500">Field-ready clinical companion</div>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <a className="hover:text-slate-800" href="#">Privacy</a>
              <a className="hover:text-slate-800" href="#">Terms</a>
              <a className="hover:text-slate-800" href="#">Security</a>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-500">© {new Date().getFullYear()} Doctor Vai — Built for frontline teams.</p>
        </footer>
      </div>
    </main>
  );
}
