import Image from "next/image";

export default function Home() {
  return (
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
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Client-side text extraction (PDF.js) + optional OCR (Tesseract.js) + SHA-512 hashing
        </p>
        <PdfReader />
      </section>

      <footer className="text-center text-sm text-gray-500 dark:text-gray-600 py-8">
        <p>Verum Omnis — Truth above all. Built with Next.js + Tailwind.</p>
      </footer>
    </main>
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
