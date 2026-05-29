/*
  Warnings:

  - You are about to alter the column `embedding` on the `DocumentChunk` table. The data in that column could be lost. The data in that column will be cast from `vector(384)` to `JsonB`.

*/
-- AlterTable
ALTER TABLE "DocumentChunk"
ALTER COLUMN "embedding" TYPE JSONB
USING "embedding"::text::jsonb;
