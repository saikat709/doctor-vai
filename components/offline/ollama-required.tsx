"use client";

import { WifiOff } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function OllamaRequired() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-slate-950/55 p-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[32px] border border-amber-200 bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <WifiOff className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-slate-950">
          Local AI Required
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This app is running in offline mode. Configure a local Ollama model
          before using AI features.
        </p>
        <Link
          href="/dashboard/settings#local-ai"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-amber-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          Open Settings → Local AI
        </Link>
      </div>
    </div>
  );
}
