import { Prisma } from "@/lib/generated/prisma/client";
import { db } from "@/lib/db";

export const EMBEDDING_DIMENSION = 384;

export type KnowledgeSearchHit = {
  id: string;
  documentId: string;
  fileName: string;
  chunkIndex: number;
  content: string;
  similarity: number;
};

export type KnowledgeDocumentSummary = {
  id: string;
  fileName: string;
  fileSize: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  chunkCount: number;
};

export type MemoryEntry = {
  id: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function cosineSimilarity(left: number[], right: number[]) {
  const length = Math.min(left.length, right.length);
  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < length; index += 1) {
    const leftValue = Number(left[index] ?? 0);
    const rightValue = Number(right[index] ?? 0);
    dotProduct += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator > 0 ? dotProduct / denominator : 0;
}

export function chunkText(text: string, chunkSize = 1200, overlap = 180) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    const slice = normalized.slice(start, end).trim();

    if (slice) {
      chunks.push(slice);
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

export async function extractUploadText(file: File) {
  const rawText = await file.text();
  return normalizeText(rawText);
}

export function generateEmbedding(text: string) {
  const vector = new Array(EMBEDDING_DIMENSION).fill(0);
  const tokens = normalizeText(text.toLowerCase()).match(/[a-z0-9]+/g) ?? [];

  tokens.forEach((token, index) => {
    const primaryBucket = hashString(token) % EMBEDDING_DIMENSION;
    const secondaryBucket = hashString(`${token}:${index % 7}`) % EMBEDDING_DIMENSION;
    vector[primaryBucket] += 1;
    vector[secondaryBucket] += 0.5;

    if (token.length > 5) {
      vector[hashString(token.slice(0, 3)) % EMBEDDING_DIMENSION] += 0.25;
    }
  });

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

export async function ingestKnowledgeDocument(file: File) {
  const extractedText = await extractUploadText(file);

  if (!extractedText) {
    throw new Error("The uploaded file did not contain readable text.");
  }

  const chunks = chunkText(extractedText);

  if (chunks.length === 0) {
    throw new Error("The uploaded file did not produce any text chunks.");
  }

  const document = await db.knowledgeDocument.create({
    data: {
      fileName: file.name,
      fileSize: file.size,
      status: "Processing",
    },
  });

  await db.documentChunk.createMany({
    data: chunks.map((chunk, chunkIndex) => ({
      documentId: document.id,
      chunkIndex,
      content: chunk,
      embedding: generateEmbedding(chunk) as Prisma.InputJsonValue,
    })),
  });

  const updated = await db.knowledgeDocument.update({
    where: {
      id: document.id,
    },
    data: {
      status: "Indexed",
    },
  });

  return {
    document: updated,
    chunkCount: chunks.length,
  };
}

export async function searchKnowledgeBase(query: string, limit = 5) {
  const queryEmbedding = generateEmbedding(query);

  const chunks = await db.documentChunk.findMany({
    include: {
      document: true,
    },
    orderBy: [
      {
        documentId: "asc",
      },
      {
        chunkIndex: "asc",
      },
    ],
  });

  return chunks
    .map((chunk) => {
      const embeddingValue = (chunk as { embedding?: unknown }).embedding;
      const embedding = Array.isArray(embeddingValue) ? embeddingValue : [];

      return {
        id: chunk.id,
        documentId: chunk.documentId,
        fileName: chunk.document.fileName,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        similarity: cosineSimilarity(queryEmbedding, embedding),
      } satisfies KnowledgeSearchHit;
    })
    .filter((hit) => hit.similarity > 0)
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, limit);
}

export async function listKnowledgeDocuments(limit = 10) {
  const documents = await db.knowledgeDocument.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
    include: {
      _count: {
        select: {
          chunks: true,
        },
      },
    },
  });

  return documents.map((document) => ({
    id: document.id,
    fileName: document.fileName,
    fileSize: document.fileSize,
    status: document.status,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    chunkCount: document._count.chunks,
  }));
}

export async function getKnowledgeBaseStats() {
  const [documentCount, chunkCount, memoryCount] = await Promise.all([
    db.knowledgeDocument.count(),
    db.documentChunk.count(),
    db.assistantMemory.count(),
  ]);

  return {
    documentCount,
    chunkCount,
    memoryCount,
  };
}

export async function rememberFact(key: string, value: string) {
  return db.assistantMemory.upsert({
    where: {
      key,
    },
    create: {
      key,
      value,
    },
    update: {
      value,
    },
  });
}

export async function recallFacts(query: string, limit = 5) {
  const normalized = query.trim();

  return db.assistantMemory.findMany({
    where: {
      OR: [
        { key: { contains: normalized, mode: "insensitive" } },
        { value: { contains: normalized, mode: "insensitive" } },
      ],
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
  });
}
