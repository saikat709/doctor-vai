import { NextResponse } from "next/server";
import { fetchOllamaModels, getSavedLocalLlmConfig } from "@/lib/local-llm";
import { OFFLINE_USER_ID, isOffline } from "@/lib/env";

export async function GET() {
  if (!isOffline) {
    return NextResponse.json({ required: false });
  }

  const config = await getSavedLocalLlmConfig(OFFLINE_USER_ID);

  if (!config?.enabled) {
    return NextResponse.json({ required: true, configured: false });
  }

  try {
    const models = await fetchOllamaModels(config.tunnelUrl, 5000);

    return NextResponse.json({
      required: true,
      configured: true,
      reachable: true,
      model: config.selectedModel,
      models,
    });
  } catch {
    return NextResponse.json({
      required: true,
      configured: true,
      reachable: false,
      model: config.selectedModel,
    });
  }
}
