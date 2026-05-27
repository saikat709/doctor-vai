
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  Wifi,
} from "lucide-react";

const features = [
  {
    title: "Interactive clinical guidance",
    description:
      "Step-by-step protocols for frontline workflows, tuned for low-resource care sites.",
    icon: ClipboardList,
  },
  {
    title: "Cross-prescription verification",
    description:
      "Detect adverse interactions and safer alternatives before a medication leaves the cart.",
    icon: ShieldCheck,
  },
  {
    title: "Rapid triage risk tagging",
    description:
      "Flag high priority cases in seconds with symptom-based risk signals.",
    icon: Activity,
  },
  {
    title: "Private RAG chatbot",
    description:
      "Chat with local guidelines and uploaded manuals without sending patient data away.",
    icon: HeartPulse,
  },
];

const heroStats = [
  { label: "Coverage", value: "24/7", note: "offline-ready workflows" },
  { label: "Accuracy", value: "98%", note: "clinician verified" },
  { label: "Time saved", value: "35%", note: "per shift" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="grid-backdrop absolute inset-0 -z-10" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-teal-600">
              AidPulse AI
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Doctor Vai
            </h1>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-teal-100 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
            <Wifi className="h-4 w-4" />
            Local network sync active
          </div>
        </header>

        <section className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
              Field-ready decision support
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                AI Decision-Support for Frontline Health Workers
              </h2>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Built for clinics that must act fast and stay private. Doctor Vai runs on
                local-first workflows, secure DeepSeek intelligence, and low-bandwidth
                data syncs.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/session"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(13,148,136,0.25)] transition hover:-translate-y-px hover:bg-teal-700"
              >
                Access Workspace Dashboard
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700">
                View deployment brief
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{stat.note}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="rounded-[28px] border border-teal-100 bg-white/80 p-6 shadow-lg"
          >
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
                  Connection status
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  Clinic-ready operations
                </h3>
              </div>
              <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-800">
                Device sync stable. Local triage models are cached and will continue
                operating even when external connectivity drops.
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Data privacy
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Patient identifiers stay on-device while DeepSeek analyzes
                    anonymized triage signals.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Offline mode
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Continue intake, reminders, and medicine checks with zero
                    connectivity.
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </section>

        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
                Clinical capabilities
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                Built for every patient handoff
              </h3>
            </div>
            <p className="max-w-md text-sm text-slate-600">
              Each module is optimized for healthcare workers in the field, from
              automated vaccination tracking to bedside diagnosis support.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h4 className="text-base font-semibold text-slate-900">
                      {feature.title}
                    </h4>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {feature.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
