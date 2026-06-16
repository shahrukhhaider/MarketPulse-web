import type { Metadata } from "next";
import SignalArchiveContent from "./SignalArchiveContent";

export const metadata: Metadata = {
  title: "Signal Archive | PaperEdge",
  description:
    "Browse the archive of PaperEdge swing trade signals by date. See past entries, outcomes, and market context.",
  openGraph: {
    siteName: "PaperEdge",
    title: "Signal Archive | PaperEdge",
    description:
      "Browse the archive of PaperEdge swing trade signals by date. See past entries, outcomes, and market context.",
  },
};

export default function SignalsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Signal Archive
        </h1>
        <p className="mt-3 text-slate-400 max-w-2xl">
          Browse past signals by date. Live signals are available to community
          members on Discord.
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <SignalArchiveContent />
      </section>
    </div>
  );
}
