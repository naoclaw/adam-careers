"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I am your Adam Careers AI assistant. I can help improve your CV, write motivation letters, and prepare for interviews.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canSubmit = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;

    const nextMessages = [
      ...messages,
      { role: "user" as const, content: value },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Chat request failed");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.assistant },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I hit an error while generating a response. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div
        ref={scrollRef}
        className="chat-scroll mb-4 h-[60vh] space-y-3 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-4"
      >
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={`max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
              m.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "bg-white text-gray-800 border border-gray-200"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Thinking...</div>}
      </div>

      <form onSubmit={onSubmit} className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for CV improvements, cover letters, or interview prep..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          disabled={!canSubmit}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
}
