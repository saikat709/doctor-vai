import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helper";
import { getSavedLocalLlmConfig } from "@/lib/local-llm";
import { OFFLINE_USER_ID } from "@/lib/env";

export async function GET() {
  const session = await getSession();
  const userId = session?.user?.id ?? OFFLINE_USER_ID;
  const config = await getSavedLocalLlmConfig(userId);

  return NextResponse.json({
    config: config
      ? {
          enabled: config.enabled,
          tunnelUrl: config.tunnelUrl,
          selectedModel: config.selectedModel,
          verifiedAt: config.verifiedAt,
        }
      : null,
  });
}
