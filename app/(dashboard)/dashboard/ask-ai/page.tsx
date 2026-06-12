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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

const markdownComponents = {
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("whitespace-pre-wrap text-sm leading-7", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("list-disc space-y-2 pl-5 text-sm leading-7", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("list-decimal space-y-2 pl-5 text-sm leading-7", className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("pl-1", className)} {...props} />
  ),
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn("text-lg font-semibold text-slate-950", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn("text-base font-semibold text-slate-950", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-sm font-semibold text-slate-950", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        "border-l-4 border-sky-200 pl-4 text-sm italic text-slate-600",
        className
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className={cn("font-medium text-sky-700 underline decoration-sky-300 underline-offset-2", className)}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const isInlineCode = !className?.includes("language-");

    if (isInlineCode) {
      return (
        <code
          className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-900"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code
        className={cn(
          "block overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 font-mono text-xs leading-6 text-slate-100",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className={cn("overflow-x-auto rounded-2xl", className)} {...props} />
  ),
  table: ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <table className={cn("my-4 w-full border-collapse text-sm", className)} {...props} />
  ),
  th: ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn("border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold", className)}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn("border border-slate-200 px-3 py-2 align-top", className)} {...props} />
  ),
};

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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-transparent">
      {/* HEADER */}
      <div className="flex shrink-0 items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-sm shadow-sky-500/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-900">
                AI Knowledge Assistant
              </h1>
              <Badge variant="secondary" className="bg-sky-50 text-sky-700 hover:bg-sky-100 border-none rounded-full px-2.5 py-0.5 text-[10px] font-medium">
                RAG Engine
              </Badge>
            </div>

            <p className="text-xs text-slate-500">
              Ask anything grounded in your uploaded knowledge base
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          onClick={resetChat}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">
            Reset Chat
          </span>
        </Button>
      </div>

      {/* MESSAGES & WELCOME SCREEN CONTAINER */}
      <div className="flex-grow flex-1 min-h-0 w-full overflow-hidden flex flex-col my-4">
        <div
          ref={messagesRef}
          className="flex-grow flex-1 overflow-y-auto pr-1.5 space-y-6"
        >
          {messages.length <= 1 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 max-w-xl mx-auto my-auto">
              <div className="relative mb-5">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 blur opacity-20 animate-pulse"></div>
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/20">
                  <Sparkles className="h-7 w-7" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-1.5">
                Clinical Knowledge Base Search
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Ask specific medical questions, query uploaded clinic policies, diagnostic charts, or drug guides. I&apos;ll scan the indexed context to provide precise references.
              </p>

              <div className="w-full space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left pl-1">
                  Suggested Queries
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="flex items-center text-left rounded-xl border border-slate-100 bg-white p-3 text-xs font-medium text-slate-700 transition duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-700 hover:scale-[1.01] active:scale-[0.99] shadow-sm"
                    >
                      <Sparkles className="mr-2 h-3.5 w-3.5 text-sky-500 shrink-0" />
                      <span className="truncate">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={cn(
                    "flex w-full gap-3",
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-gradient-to-tr from-sky-50 to-indigo-50 border border-sky-100 text-sky-600 shadow-sm">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "relative max-w-[85%] rounded-2xl px-4 py-3.5 shadow-sm transition-all duration-200",
                      message.role === "user"
                        ? "bg-gradient-to-br from-sky-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10"
                        : "bg-slate-50/60 border border-slate-100 text-slate-800 rounded-tl-none hover:bg-slate-50"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-slate max-w-none dark:prose-invert">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {message.content}
                      </p>
                    )}

                    {/* TOOLS */}
                    {message.role === "assistant" &&
                      message.toolUsage &&
                      message.toolUsage.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mr-1 select-none">
                            Engines:
                          </span>
                          {message.toolUsage.map((tool) => (
                            <Badge
                              key={tool}
                              variant="outline"
                              className="rounded-full bg-white text-slate-600 border-slate-200 px-2.5 py-0 text-[10px]"
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
                        <div className="mt-4 space-y-2 rounded-xl border border-slate-100 bg-white p-3 shadow-inner">
                          <div className="flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                              <FileText className="h-3 w-3" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Grounded Sources ({message.sources.length})
                            </p>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            {message.sources.map((source) => (
                              <div
                                key={source.id}
                                className="group relative rounded-lg border border-slate-50 bg-slate-50/20 p-2.5 transition duration-150 hover:border-indigo-100 hover:bg-indigo-50/10"
                              >
                                <div className="mb-1.5 flex items-center justify-between gap-2">
                                  <p className="truncate text-xs font-semibold text-slate-700 group-hover:text-indigo-900">
                                    {source.fileName}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="bg-white px-1.5 py-0 text-[9px] font-normal border-slate-100 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200"
                                  >
                                    Chunk {source.chunkIndex + 1}
                                  </Badge>
                                </div>
                                <p className="line-clamp-3 text-[11px] leading-5 text-slate-500 group-hover:text-slate-600">
                                  {source.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-indigo-600/10">
                      <User className="h-4.5 w-4.5" />
                    </div>
                  )}
                </article>
              ))}

              {/* LOADING INDICATOR */}
              {isSending && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500 shadow-sm animate-pulse">
                    Scanning knowledge base and formulating grounded response...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* INPUT SECTION */}
      <div className="shrink-0 pt-4 border-t border-slate-100 bg-white">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
        >
          <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400 transition-all duration-200">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Ask a medical clinical question grounded in your uploaded documents..."
              className="max-h-32 min-h-[50px] w-full resize-none border-0 bg-transparent py-2 px-3 text-sm shadow-none focus-visible:ring-0 placeholder:text-slate-400 text-slate-800"
            />

            <div className="flex items-center justify-between border-t border-slate-50 pt-2 px-2.5">
              <span className="text-[10px] text-slate-400 font-medium">
                Grounded on uploaded database • AI-generated advice should be verified
              </span>

              <Button
                type="submit"
                disabled={isSending || !input.trim()}
                className="h-9 rounded-xl px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/10 hover:shadow-lg active:scale-[0.98]"
              >
                {isSending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Query</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
