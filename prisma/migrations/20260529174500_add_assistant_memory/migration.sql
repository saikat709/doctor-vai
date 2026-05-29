ALTER TABLE "DocumentChunk"
ADD COLUMN IF NOT EXISTS "chunkIndex" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "AssistantMemory" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AssistantMemory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AssistantMemory_key_key" ON "AssistantMemory"("key");
CREATE INDEX IF NOT EXISTS "DocumentChunk_documentId_chunkIndex_idx" ON "DocumentChunk"("documentId", "chunkIndex");
