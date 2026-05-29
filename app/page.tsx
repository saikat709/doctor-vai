import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";
import { auth } from "@/auth";

const highlights = [
  {
    title: "Offline Utility",
    description:
      "Forms, session state, and intake workflows stay usable in low-connectivity clinics.",
    icon: Wifi,
  },
  {
    title: "Data Privacy",
    description:
      "Patient profiles and queries stay localized before any controlled sync step.",
    icon: ShieldCheck,
  },
  {
    title: "Decision Support",
    description:
      "Grounded AI verification helps workers confirm actions without replacing clinical judgment.",
    icon: Sparkles,
  },
];

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard/session");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-sky-600">
              Clinical Companion
            </p>
            <h1 className="mt-1 text-lg font-semibold text-slate-900">
              Doctor Vai
            </h1>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
              Field-ready decision support
            </div>

            <div className="space-y-4">
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Clinical Companion: Grounded Decision Support for Field Healthcare Workers.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Built for frontline teams that need a fast, clear, privacy-preserving
                workflow. Doctor Vai keeps intake usable offline, keeps patient data
                localized, and uses local AI verification to support decisions instead
                of replacing them.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(5,150,105,0.22)] transition hover:-translate-y-px hover:bg-emerald-700"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/session"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                View workspace preview
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Offline resiliancy
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Local database push syncs when network drops.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Patient privacy
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Identities remain sandboxed locally before any sync.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Decision cap
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Grounded local RAG validation supports clinical judgment.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-lg">
            <div className="space-y-5">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
                  Operational status
                </p>
                <p className="mt-2 text-sm text-sky-900">
                  Ready for low-bandwidth field deployment with privacy-first local workflows.
                </p>
              </div>

              <div className="grid gap-3">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Clinical work continues even when connectivity is unreliable. The
                dashboard, forms, and AI verification all keep a local-first posture.
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
