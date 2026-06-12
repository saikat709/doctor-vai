import { ChatOpenAI } from "@langchain/openai";
import { Ollama } from "ollama";
import { getSavedLocalLlmConfig, LOCAL_LLM_UNCONFIGURED_ERROR } from "@/lib/local-llm";
import { OFFLINE_USER_ID, isOffline } from "@/lib/env";

export type ChatRole = "system" | "user" | "assistant";

export type LlmMessage = {
  role: ChatRole;
  content: string;
};

type DeepSeekOptions = {
  model?: string;
  temperature?: number;
};

type CompletionOptions = {
  userId?: string;
  messages: LlmMessage[];
  temperature?: number;
  model?: string;
  schema?: Record<string, unknown>;
};

const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

function createDeepSeekClient(options: DeepSeekOptions = {}) {
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

async function getLocalConfig(userId?: string) {
  const config = await getSavedLocalLlmConfig(userId ?? OFFLINE_USER_ID);

  if (!config?.enabled || !config.tunnelUrl || !config.selectedModel) {
    throw new Error(LOCAL_LLM_UNCONFIGURED_ERROR);
  }

  return config;
}

async function resolveBackend(userId?: string) {
  if (isOffline) {
    const config = await getLocalConfig(OFFLINE_USER_ID);
    return {
      kind: "ollama" as const,
      client: new Ollama({ host: config.tunnelUrl }),
      model: config.selectedModel,
    };
  }

  const config = await getSavedLocalLlmConfig(userId ?? OFFLINE_USER_ID);

  if (config?.enabled && config.tunnelUrl && config.selectedModel) {
    return {
      kind: "ollama" as const,
      client: new Ollama({ host: config.tunnelUrl }),
      model: config.selectedModel,
    };
  }

  return {
    kind: "deepseek" as const,
    client: createDeepSeekClient(),
    model: DEEPSEEK_MODEL,
  };
}

function extractJsonBlock(content: string) {
  const fenced = content.match(/```json\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return content.slice(firstBrace, lastBrace + 1);
  }

  return content;
}

export async function generateCompletion(options: CompletionOptions) {
  const backend = await resolveBackend(options.userId);

  if (backend.kind === "deepseek") {
    const llm = createDeepSeekClient({
      model: options.model,
      temperature: options.temperature,
    });

    if (options.schema) {
      return llm.withStructuredOutput(options.schema).invoke(
        options.messages.map((message) => ({
          role: message.role,
          content: message.content,
        }))
      );
    }

    const response = await llm.invoke(
      options.messages.map((message) => ({
        role: message.role,
        content: message.content,
      }))
    );

    return {
      content:
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content),
    };
  }

  const response = await backend.client.chat({
    model: options.model ?? backend.model,
    stream: false,
    options: {
      temperature: options.temperature ?? 0.2,
    },
    messages: options.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    format: options.schema,
  });

  const content = response.message?.content ?? "";

  if (options.schema) {
    return JSON.parse(extractJsonBlock(content));
  }

  return { content };
}
