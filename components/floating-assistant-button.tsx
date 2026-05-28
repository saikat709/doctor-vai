"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bot, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingAssistantButton() {
  const router = useRouter();
  const pathname = usePathname();
  const isOnAssistantPage = pathname === "/rag-assistant";
  const [pulse, setPulse] = useState(true);

  const handleClick = () => {
    setPulse(false);
    if (isOnAssistantPage) {
      router.back();
    } else {
      router.push("/rag-assistant");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pulse ring — shown briefly to draw attention */}
      {pulse && !isOnAssistantPage && (
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30 pointer-events-none" />
      )}

      <button
        onClick={handleClick}
        aria-label={isOnAssistantPage ? "Close RAG Assistant" : "Open RAG Assistant"}
        className={cn(
          "relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
          isOnAssistantPage
            ? "bg-zinc-700 hover:bg-zinc-600"
            : "bg-emerald-600 hover:bg-emerald-700"
        )}
      >
        {isOnAssistantPage ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-white" />
            <Sparkles className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-yellow-300" />
          </>
        )}
      </button>

      {/* Tooltip label */}
      {!isOnAssistantPage && (
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-zinc-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none shadow-md select-none transition-opacity">
          AI Assistant
          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-zinc-900" />
        </span>
      )}
    </div>
  );
}