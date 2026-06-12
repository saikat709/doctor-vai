"use client";

import { useEffect, useState } from "react";
import { OllamaRequired } from "@/components/offline/ollama-required";

type OllamaHealth = {
  required?: boolean;
  configured?: boolean;
  reachable?: boolean;
};

export function OfflineModeGuard() {
  const [state, setState] = useState<OllamaHealth | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      try {
        const response = await fetch("/api/health/ollama", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as OllamaHealth;

        if (!cancelled) {
          setState(data);
        }
      } catch {
        if (!cancelled) {
          setState(null);
        }
      }
    }

    void loadState();

    const onRefresh = () => void loadState();
    window.addEventListener("doctor-vai:ollama-configured", onRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener("doctor-vai:ollama-configured", onRefresh);
    };
  }, []);

  if (!state?.required) {
    return null;
  }

  if (state.configured && state.reachable) {
    return null;
  }

  return <OllamaRequired />;
}
