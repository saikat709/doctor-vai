"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";

type Verdict =
  | "Go Ahead"
  | "Not Harmful"
  | "Moderate Harm"
  | "Seems Harmful"
  | "Highly Dangerous!";

type InteractionResult = {
  verdict: Verdict;
  explanation: string;
  alternatives: string[];
};

function normalizeAlternatives(alternatives: unknown): string[] {
  if (Array.isArray(alternatives)) {
    return alternatives.map((alternative) => String(alternative).trim()).filter(Boolean);
  }

  if (typeof alternatives === "string") {
    return alternatives
      .split(/\r?\n+/)
      .map((alternative) => alternative.trim())
      .filter(Boolean);
  }

  if (alternatives && typeof alternatives === "object") {
    return Object.values(alternatives as Record<string, unknown>)
      .map((alternative) => String(alternative).trim())
      .filter(Boolean);
  }

  return [];
}

const verdictStyles: Record<
  Verdict,
  { badge: string; panel: string; label: string }
> = {
  "Go Ahead": {
    badge: "bg-emerald-500 text-white",
    panel: "border-emerald-200 bg-emerald-50",
    label: "Go Ahead (Safe)",
  },
  "Not Harmful": {
    badge: "bg-sky-500 text-white",
    panel: "border-sky-200 bg-sky-50",
    label: "Not Harmful",
  },
  "Moderate Harm": {
    badge: "bg-amber-500 text-white",
    panel: "border-amber-200 bg-amber-50",
    label: "Moderate Harm",
  },
  "Seems Harmful": {
    badge: "bg-destructive text-white",
    panel: "border-red-200 bg-red-50",
    label: "Highly Dangerous!",
  },
  "Highly Dangerous!": {
    badge: "bg-destructive text-white",
    panel: "border-red-200 bg-red-50",
    label: "Highly Dangerous!",
  },
};

export default function InteractionsPage() {
  const [disease, setDisease] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [medicines, setMedicines] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      disease.trim().length > 0 ||
      symptoms.trim().length > 0 ||
      medicines.some((medicine) => medicine.trim().length > 0)
    );
  }, [disease, symptoms, medicines]);

  const updateMedicine = (index: number, value: string) => {
    setMedicines((current) =>
      current.map((medicine, medicineIndex) =>
        medicineIndex === index ? value : medicine
      )
    );
  };

  const addMedicine = () => setMedicines((current) => [...current, ""]);

  const removeMedicine = (index: number) => {
    setMedicines((current) => {
      if (current.length === 1) return [""];
      return current.filter((_, medicineIndex) => medicineIndex !== index);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disease,
          symptoms,
          medicines: medicines.map((medicine) => medicine.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to evaluate interactions right now.");
      }

      const data = (await response.json()) as InteractionResult;
      console.log(data);
      setResult(data);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "An unknown error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeVerdict = result ? verdictStyles[result.verdict] : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          Medicine Interaction
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Prescription safety screening
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Add the suspected disease, current symptoms, and the medicine list to run a
          DeepSeek-style safety evaluation.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Suspected Disease
            </span>
            <input
              value={disease}
              onChange={(event) => setDisease(event.target.value)}
              placeholder="Example: Malaria"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Current Symptoms
            </span>
            <input
              value={symptoms}
              onChange={(event) => setSymptoms(event.target.value)}
              placeholder="Example: fever, headache, joint pain"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-700">
              Prescribed Medicines
            </span>
            <button
              type="button"
              onClick={addMedicine}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            >
              <Plus className="h-4 w-4" />
              Add Medicine
            </button>
          </div>

          <div className="space-y-3">
            {medicines.map((medicine, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  value={medicine}
                  onChange={(event) => updateMedicine(index, event.target.value)}
                  placeholder={`Medicine ${index + 1}`}
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                />
                <button
                  type="button"
                  onClick={() => removeMedicine(index)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove medicine ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.22)] transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Check for Interactions
        </button>
      </form>

      <AnimatePresence>
        {result && activeVerdict ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
            role="dialog"
            aria-modal="true"
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 10 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className={`w-full max-w-2xl rounded-3xl border p-6 shadow-2xl ${activeVerdict.panel}`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${activeVerdict.badge}`}
                  >
                    {activeVerdict.label}
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Interaction screening result
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-900"
                  aria-label="Dismiss interaction result"
                >
                  <AlertTriangle className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-5">
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-slate-700">
                  {result.explanation}
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Suggested alternatives
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {normalizeAlternatives(result.alternatives).length > 0 ? (
                      normalizeAlternatives(result.alternatives).map((alternative) => (
                        <li key={alternative} className="flex items-start gap-2">
                          <span className="mt-1 rounded-full bg-slate-900 p-1 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                          <span>{alternative}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">No alternatives returned.</li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
