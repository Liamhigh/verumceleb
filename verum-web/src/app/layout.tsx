import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verum Omnis - Truth Above All",
  description: "Document verification, OCR, and forensic sealing with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
