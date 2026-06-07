import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signal Archive | MarketPulse",
  description:
    "Browse past swing trade signals from MarketPulse. See how our AI-powered system identifies high-probability setups using market regime detection and relative strength analysis.",
};

export const revalidate = 86400;

interface SignalEntry {
  date: string;
  timestamp: string;
  market_context: {
    market_mood: string;
    market_regime: string;
    vix: number;
    vix_regime: string;
    breadth_pct: number;
    breadth_label: string;
  };
  active: Array<{
    ticker: string;
    strategy: string;
    entry: number;
    stop: number;
    target: number;
    confidence: number;
    rs_rating: number;
    rationale: string[];
    rvol: number;
  }>;
  near: Array<{
    ticker: string;
    strategy: string;
    entry_trigger: number;
    confidence: number;
    rs_rating: number;
    rationale: string[];
  }>;
}

function getMoodEmoji(mood: string): string {
  const moodMap: Record<string, string> = {
    bullish: "🟢",
    cautiously_bullish: "🟡",
    neutral: "⚪",
    cautiously_bearish: "🟠",
    bearish: "🔴",
  };
  return moodMap[mood.toLowerCase()] || "⚪";
}

function formatStrategy(strategy: string): string {
  return strategy
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatLabel(label: string): string {
  return label
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function getSignals(): Promise<SignalEntry | null> {
  const apiUrl = process.env.RAILWAY_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}/api/signals/week-ago`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    // API returns an array; use the first (most recent) entry
    if (Array.isArray(data) && data.length > 0) return data[0];
    if (!Array.isArray(data) && data) return data;
    return null;
  } catch {
    return null;
  }
}

export default async function SignalsPage() {
  const signal = await getSignals();
  const discordUrl = process.env.DISCORD_INVITE_URL || "#";

  if (!signal) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Signal Archive</h1>
        <p className="text-slate-400 text-lg">
          Signal archive is building — check back after the first week of
          operation.
        </p>
      </section>
    );
  }

  const { market_context, active, date } = signal;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      {/* Banner */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-6 py-4 mb-10 text-center">
        <p className="text-amber-200 text-sm sm:text-base">
          📅 These signals are from <span className="font-semibold">{date}</span>{" "}
          — 7 days ago. Today&apos;s live signals are available to community
          members.
        </p>
      </div>

      {/* Market Context Header */}
      <div className="mb-10 rounded-lg bg-slate-900 border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-slate-300 mb-4">
          Market Context
        </h2>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {getMoodEmoji(market_context.market_mood)}
            </span>
            <span className="text-slate-200 font-medium">
              {formatLabel(market_context.market_mood)}
            </span>
            <span className="text-slate-500">
              ({formatLabel(market_context.market_regime)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">VIX:</span>
            <span className="text-slate-200 font-medium">
              {market_context.vix}
            </span>
            <span className="text-slate-500">
              ({formatLabel(market_context.vix_regime)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Breadth:</span>
            <span className="text-slate-200 font-medium">
              {market_context.breadth_pct}%
            </span>
            <span className="text-slate-500">
              ({formatLabel(market_context.breadth_label)})
            </span>
          </div>
        </div>
      </div>

      {/* Signal Cards */}
      <h2 className="text-2xl font-bold mb-6">Active Signals</h2>
      {active.length === 0 ? (
        <p className="text-slate-400">No active signals for this date.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {active.map((sig) => {
            const rr =
              sig.entry - sig.stop !== 0
                ? (sig.target - sig.entry) / (sig.entry - sig.stop)
                : 0;

            return (
              <div
                key={sig.ticker}
                className="rounded-xl border border-slate-700 bg-slate-800 p-6 flex flex-col gap-4 hover:border-green-500/40 transition-colors"
              >
                {/* Ticker + Strategy */}
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold text-green-400">
                    {sig.ticker}
                  </h3>
                  <span className="text-sm font-medium text-slate-400 bg-slate-700/60 px-3 py-1 rounded-full">
                    {formatStrategy(sig.strategy)}
                  </span>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500 block">Confidence</span>
                    <span className="text-slate-100 font-semibold">
                      {Math.round(sig.confidence * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">RS Rating</span>
                    <span className="text-slate-100 font-semibold">
                      {sig.rs_rating}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">R:R</span>
                    <span className="text-slate-100 font-semibold">
                      {rr.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">RVOL</span>
                    <span className="text-slate-100 font-semibold">
                      {sig.rvol.toFixed(1)}x
                    </span>
                  </div>
                </div>

                {/* Price Levels */}
                <div className="flex gap-4 text-sm border-t border-slate-700 pt-4">
                  <div>
                    <span className="text-slate-500 block">Entry</span>
                    <span className="text-slate-100 font-medium">
                      ${sig.entry.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Stop</span>
                    <span className="text-red-400 font-medium">
                      ${sig.stop.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target</span>
                    <span className="text-green-400 font-medium">
                      ${sig.target.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Rationale */}
                {sig.rationale.length > 0 && (
                  <div className="border-t border-slate-700 pt-4">
                    <span className="text-slate-500 text-xs uppercase tracking-wide block mb-2">
                      Rationale
                    </span>
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                      {sig.rationale.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA */}
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#00c853] px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-[#00e676] transition-colors"
                >
                  See today&apos;s full setup →
                </a>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
