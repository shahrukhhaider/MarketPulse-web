import type { Metadata } from "next";
import SignalArchiveContent from "./SignalArchiveContent";

export const metadata: Metadata = {
  title: "Opportunity Library | PaperEdge",
  description:
    "Browse the full archive of algorithmically detected swing trading opportunities. Each signal comes from walk-forward validated strategies with verified backtest performance.",
  openGraph: {
    siteName: "PaperEdge",
    title: "Opportunity Library | PaperEdge",
    description:
      "Browse the full archive of algorithmically detected swing trading opportunities. Each signal comes from walk-forward validated strategies with verified backtest performance.",
  },
};

export default function SignalsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Opportunity Library
        </h1>
        <p className="mt-3 text-slate-400 max-w-2xl text-sm leading-relaxed">
          Every trading opportunity our algorithms detect is logged here with entry price, stop, and target. These come from strategies validated on 5 years of historical data — check their{" "}
          <a href="/backtests" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            backtest performance
          </a>{" "}
          to see how they performed on unseen data before risking real capital. Updated daily after market close.
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <SignalArchiveContent />
      </section>
    </div>
  );
}
