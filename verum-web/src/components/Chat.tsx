"use client";
import { useState, useRef, useEffect } from "react";
import { sha512Hex } from "@/lib/pdf";

type Msg = { 
  role: "user" | "assistant"; 
  content: string;
  fileInfo?: { name: string; size: number; hash: string };
};

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; hash: string } | null>(null);
  const [contextProvided, setContextProvided] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs]);

  // Show greeting on mount
  useEffect(() => {
    if (msgs.length === 0) {
      setMsgs([{
        role: "assistant",
        content: "👋 Hey.\nYou can upload a file here 📎 or just tell me what's bugging you.\n(Eg. \"The bank ignored my affidavit.\")"
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const hash = await sha512Hex(buf);
      const fileInfo = { name: file.name, size: file.size, hash };
      setUploadedFile(fileInfo);
      setContextProvided(false);

      // Update greeting for file upload case
      setMsgs([{
        role: "assistant",
        content: `📄 Got your file: ${file.name} • ${file.size} bytes.\nBefore I do anything — tell me in your own words what's going on.\n(Eg. "This invoice looks fake" / "This contract was changed without my consent.")\nI'm listening.`,
        fileInfo
      }]);
    } catch (error: any) {
      console.error("File upload error:", error);
      setMsgs([{
        role: "assistant",
        content: "❌ Error uploading file: " + error.message
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    const prompt = input.trim();
    if (!prompt) return;
    setInput("");
    
    // Build context for API
    const context = uploadedFile ? {
      hasFile: true,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      fileHash: uploadedFile.hash,
      contextProvided
    } : { hasFile: false };

    const userMsg: Msg = { role: "user", content: prompt };
    const next = [...msgs, userMsg, { role: "assistant" as const, content: "" }];
    setMsgs(next);
    setLoading(true);

    // Mark context as provided after first user message with file
    if (uploadedFile && !contextProvided) {
      setContextProvided(true);
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: next.slice(-20),
          context 
        }),
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
            } catch {
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
              {m.fileInfo && (
                <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600 text-xs font-mono">
                  <div className="opacity-70">SHA-512 (first 16):</div>
                  <code className="break-all">{m.fileInfo.hash.slice(0, 16)}...</code>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.txt,image/*"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
          disabled={loading}
          title="Upload file"
        >
          📎
        </button>
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
