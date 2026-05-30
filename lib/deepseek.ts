import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { searchKnowledgeBase } from "@/lib/rag";

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

type DeepSeekModelOptions = {
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

function createDeepSeekModel(options: DeepSeekModelOptions = {}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not set");
  }

  return new ChatOpenAI({
    model: options.model ?? DEEPSEEK_MODEL,
    temperature: options.temperature ?? 0.2,
    apiKey,
    configuration: {
      baseURL: DEEPSEEK_BASE_URL,
    },
  });
}

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

export function getDeepSeekChatModel(options: DeepSeekModelOptions = {}) {
  return createDeepSeekModel(options);
}

export async function invokeDeepSeekStructured<T>(options: StructuredInvocationOptions) {
  const llm = createDeepSeekModel(options).withStructuredOutput(options.schema);
  const userPrompt = await injectKnowledgeContext(
    options.userPrompt,
    options.knowledgeQuery,
    options.knowledgeLimit
  );

  return llm.invoke([new SystemMessage(options.systemPrompt), new HumanMessage(userPrompt)]) as Promise<T>;
}