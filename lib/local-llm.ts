import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OFFLINE_USER_ID } from "@/lib/env";

export const LOCAL_LLM_UNCONFIGURED_ERROR = "OLLAMA_NOT_CONFIGURED";

export function sanitizeTunnelUrl(input: string) {
  const normalized = input.trim().replace(/\/+$/, "");

  if (!normalized.startsWith("https://")) {
    throw new Error("INVALID_TUNNEL_URL");
  }

  return normalized;
}

export async function fetchOllamaModels(tunnelUrl: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${sanitizeTunnelUrl(tunnelUrl)}/api/tags`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("OLLAMA_UNREACHABLE");
    }

    const data = (await response.json()) as {
      models?: Array<{ name?: string }>;
    };

    return (data.models ?? [])
      .map((model) => model.name?.trim())
      .filter((model): model is string => Boolean(model));
  } finally {
    clearTimeout(timer);
  }
}

export async function getSavedLocalLlmConfig(userId = OFFLINE_USER_ID) {
  return db.localLLMConfig.findUnique({
    where: { userId },
  });
}

export async function getRequiredLocalLlmConfig(userId = OFFLINE_USER_ID) {
  const config = await getSavedLocalLlmConfig(userId);

  if (!config?.enabled || !config.tunnelUrl || !config.selectedModel) {
    throw new Error(LOCAL_LLM_UNCONFIGURED_ERROR);
  }

  return config;
}

export function buildOllamaNotConfiguredResponse() {
  return NextResponse.json(
    { error: "ollama_not_configured" },
    { status: 503 }
  );
}
