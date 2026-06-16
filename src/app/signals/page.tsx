import type { Metadata } from "next";
import SignalArchiveContent from "./SignalArchiveContent";

export const metadata: Metadata = {
  title: "Opportunity Library | PaperEdge",
  description:
    "Browse the archive of PaperEdge swing trading opportunities by date. Paper trade ideas, track outcomes, and learn from real market behavior.",
  openGraph: {
    siteName: "PaperEdge",
    title: "Opportunity Library | PaperEdge",
    description:
      "Browse the archive of PaperEdge swing trading opportunities by date. Paper trade ideas, track outcomes, and learn from real market behavior.",
  },
};

export default function SignalsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Opportunity Library
        </h1>
        <p className="mt-3 text-slate-400 max-w-2xl">
          Every opportunity published by PaperEdge remains available for review.
          Paper trade ideas, track outcomes, and learn from real market behavior.
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <SignalArchiveContent />
      </section>
    </div>
  );
}
