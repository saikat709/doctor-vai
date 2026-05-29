"use client";

const QUEUE_KEY = "offline_vaccination_queue";

export function useOfflineQueue() {
  const enqueue = (payload: object) => {
    try {
      const existing = JSON.parse(
        localStorage.getItem(QUEUE_KEY) ?? "[]"
      ) as object[];
      localStorage.setItem(QUEUE_KEY, JSON.stringify([...existing, payload]));
    } catch {}
  };

  const flushQueue = async (
    endpoint: string,
    onFlushed?: (count: number) => void
  ) => {
    try {
      const queue = JSON.parse(
        localStorage.getItem(QUEUE_KEY) ?? "[]"
      ) as object[];
      if (queue.length === 0) return;

      const results = await Promise.allSettled(
        queue.map((payload) =>
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        )
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = queue.filter((_, i) => results[i].status === "rejected");

      localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
      onFlushed?.(succeeded);
    } catch {}
  };

  return { enqueue, flushQueue };
}