import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-helper";
import { OFFLINE_USER_ID } from "@/lib/env";
import { sanitizeTunnelUrl } from "@/lib/local-llm";

export async function POST(request: Request) {
  const session = await getSession();
  const userId = session?.user?.id ?? OFFLINE_USER_ID;

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    tunnelUrl?: string;
    selectedModel?: string;
  };

  const tunnelUrl = sanitizeTunnelUrl(body.tunnelUrl ?? "");
  const selectedModel = (body.selectedModel ?? "").trim();

  if (!selectedModel) {
    return NextResponse.json({ success: false, error: "Model is required" }, { status: 400 });
  }

  await db.user.upsert({
    where: { id: userId },
    update: {
      email: session?.user?.email ?? `${userId}@offline.local`,
      name: session?.user?.name ?? "Field Worker",
    },
    create: {
      id: userId,
      email: session?.user?.email ?? `${userId}@offline.local`,
      name: session?.user?.name ?? "Field Worker",
      role: "HealthWorker",
    },
  });

  await db.localLLMConfig.upsert({
    where: { userId },
    update: {
      enabled: true,
      tunnelUrl,
      selectedModel,
      verifiedAt: new Date(),
    },
    create: {
      userId,
      enabled: true,
      tunnelUrl,
      selectedModel,
      verifiedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const session = await getSession();
  const userId = session?.user?.id ?? OFFLINE_USER_ID;

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await db.localLLMConfig.updateMany({
    where: { userId },
    data: {
      enabled: false,
    },
  });

  return NextResponse.json({ success: true });
}
