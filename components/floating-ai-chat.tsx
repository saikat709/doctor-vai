"use client";

import { useState } from "react";
import { MessageSquare, Sparkles, X } from "lucide-react";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function FloatingAiChat() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Ask AI drawer"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-[0_0_0_8px_rgba(14,165,233,0.14)] transition hover:-translate-y-1 hover:bg-sky-700"
        >
          <span className="absolute inset-0 animate-pulse rounded-full border border-sky-300/60" />
          <MessageSquare className="relative h-5 w-5" />
        </button>
      </div>

      <SheetContent side="right" className="w-full max-w-[400px] border-l border-slate-200">
        <SheetHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
                Ask AI
              </p>
              <SheetTitle>RAG assistant</SheetTitle>
              <SheetDescription>
                RAG Inference Core Online - Grounded to Vector Knowledge Base chunks.
              </SheetDescription>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-slate-900"
              aria-label="Close Ask AI drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        <SheetBody className="space-y-4 p-5">
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
            RAG Knowledge Vector Client Context Engine Loader coming soon...
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Upload knowledge, review local clinical guidelines, and ground answers in
            approved documents.
          </div>
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            <div className="flex items-center gap-2 text-sky-700">
              <Sparkles className="h-4 w-4" />
              Prompt chips and response history will load here.
            </div>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
