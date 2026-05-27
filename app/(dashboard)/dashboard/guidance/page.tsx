"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Search, Sparkles } from "lucide-react";
import proceduresData from "@/lib/procedures.json";

type Procedure = {
  id: number;
  title: string;
  category: string;
  steps: string[];
};

const procedures = proceduresData as Procedure[];

const categoryOrder = ["All", ...Array.from(new Set(procedures.map((procedure) => procedure.category)))];

export default function GuidancePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProcedureId, setSelectedProcedureId] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean[]>>({});

  const filteredProcedures = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return procedures.filter((procedure) => {
      const matchesCategory = activeCategory === "All" || procedure.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        procedure.title.toLowerCase().includes(normalizedQuery) ||
        procedure.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const selectedProcedure = procedures.find((procedure) => procedure.id === selectedProcedureId) ?? null;

  const selectedProcedureChecks = selectedProcedure
    ? completedSteps[selectedProcedure.id] ?? Array(selectedProcedure.steps.length).fill(false)
    : [];

  const toggleStep = (stepIndex: number) => {
    if (!selectedProcedure) return;

    setCompletedSteps((current) => {
      const existing = current[selectedProcedure.id] ?? Array(selectedProcedure.steps.length).fill(false);
      const next = [...existing];
      next[stepIndex] = !next[stepIndex];
      return {
        ...current,
        [selectedProcedure.id]: next,
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
            Treatment Guidance
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">Procedural workflow tracker</h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Browse clinical procedures from the local catalog, then open a checklist view with
            step-by-step confirmation and animated progress tracking.
          </p>
        </div>

        {selectedProcedure ? (
          <button
            type="button"
            onClick={() => setSelectedProcedureId(null)}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Procedures
          </button>
        ) : null}
      </div>

      {!selectedProcedure ? (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search procedures or categories"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {categoryOrder.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === category
                      ? "bg-sky-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredProcedures.map((procedure, index) => (
                <motion.button
                  key={procedure.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  type="button"
                  onClick={() => setSelectedProcedureId(procedure.id)}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                        <Sparkles className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                          {procedure.category}
                        </p>
                        <h2 className="mt-2 text-lg font-semibold text-slate-900">
                          {procedure.title}
                        </h2>
                      </div>
                    </div>

                    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                      {procedure.steps.length} steps
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {filteredProcedures.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
              No procedures match the current search or category filter.
            </div>
          ) : null}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="space-y-2 border-b border-slate-200 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
              {selectedProcedure.category}
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">{selectedProcedure.title}</h2>
            <p className="text-sm text-slate-600">
              Check off each step as the procedure is completed in real time.
            </p>
          </div>

          <motion.ul
            className="mt-5 space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {selectedProcedure.steps.map((step, index) => {
              const checked = selectedProcedureChecks[index] ?? false;

              return (
                <motion.li
                  key={`${selectedProcedure.id}-${index}`}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <button
                    type="button"
                    onClick={() => toggleStep(index)}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                        checked
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 bg-white text-transparent"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium leading-6 transition ${checked ? "text-slate-400 line-through" : "text-slate-800"}`}>
                        Step {index + 1}: {step}
                      </p>
                    </div>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        </motion.div>
      )}
    </div>
  );
}
