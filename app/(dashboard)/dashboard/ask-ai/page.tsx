import { Sparkles } from "lucide-react";

export default function AskAiPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          Ask AI
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">RAG assistant</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Grounded answers, prompt chips, and response history live here instead of a floating
          chat drawer.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
            RAG Knowledge Vector Client Context Engine Loader coming soon...
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Upload knowledge, review local clinical guidelines, and ground answers in approved
            documents.
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            <div className="flex items-center gap-2 text-sky-700">
              <Sparkles className="h-4 w-4" />
              Prompt chips and response history will load here.
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            Use this page for future chat input, citations, and grounded retrieval results.
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            The floating icon now opens this page directly, so the experience stays in one
            place.
          </div>
        </aside>
      </div>
    </div>
  );
}