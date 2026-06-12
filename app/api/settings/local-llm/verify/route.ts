import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helper";
import { fetchOllamaModels, sanitizeTunnelUrl } from "@/lib/local-llm";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { tunnelUrl?: string };
    const tunnelUrl = sanitizeTunnelUrl(body.tunnelUrl ?? "");
    const models = await fetchOllamaModels(tunnelUrl, 8000);

    return NextResponse.json({
      success: true,
      models,
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: "Tunnel not reachable",
    });
  }
}
