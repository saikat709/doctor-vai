
import { FiArrowRight, FiActivity, FiBell, FiShield } from "react-icons/fi";

const stats = [
  { label: "Patients ready", value: "12", note: "handover summaries" },
  { label: "Alerts triaged", value: "8", note: "this shift" },
  { label: "Safety score", value: "98%", note: "reviewed by AI" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#090912] text-[#e8e0f0]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-8 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <div>
            <p className="font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.35em] text-[#00e6b8]">
              AidPulse AI
            </p>
            <h1 className="font-['Sora'] text-lg font-semibold tracking-tight text-white">
              Doctor Vai
            </h1>
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-[#e8e0f0] transition hover:border-[#ff2d78]/40 hover:bg-[#ff2d78]/10">
            <FiBell className="text-lg" />
          </button>
        </header>

        <section className="relative mt-6 grid flex-1 items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,45,120,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(0,230,184,0.16),transparent_25%)]" />

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00e6b8]/20 bg-[#00e6b8]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-[#00e6b8]">
              <FiActivity className="text-sm" />
              On-duty clinical copilot
            </div>

            <div className="space-y-4">
              <h2 className="max-w-2xl font-['Sora'] text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Doctor Vai keeps the shift calm, clear, and one step ahead.
              </h2>
              <p className="max-w-xl text-base leading-7 text-[#a098b0] sm:text-lg">
                Fast handovers, bedside alerts, and medication checks in one dark-glass dashboard built for busy wards.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff2d78] px-5 py-4 font-['Space_Grotesk'] text-sm font-semibold text-[#1a0010] shadow-[0_0_24px_rgba(255,45,120,0.28)] transition hover:-translate-y-px hover:bg-[#ff4186]">
                Start shift review
                <FiArrowRight />
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-4 font-['Space_Grotesk'] text-sm font-semibold text-white transition hover:border-[#00e6b8]/30 hover:bg-[#00e6b8]/10">
                Open live notes
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-[#a098b0]">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-['Sora'] text-3xl font-semibold text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-[#a098b0]">{stat.note}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,45,120,0.16),transparent_35%)]" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.3em] text-[#ff80aa]">
                    Live summary
                  </p>
                  <h3 className="mt-1 font-['Sora'] text-xl font-semibold text-white">
                    Shift snapshot
                  </h3>
                </div>
                <div className="rounded-full border border-[#00e6b8]/20 bg-[#00e6b8]/10 px-3 py-1 text-xs font-medium text-[#00e6b8]">
                  Stable
                </div>
              </div>

              <div className="rounded-2xl border border-[#ff2d78]/20 bg-[#ff2d78]/10 p-4">
                <p className="font-['Space_Grotesk'] text-xs uppercase tracking-[0.24em] text-[#ff80aa]">
                  Urgent note
                </p>
                <p className="mt-2 text-sm leading-6 text-[#e8e0f0]">
                  Bed 4 vitals are trending low. Doctor Vai flagged sepsis risk and prepared the next-step checklist.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <FiShield className="text-xl text-[#00e6b8]" />
                  <p className="mt-3 text-sm font-semibold text-white">Compliant care</p>
                  <p className="mt-1 text-sm text-[#a098b0]">Audit-ready handover notes and secure patient context.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <FiActivity className="text-xl text-[#ff80aa]" />
                  <p className="mt-3 text-sm font-semibold text-white">Live insight</p>
                  <p className="mt-1 text-sm text-[#a098b0]">Quick actions for meds, labs, and bedside follow-up.</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
