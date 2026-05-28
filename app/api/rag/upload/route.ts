import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "txt", "md"].includes(ext ?? "")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Stub: wire to Prisma + pgvector when DB is ready:
    // 1. prisma.knowledgeDocument.create({ data: { name, size, status: "Processing" } })
    // 2. Extract text via pdf-parse or utf-8 buffer
    // 3. Chunk + embed via OpenAI text-embedding-3-small
    // 4. Store chunks in DocumentChunk table
    // 5. Update status to "Indexed"

    await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate processing

    return NextResponse.json({
      success: true,
      document: { name: file.name, size: file.size, status: "Indexed" },
    });
  } catch (error) {
    console.error("[RAG_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "Upload processing failed" },
      { status: 500 }
    );
  }
}