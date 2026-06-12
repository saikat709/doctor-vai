import { searchKnowledgeBase } from "@/lib/rag";
import { generateCompletion } from "@/lib/llm-client";

type DeepSeekModelOptions = {
  userId?: string;
  model?: string;
  temperature?: number;
};

type StructuredInvocationOptions = DeepSeekModelOptions & {
  systemPrompt: string;
  userPrompt: string;
  schema: Record<string, unknown>;
  knowledgeQuery?: string;
  knowledgeLimit?: number;
};

async function injectKnowledgeContext(userPrompt: string, query?: string, limit = 5) {
  const searchQuery = query?.trim();

  if (!searchQuery) {
    return userPrompt;
  }

  const hits = await searchKnowledgeBase(searchQuery, limit);

  if (hits.length === 0) {
    return `${userPrompt}\n\nNo matching uploaded document context was found in the knowledge base.`;
  }

  const context = hits
    .map((hit, index) => {
      const similarity = hit.similarity.toFixed(3);
      return [
        `${index + 1}. ${hit.fileName} [chunk ${hit.chunkIndex}] (similarity ${similarity})`,
        hit.content,
      ].join("\n");
    })
    .join("\n\n");

  return `${userPrompt}\n\nRelevant uploaded document context:\n${context}`;
}

export async function invokeDeepSeekStructured<T>(options: StructuredInvocationOptions) {
  const userPrompt = await injectKnowledgeContext(
    options.userPrompt,
    options.knowledgeQuery,
    options.knowledgeLimit
  );

  return generateCompletion({
    userId: options.userId,
    model: options.model,
    temperature: options.temperature,
    schema: options.schema,
    messages: [
      {
        role: "system",
        content: options.systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  }) as Promise<T>;
}
