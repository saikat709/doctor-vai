import { NextResponse } from "next/server";
import { runRagConversation } from "@/lib/rag-agent";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? (body.messages as ChatMessage[]) : [];

    if (messages.length === 0) {
      return NextResponse.json({ error: "At least one message is required" }, { status: 400 });
    }

    const result = await runRagConversation(messages);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[RAG_CHAT_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate a grounded answer" }, { status: 500 });
  }
}
