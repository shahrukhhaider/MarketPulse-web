import type { Metadata } from "next";

export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MarketData {
  mood: "bullish" | "neutral" | "bearish";
  vix: number;
  vixRegime: string;
  breadth: number;
  breadthLabel: string;
  spyTrend: "bullish" | "bearish" | "neutral";
  qqqTrend: "bullish" | "bearish" | "neutral";
  spyChangePct: number | null;
  qqqChangePct: number | null;
  exposureTier: "full" | "reduced" | "minimal";
  timestamp: string;
}

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
    currentPrice: number | null;
    pnlPct: number | null;
  }>;
}

// ---------------------------------------------------------------------------
// Data fetchers
// ---------------------------------------------------------------------------

async function getMarketData(): Promise<MarketData | null> {
  try {
    const res = await fetch(`${process.env.RAILWAY_API_URL}/api/market`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const raw = await res.json();
    return {
      mood: raw.market_mood,
      vix: raw.vix,
      vixRegime: raw.vix_regime,
      breadth: raw.breadth_pct,
      breadthLabel: raw.breadth_label,
      spyTrend: raw.spy_trend,
      qqqTrend: raw.qqq_trend,
      spyChangePct: raw.spy_change_pct ?? null,
      qqqChangePct: raw.qqq_change_pct ?? null,
      exposureTier: raw.exposure_tier,
      timestamp: raw.updated_at,
    };
  } catch {
    return null;
  }
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
    if (Array.isArray(data) && data.length > 0) return data[0];
    if (!Array.isArray(data) && data) return data;
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata(): Promise<Metadata> {
  const data = await getMarketData();

  if (!data) {
    return {
      title: "Market & Signals | MarketPulse",
      description:
        "Daily market regime analysis and signal archive for swing traders.",
    };
  }

  return {
    title: `Market Mood: ${data.mood} | VIX ${data.vix ?? "—"} | MarketPulse`,
    description: `Today's market mood is ${data.mood}. VIX at ${data.vix ?? "—"} (${data.vixRegime}), breadth ${data.breadth}% (${data.breadthLabel}), SPY ${data.spyTrend}, QQQ ${data.qqqTrend}. Exposure tier: ${data.exposureTier}.`,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMoodEmoji(mood: string) {
  switch (mood) {
    case "bullish": return "🟢";
    case "bearish": return "🔴";
    default: return "🟡";
  }
}

function getExplainer(mood: string, vixRegime: string): string {
  if (mood === "bullish" && vixRegime === "normal")
    return "Markets are in a favorable regime for swing trading. Full position sizing is appropriate with strong breadth supporting upside moves.";
  if (mood === "bullish")
    return "Markets are bullish but volatility is elevated. Consider reduced position sizes and wider stops.";
  if (mood === "neutral")
    return "Markets are showing mixed signals. Be selective with entries and keep position sizes moderate.";
  return "Markets are in a defensive regime. Focus on capital preservation — short setups or cash is preferred.";
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "bullish": return "↑";
    case "bearish": return "↓";
    default: return "→";
  }
}

function getTrendColor(trend: string) {
  switch (trend) {
    case "bullish": return "text-green-400";
    case "bearish": return "text-red-400";
    default: return "text-yellow-400";
  }
}

function getExposureColor(tier: string) {
  switch (tier) {
    case "full": return "text-green-400";
    case "reduced": return "text-yellow-400";
    default: return "text-red-400";
  }
}

function formatStrategy(strategy: string): string {
  return strategy
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function MarketPage() {
  const [data, signal] = await Promise.all([getMarketData(), getSignals()]);
  const discordUrl = process.env.DISCORD_INVITE_URL || "#";

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-6">📊</p>
          <h1 className="text-2xl font-bold text-white mb-4">
            Market Data Unavailable
          </h1>
          <p className="text-slate-400 text-lg">
            Market data updates after 4:30 PM ET each trading day. Check back
            after market close.
          </p>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "MarketPulse Daily Market Mood",
    description: `Daily market regime analysis: mood ${data.mood}, VIX ${data.vix}, breadth ${data.breadth}%, SPY ${data.spyTrend}, QQQ ${data.qqqTrend}, exposure ${data.exposureTier}.`,
    temporalCoverage: data.timestamp,
    creator: { "@type": "Organization", name: "MarketPulse" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-slate-950 text-white">
        <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">

          {/* ═══════════════════ MARKET MOOD SECTION ═══════════════════ */}
          <section className="text-center mb-12">
            <p className="text-7xl mb-4">{getMoodEmoji(data.mood)}</p>
            <h1 className="text-4xl sm:text-5xl font-bold capitalize mb-2">
              {data.mood}
            </h1>
            <p className="text-slate-400 text-lg">Today&apos;s Market Mood</p>
          </section>

          {/* Metric Cards */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 max-w-4xl mx-auto">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">VIX</p>
              <p className="text-2xl font-bold">{data.vix != null ? data.vix.toFixed(1) : "—"}</p>
              <p className="text-xs text-slate-500 capitalize">{data.vixRegime !== "unknown" ? data.vixRegime : "awaiting data"}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Breadth</p>
              <p className="text-2xl font-bold">{data.breadth}%</p>
              <p className="text-xs text-slate-500 capitalize">{data.breadthLabel}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">SPY</p>
              <p className={`text-2xl font-bold ${getTrendColor(data.spyTrend)}`}>
                {getTrendIcon(data.spyTrend)} <span className="capitalize">{data.spyTrend}</span>
              </p>
              {data.spyChangePct != null && (
                <p className={`text-sm mt-1 font-medium ${data.spyChangePct >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {data.spyChangePct >= 0 ? "+" : ""}{data.spyChangePct.toFixed(2)}% last session
                </p>
              )}
              {data.spyChangePct != null && data.spyTrend === "bullish" && data.spyChangePct < -0.5 && (
                <p className="text-xs text-amber-400 mt-1">⚠️ Trend bullish but declined last session</p>
              )}
              {data.spyChangePct != null && data.spyTrend === "bearish" && data.spyChangePct > 0.5 && (
                <p className="text-xs text-amber-400 mt-1">⚠️ Trend bearish but rallied last session</p>
              )}
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">QQQ</p>
              <p className={`text-2xl font-bold ${getTrendColor(data.qqqTrend)}`}>
                {getTrendIcon(data.qqqTrend)} <span className="capitalize">{data.qqqTrend}</span>
              </p>
              {data.qqqChangePct != null && (
                <p className={`text-sm mt-1 font-medium ${data.qqqChangePct >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {data.qqqChangePct >= 0 ? "+" : ""}{data.qqqChangePct.toFixed(2)}% last session
                </p>
              )}
              {data.qqqChangePct != null && data.qqqTrend === "bullish" && data.qqqChangePct < -0.5 && (
                <p className="text-xs text-amber-400 mt-1">⚠️ Trend bullish but declined last session</p>
              )}
              {data.qqqChangePct != null && data.qqqTrend === "bearish" && data.qqqChangePct > 0.5 && (
                <p className="text-xs text-amber-400 mt-1">⚠️ Trend bearish but rallied last session</p>
              )}
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Exposure</p>
              <p className={`text-2xl font-bold capitalize ${getExposureColor(data.exposureTier)}`}>
                {data.exposureTier}
              </p>
            </div>
          </section>

          <p className="text-center text-sm text-slate-500 mb-6">
            Last updated: {formatTimestamp(data.timestamp)}
          </p>

          {/* Explainer — directly after metrics */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 mb-16 max-w-4xl mx-auto text-center">
            <p className="text-slate-300 leading-relaxed">
              {getExplainer(data.mood, data.vixRegime)}
            </p>
          </section>

          {/* ═══════════════════ SIGNALS SECTION ═══════════════════ */}
          {signal && signal.active.length > 0 && (
            <section>
              {/* Banner */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-6 py-4 mb-8 text-center">
                <p className="text-amber-200 text-sm sm:text-base">
                  📅 These signals are from{" "}
                  <span className="font-semibold">{signal.date}</span> — 7 days
                  ago. Today&apos;s live signals are available to community members.
                </p>
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4752C4] transition-colors"
                >
                  Get today&apos;s live signals →
                </a>
              </div>

              <h2 className="text-2xl font-bold mb-2">Winning Signals</h2>
              <p className="text-slate-400 text-sm mb-6">
                Last week&apos;s scans that are currently in profit.
              </p>

              {(() => {
                const winners = signal.active.filter(
                  (sig) => sig.pnlPct != null && sig.pnlPct > 0
                );

                if (winners.length === 0) {
                  return (
                    <p className="text-slate-500 text-center py-8">
                      No signals currently in profit from this date.
                    </p>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {winners.map((sig) => {
                      const rr =
                        sig.entry - sig.stop !== 0
                          ? (sig.target - sig.entry) / (sig.entry - sig.stop)
                          : 0;

                      return (
                        <div
                          key={`${sig.ticker}-${sig.strategy}`}
                          className="rounded-xl border border-green-500/30 bg-slate-800 p-6 flex flex-col gap-4"
                        >
                          <div className="flex items-baseline justify-between">
                            <h3 className="text-2xl font-bold text-green-400">
                              {sig.ticker}
                            </h3>
                            <span className="text-sm font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full">
                              +{sig.pnlPct!.toFixed(1)}%
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="bg-slate-700/60 px-2 py-0.5 rounded">
                              {formatStrategy(sig.strategy)}
                            </span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-500">{signal.date}</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-slate-500 block">Entry</span>
                              <span className="text-slate-100 font-medium">
                                ${sig.entry.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Current</span>
                              <span className="text-green-400 font-medium">
                                ${sig.currentPrice!.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Target</span>
                              <span className="text-slate-100 font-medium">
                                ${sig.target.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">R:R</span>
                              <span className="text-slate-100 font-semibold">
                                {rr.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </section>
          )}

          {/* Final CTA */}
          <section className="text-center mt-16">
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#00c853] px-8 py-3 text-lg font-medium text-slate-950 transition-colors hover:bg-[#00e676]"
            >
              Join the community for live signals →
            </a>
          </section>
        </main>
      </div>
    </>
  );
}
