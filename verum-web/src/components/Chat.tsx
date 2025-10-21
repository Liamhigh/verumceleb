"use client";
import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs]);

  async function send() {
    const prompt = input.trim();
    if (!prompt) return;
    setInput("");
    const next = [...msgs, { role: "user" as const, content: prompt }, { role: "assistant" as const, content: "" }];
    setMsgs(next);
    setLoading(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-20) }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to fetch chat response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                acc += token;
                setMsgs(prev => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last?.role === "assistant") last.content = acc;
                  return copy;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Chat error:", error);
      setMsgs(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant") last.content = "❌ Error: " + error.message;
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div 
        ref={scrollRef}
        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-96 overflow-y-auto bg-white dark:bg-slate-900 scroll-smooth"
      >
        {msgs.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-600 mt-12">
            <p>👋 Start a conversation...</p>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`mb-3 ${m.role === "user" ? "text-right" : ""}`}>
            <div className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
              m.role === "user" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            }`}>
              <pre className="whitespace-pre-wrap break-words text-sm font-sans">
                {m.content || (m.role === "assistant" && loading ? "..." : "")}
              </pre>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything..."
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          disabled={loading}
        />
        <button 
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
          onClick={send} 
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
