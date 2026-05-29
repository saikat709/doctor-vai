"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Send,
  Sparkles,
  Trash2,
  FileText,
  Bot,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    id: string;
    documentId: string;
    fileName: string;
    chunkIndex: number;
    similarity: number;
    content: string;
  }>;
  toolUsage?: string[];
};

const quickPrompts = [
  "Summarize uploaded documents",
  "Medication interactions",
  "List indexed files",
  "Clinical recommendations",
];

const starterMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Ask anything about your uploaded knowledge base. I’ll search indexed documents and return grounded answers.",
};

export default function AskAiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    starterMessage,
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const resetChat = () => {
    setMessages([starterMessage]);
    setInput("");
  };

  const sendMessage = async (prompt?: string) => {
    const content = (prompt ?? input).trim();

    if (!content || isSending) return;

    const nextUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    const nextMessages = [...messages, nextUserMessage];

    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/rag/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Failed to generate response."
        );
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer ?? "No answer returned.",
        sources: data.sources ?? [],
        toolUsage: data.toolUsage ?? [],
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected chat error.";

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen max-h-screen flex-col overflow-hidden bg-slate-50">
      {/* HEADER */}
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-sm font-semibold text-slate-950 sm:text-base">
                AI Knowledge Assistant
              </h1>

              <p className="text-xs text-slate-500">
                Grounded document responses
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={resetChat}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">
              Reset
            </span>
          </Button>
        </div>
      </header>

      {/* ONLY THIS AREA SCROLLS */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          ref={messagesRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
            {messages.map((message) => (
              <article
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "flex max-w-[95%] gap-3 sm:max-w-[82%]",
                    message.role === "user" &&
                      "flex-row-reverse"
                  )}
                >
                  {/* AVATAR */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                      message.role === "user"
                        ? "bg-sky-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  {/* MESSAGE */}
                  <div
                    className={cn(
                      "rounded-3xl px-4 py-4 shadow-sm",
                      message.role === "user"
                        ? "bg-sky-600 text-white"
                        : "border border-slate-200 bg-white text-slate-800"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-7">
                      {message.content}
                    </p>

                    {/* TOOLS */}
                    {message.role === "assistant" &&
                      message.toolUsage &&
                      message.toolUsage.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {message.toolUsage.map((tool) => (
                            <Badge
                              key={tool}
                              variant="secondary"
                              className="rounded-full"
                            >
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      )}

                    {/* SOURCES */}
                    {message.role === "assistant" &&
                      message.sources &&
                      message.sources.length > 0 && (
                        <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-500" />

                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Sources
                            </p>
                          </div>

                          {message.sources.map((source) => (
                            <div
                              key={source.id}
                              className="rounded-2xl bg-white p-3"
                            >
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="truncate text-xs font-semibold text-slate-700">
                                  {source.fileName}
                                </p>

                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  Chunk{" "}
                                  {source.chunkIndex + 1}
                                </Badge>
                              </div>

                              <p className="line-clamp-4 text-xs leading-6 text-slate-500">
                                {source.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </article>
            ))}

            {/* LOADING */}
            {isSending && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  Searching knowledge base...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FIXED INPUT SECTION */}
        <div className="shrink-0 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4">
            {/* SUGGESTIONS */}
            {messages.length <= 1 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* INPUT */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/50">
                <Textarea
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  placeholder="Ask about uploaded documents..."
                  className="max-h-40 min-h-[60px] resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0"
                />

                <div className="mt-3 flex items-center justify-end">
                  <Button
                    type="submit"
                    disabled={isSending || !input.trim()}
                    className="h-11 rounded-2xl px-5"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}