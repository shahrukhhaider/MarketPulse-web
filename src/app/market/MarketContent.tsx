"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MarketData {
  mood: "bullish" | "neutral" | "bearish";
  vix: number | null;
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

interface WinningTrade {
  ticker: string;
  strategy: string;
  entryDate: string;
  entryPrice: number;
  stopPrice: number;
  targetPrice: number;
  currentPrice: number;
  pnlPercent: number;
  chartFilename: string | null;
}

interface WinningTradesManifest {
  date: string;
  generatedAt: string;
  trades: WinningTrade[];
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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
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
// API URL (public, exposed to client)
// ---------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_RAILWAY_API_URL || "";
const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MarketContent() {
  const [data, setData] = useState<MarketData | null>(null);
  const [winningTrades, setWinningTrades] = useState<WinningTradesManifest | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tradesLoading, setTradesLoading] = useState(false);

  // Initial load: market data + latest winning trades + available dates
  useEffect(() => {
    async function fetchData() {
      try {
        const [marketRes, tradesRes, datesRes] = await Promise.all([
          fetch(`${API_URL}/api/market`),
          fetch(`${API_URL}/api/winning-trades`),
          fetch(`${API_URL}/api/winning-trades/dates`),
        ]);

        if (marketRes.ok) {
          const raw = await marketRes.json();
          setData({
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
          });
        } else {
          setError(true);
        }

        if (tradesRes.ok) {
          const tradesData = await tradesRes.json();
          if (tradesData && tradesData.trades) {
            setWinningTrades(tradesData);
            setSelectedDate(tradesData.date);
          }
        }

        if (datesRes.ok) {
          const datesData = await datesRes.json();
          if (datesData && Array.isArray(datesData.dates)) {
            setAvailableDates(datesData.dates);
          }
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Load trades for a specific date when user selects from history
  async function loadTradesForDate(date: string) {
    setTradesLoading(true);
    setSelectedDate(date);

    try {
      const [year, month, day] = date.split("-");
      const res = await fetch(`${API_URL}/api/winning-trades/${year}/${month}/${day}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.trades) {
          setWinningTrades(data);
        }
      }
    } catch {
      // Keep existing data on failure
    } finally {
      setTradesLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4 animate-pulse">📊</p>
          <p className="text-slate-400">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
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

  const trades = winningTrades?.trades ?? [];

  return (
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

        {/* Explainer */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 mb-16 max-w-4xl mx-auto text-center">
          <p className="text-slate-300 leading-relaxed">
            {getExplainer(data.mood, data.vixRegime)}
          </p>
        </section>

        {/* ═══════════════════ WINNING TRADES SECTION ═══════════════════ */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Winning Trades</h2>
              <p className="text-slate-400 text-sm mt-1">
                Signals that hit their target — verified by the daily pipeline.
              </p>
            </div>

            {/* Date selector */}
            {availableDates.length > 1 && (
              <div className="flex items-center gap-2">
                <label htmlFor="date-select" className="text-sm text-slate-400">
                  History:
                </label>
                <select
                  id="date-select"
                  value={selectedDate ?? ""}
                  onChange={(e) => loadTradesForDate(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Generation timestamp */}
          {winningTrades && (
            <p className="text-xs text-slate-500 mb-4">
              Generated: {formatTimestamp(winningTrades.generatedAt)}
              {selectedDate && ` · Scan date: ${selectedDate}`}
            </p>
          )}

          {/* Loading state for date switching */}
          {tradesLoading && (
            <div className="text-center py-8">
              <p className="text-slate-400 animate-pulse">Loading trades...</p>
            </div>
          )}

          {/* Trades grid */}
          {!tradesLoading && trades.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
              <p className="text-slate-500">
                No winning trades recorded for this date. Trades must be ≥30 days old and have hit their target.
              </p>
            </div>
          )}

          {!tradesLoading && trades.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trades.map((trade) => {
                const rr =
                  trade.entryPrice - trade.stopPrice !== 0
                    ? (trade.targetPrice - trade.entryPrice) / (trade.entryPrice - trade.stopPrice)
                    : 0;

                // Build chart URL if chartFilename exists
                const chartUrl = trade.chartFilename && selectedDate
                  ? `${API_URL}/api/winning-trades/charts/${selectedDate.replace(/-/g, "/")}/${trade.chartFilename}`
                  : null;

                return (
                  <div
                    key={`${trade.ticker}-${trade.strategy}-${trade.entryDate}`}
                    className="rounded-xl border border-green-500/30 bg-slate-800 p-6 flex flex-col gap-4"
                  >
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-2xl font-bold text-green-400">
                        {trade.ticker}
                      </h3>
                      <span className="text-sm font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full">
                        +{trade.pnlPercent.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="bg-slate-700/60 px-2 py-0.5 rounded">
                        {formatStrategy(trade.strategy)}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-500">
                        Signaled {trade.entryDate}
                      </span>
                      <span className="text-green-500/80 text-xs ml-auto">
                        ✓ Target hit
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500 block">Entry</span>
                        <span className="text-slate-100 font-medium">
                          ${trade.entryPrice.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Current</span>
                        <span className="text-green-400 font-medium">
                          ${trade.currentPrice.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Target</span>
                        <span className="text-slate-100 font-medium">
                          ${trade.targetPrice.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">R:R</span>
                        <span className="text-slate-100 font-semibold">
                          {rr.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Chart image (if available) */}
                    {chartUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={chartUrl}
                          alt={`${trade.ticker} ${formatStrategy(trade.strategy)} chart`}
                          className="w-full h-auto"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="rounded-lg border border-slate-700 bg-slate-900/50 px-6 py-4 mt-8 text-center">
            <p className="text-slate-300 text-sm mb-3">
              Live signals are posted daily to Discord after market close.
            </p>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4752C4] transition-colors"
            >
              Get today&apos;s live signals →
            </a>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center mt-16">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#5865F2] px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-[#4752C4]"
          >
            Join the community for live signals →
          </a>
        </section>
      </main>
    </div>
  );
}
