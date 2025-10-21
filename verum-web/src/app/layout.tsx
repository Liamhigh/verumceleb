import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verum Omnis - Constitutional AI Guardian",
  description: "Truth belongs to the people. Forensic document analysis, contradiction detection, and immutable sealing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
