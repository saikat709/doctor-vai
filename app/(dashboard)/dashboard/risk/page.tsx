"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, ShieldAlert } from "lucide-react";

type AttentionLevel = "Standard Care" | "Monitor Closely" | "High Priority";

type RiskResult = {
  attentionLevel: AttentionLevel;
  metrics: string[];
  precautions: string[];
};

const attentionStyles: Record<AttentionLevel, { badge: string; panel: string; title: string }> = {
  "Standard Care": {
    badge: "bg-blue-600 text-white",
    panel: "border-blue-200 bg-blue-50",
    title: "Standard Care",
  },
  "Monitor Closely": {
    badge: "bg-amber-500 text-white",
    panel: "border-amber-200 bg-amber-50",
    title: "Monitor Closely",
  },
  "High Priority": {
    badge: "bg-rose-600 text-white animate-pulse",
    panel: "border-rose-200 bg-rose-50",
    title: "High Priority",
  },
};

export default function RiskPage() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Female");
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High">("Medium");
  const [comorbidities, setComorbidities] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return age.trim().length > 0 || comorbidities.trim().length > 0 || symptoms.trim().length > 0;
  }, [age, comorbidities, symptoms]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/diagnostics/risk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age: Number.parseInt(age, 10),
          gender,
          severity,
          comorbidities,
          symptoms,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to evaluate risk right now.");
      }

      const data = (await response.json()) as RiskResult;
      setResult(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeAttention = result ? attentionStyles[result.attentionLevel] : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          Risk Detection
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Pre-treatment screening
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Collect pre-treatment data and return an attention flag without generating a definitive diagnosis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Patient Age</span>
            <input
              type="number"
              min="0"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              placeholder="62"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Gender</span>
            <select
              value={gender}
              onChange={(event) => setGender(event.target.value as "Male" | "Female" | "Other")}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Severity level</span>
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value as "Low" | "Medium" | "High")}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-700">Comorbidities</span>
          <textarea
            value={comorbidities}
            onChange={(event) => setComorbidities(event.target.value)}
            placeholder="Type 2 diabetes, hypertension"
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-700">Primary Symptoms</span>
          <textarea
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
            placeholder="Persistent non-healing ulcer on left foot, cool extremity, numbness"
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(244,63,94,0.22)] transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
          Evaluate Risk Level
        </button>
      </form>

      <AnimatePresence>
        {result && activeAttention ? (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${activeAttention.panel}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${activeAttention.badge}`}>
                  Attention Flag: {activeAttention.title}
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Active care attention status
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Clinical Attention Metrics to Monitor
                </p>
                <ul className="mt-3 space-y-3 text-sm text-slate-700">
                  {result.metrics.map((metric) => (
                    <li key={metric} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-900" />
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Safety Precautions & Escalation Actions
                </p>
                <ul className="mt-3 space-y-3 text-sm text-slate-700">
                  {result.precautions.map((precaution) => (
                    <li key={precaution} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-900" />
                      <span>{precaution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
