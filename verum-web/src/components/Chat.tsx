"use client";
import { useState, useRef, useEffect } from "react";
import { extractPdfTextAll, sha512Hex } from "@/lib/pdf";

type Msg = { role: "user" | "assistant"; content: string };

type DocumentContext = {
  filename: string;
  hash: string;
  text: string;
  pages: number;
  ocrApplied: boolean;
};

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentContext, setDocumentContext] = useState<DocumentContext | null>(null);
  const [processingDoc, setProcessingDoc] = useState(false);
  const [docProgress, setDocProgress] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs]);

  // Process uploaded document
  async function processDocument(file: File) {
    setProcessingDoc(true);
    setDocProgress("📄 Reading document...");
    
    try {
      const buf = await file.arrayBuffer();
      
      // Calculate hash
      setDocProgress("🔐 Computing SHA-512 hash...");
      const hash = await sha512Hex(buf);
      
      // Extract text
      setDocProgress("📖 Extracting text from PDF...");
      const { text, pages, ocrPagesCount } = await extractPdfTextAll(buf, {
        ocr: true,
        onProgress: (msg) => setDocProgress(msg)
      });
      
      setDocProgress("✅ Document read complete!");
      
      // Store document context
      const context: DocumentContext = {
        filename: file.name,
        hash,
        text: text.slice(0, 120000), // Limit to first 120k chars
        pages,
        ocrApplied: ocrPagesCount > 0
      };
      setDocumentContext(context);
      
      // Add system message to chat showing document was read
      const docMsg: Msg = {
        role: "assistant",
        content: `📄 Got your file: **${file.name}** (${pages} pages${ocrPagesCount > 0 ? `, ${ocrPagesCount} processed with OCR` : ''}).\n\n🔐 SHA-512: \`${hash.slice(0, 32)}...\`\n\nBefore I analyze anything — **tell me in your own words what's going on.**\n\n(Eg. "This invoice looks fake" / "This contract was changed without my consent.")\n\nI'm listening. 👂`
      };
      setMsgs(prev => [...prev, docMsg]);
      
      setTimeout(() => setDocProgress(""), 3000);
    } catch (error: any) {
      setDocProgress("❌ Error: " + error.message);
      console.error("Document processing error:", error);
      setTimeout(() => setDocProgress(""), 5000);
    } finally {
      setProcessingDoc(false);
    }
  }

  // Handle file selection
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      processDocument(file);
    }
  }

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
      // Include document context if available
      const payload: any = { messages: next.slice(-20) };
      if (documentContext) {
        payload.documentContext = {
          filename: documentContext.filename,
          hash: documentContext.hash,
          pages: documentContext.pages,
          ocrApplied: documentContext.ocrApplied,
          textSample: documentContext.text.slice(0, 8000) // Send first 8k chars as context
        };
      }
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      {/* File Upload Section */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={processingDoc}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
        >
          <span>📎</span>
          <span>{uploadedFile ? uploadedFile.name : "Upload PDF"}</span>
        </button>
        {uploadedFile && !processingDoc && (
          <button
            onClick={() => {
              setUploadedFile(null);
              setDocumentContext(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Document Processing Progress */}
      {docProgress && (
        <div className="text-sm bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">⏳</span>
            <span className="text-blue-800 dark:text-blue-200">{docProgress}</span>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-96 overflow-y-auto bg-white dark:bg-slate-900 scroll-smooth"
      >
        {msgs.length === 0 && !uploadedFile && (
          <div className="text-center text-gray-400 dark:text-gray-600 mt-12 space-y-3">
            <p className="text-lg">👋 Hey.</p>
            <p className="text-sm">You can upload a file here 📎 or just tell me what&apos;s bugging you.</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">(Eg. &quot;The bank ignored my affidavit.&quot;)</p>
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

      {/* Input Section */}
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={documentContext ? "Tell me what's going on..." : "Ask anything..."}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          disabled={loading || processingDoc}
        />
        <button 
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
          onClick={send} 
          disabled={loading || !input.trim() || processingDoc}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
