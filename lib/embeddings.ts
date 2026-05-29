import { generateEmbedding } from "./rag";

export async function getEmbedding(text: string): Promise<number[]> {
  return generateEmbedding(text);
}