"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

export function FloatingAiChat() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href="/dashboard/ask-ai"
        aria-label="Open Ask AI page"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-[0_0_0_8px_rgba(14,165,233,0.14)] transition hover:-translate-y-1 hover:bg-sky-700"
      >
        <span className="absolute inset-0 animate-pulse rounded-full border border-sky-300/60" />
        <MessageSquare className="relative h-5 w-5" />
      </Link>
    </div>
  );
}
