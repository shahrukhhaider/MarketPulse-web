import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MarketPulse — Market Intelligence for Swing Traders",
  description:
    "Daily swing trade signals, market regime detection, and AI-powered intelligence. Join the community for free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const discordUrl = process.env.DISCORD_INVITE_URL || "#";

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-white font-[family-name:var(--font-inter)]">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Image src="/icon.png" alt="MarketPulse" width={28} height={28} className="rounded" />
              MarketPulse
            </Link>
            <ul className="flex items-center gap-6 text-sm font-medium text-slate-300">
              <li>
                <Link href="/market" className="hover:text-white transition-colors">
                  Market Signals
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-white transition-colors">
                  Learn
                </Link>
              </li>
              <li>
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4752C4] transition-colors"
                >
                  Join
                </a>
              </li>
            </ul>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} MarketPulse. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
