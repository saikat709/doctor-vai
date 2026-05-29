import { NextRequest, NextResponse } from "next/server";
import { ingestKnowledgeDocument } from "@/lib/rag";

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

    const result = await ingestKnowledgeDocument(file);

    return NextResponse.json({
      success: true,
      document: {
        id: result.document.id,
        name: result.document.fileName,
        size: result.document.fileSize,
        status: result.document.status,
      },
      chunkCount: result.chunkCount,
    });
  } catch (error) {
    console.error("[RAG_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "Upload processing failed" },
      { status: 500 }
    );
  }
}