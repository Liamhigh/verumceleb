import Chat from "@/components/Chat";
import PdfReader from "@/components/PdfReader";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6 min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="text-center space-y-2 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Verum Omnis
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Client-side PDF reading + AI Chat • No server required for forensics
        </p>
      </header>

      <div className="flex gap-4 justify-center text-sm">
        <a href="#chat" className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition">
          💬 Chat
        </a>
        <a href="#forensics" className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition">
          🔍 Forensics
        </a>
      </div>

      <section id="chat" className="space-y-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">💬 AI Chat</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Streaming chat powered by OpenAI-compatible API
        </p>
        <Chat />
      </section>

      <section id="forensics" className="space-y-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">🔍 Forensic PDF Reader</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>
            <strong>✅ Client-side document processing:</strong>
          </p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>📖 <strong>Text extraction</strong> using PDF.js (extracts text from native PDF pages)</li>
            <li>🔍 <strong>OCR</strong> using Tesseract.js (optical character recognition for image-based pages)</li>
            <li>🔐 <strong>SHA-512 hashing</strong> for document fingerprinting</li>
            <li>📱 <strong>QR code generation</strong> embedded in sealed PDFs for verification</li>
          </ul>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            💡 All processing happens in your browser - no server upload required!
          </p>
        </div>
        <PdfReader />
      </section>

      <footer className="text-center text-sm text-gray-500 dark:text-gray-600 py-8">
        <p>Verum Omnis — Truth above all. Built with Next.js + Tailwind.</p>
      </footer>
    </main>
  );
}
