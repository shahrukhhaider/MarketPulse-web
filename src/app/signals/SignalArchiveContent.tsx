"use client";

import { useEffect, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MarketContext {
  market_mood: string | null;
  market_regime: string;
  vix: number | null;
  vix_regime: string;
  breadth_pct: number | null;
  breadth_label: string;
}

interface ActiveSignal {
  ticker: string;
  strategy: string;
  entry: number;
  stop: number;
  target: number;
  confidence: number;
  rs_rating: number;
  rvol: number | null;
  rationale: string[];
  currentPrice: number | null;
  pnlPct: number | null;
  outcome: "target_hit" | "stopped_out" | "open" | "pending";
}

interface NearSignal {
  ticker: string;
  strategy: string;
  entry_trigger: number;
  stop: number;
  confidence: number;
  rs_rating: number;
  rationale: string[];
}

interface ArchiveEntryResponse {
  date: string;
  market_context: MarketContext | null;
  active: ActiveSignal[];
  near: NearSignal[];
}

// ---------------------------------------------------------------------------
// API URL
// ---------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_RAILWAY_API_URL || "";
const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "";

// ---------------------------------------------------------------------------
// Placeholder sub-components (will be replaced by parallel tasks 3.2–3.5)
// ---------------------------------------------------------------------------

function DateNavigator({
  dates,
  selectedDate,
  onSelect,
}: {
  dates: string[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  if (dates.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-6">
      <label htmlFor="archive-date-select" className="text-sm text-slate-400">
        Scan Date:
      </label>
      <select
        id="archive-date-select"
        value={selectedDate ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-h-60 overflow-y-auto"
      >
        {dates.map((date) => (
          <option key={date} value={date}>
            {date}
          </option>
        ))}
      </select>
    </div>
  );
}

function MarketContextBanner({ context }: { context: MarketContext | null }) {
  if (!context || !context.market_mood) return null;

  const moodColor =
    context.market_mood === "bullish"
      ? "text-green-400"
      : context.market_mood === "bearish"
        ? "text-red-400"
        : "text-yellow-400";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className={`font-semibold capitalize ${moodColor}`}>
          {context.market_mood}
        </span>
        <span className="text-slate-400">
          VIX: {context.vix != null ? context.vix.toFixed(1) : "—"}{" "}
          <span className="text-slate-500">({context.vix_regime})</span>
        </span>
        <span className="text-slate-400">
          Breadth:{" "}
          {context.breadth_pct != null ? `${Math.round(context.breadth_pct)}%` : "—"}{" "}
          <span className="text-slate-500">({context.breadth_label})</span>
        </span>
      </div>
    </div>
  );
}

function ActiveSignalCard({ signal }: { signal: ActiveSignal }) {
  const pnlColor =
    signal.pnlPct != null && signal.pnlPct > 0
      ? "text-green-400"
      : "text-red-400";

  const outcomeMap = {
    target_hit: { text: "✓ Target Hit", color: "text-green-400" },
    stopped_out: { text: "✗ Stopped Out", color: "text-red-400" },
    open: { text: "◌ Open", color: "text-slate-400" },
    pending: { text: "— Pending", color: "text-slate-600" },
  };

  const outcome = outcomeMap[signal.outcome];

  // R-multiple: abs(target - entry) / abs(entry - stop), shown when not pending
  const riskDistance = Math.abs(signal.entry - signal.stop);
  const rewardDistance = Math.abs(signal.target - signal.entry);
  const rMultiple =
    signal.outcome !== "pending" && riskDistance > 0
      ? (rewardDistance / riskDistance).toFixed(1)
      : null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-xl font-bold text-white">{signal.ticker}</h3>
        <span className={`text-sm font-medium ${outcome.color}`}>
          {outcome.text}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-3 capitalize">
        {signal.strategy.replace(/_/g, " ")}
      </p>
      <div className="grid grid-cols-3 gap-2 text-sm mb-3">
        <div>
          <span className="text-slate-500 block text-xs">Entry</span>
          <span className="text-slate-200">${signal.entry.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-xs">Stop</span>
          <span className="text-slate-200">${signal.stop.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-xs">Target</span>
          <span className="text-slate-200">${signal.target.toFixed(2)}</span>
        </div>
      </div>
      {signal.currentPrice != null && signal.pnlPct != null && (
        <div className="flex items-center gap-3 text-sm mb-3">
          <span className="text-slate-400">
            Current: ${signal.currentPrice.toFixed(2)}
          </span>
          <span className={`font-medium ${pnlColor}`}>
            {signal.pnlPct >= 0 ? "+" : ""}
            {signal.pnlPct.toFixed(2)}%
          </span>
        </div>
      )}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        <span>Confidence: {signal.confidence}</span>
        <span>RS: {signal.rs_rating}</span>
        {signal.rvol != null && <span>RVOL: {signal.rvol.toFixed(1)}x</span>}
        {rMultiple != null && <span>R: {rMultiple}</span>}
      </div>
      {signal.rationale.length > 0 && (
        <ul className="text-xs text-slate-400 list-disc list-inside space-y-0.5">
          {signal.rationale.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NearSignalCard({ signal }: { signal: NearSignal }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-xl font-bold text-white">{signal.ticker}</h3>
        <span className="text-xs text-slate-500 italic">Near Setup</span>
      </div>
      <p className="text-xs text-slate-500 mb-3 capitalize">
        {signal.strategy.replace(/_/g, " ")}
      </p>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-slate-500 block text-xs">Entry Trigger</span>
          <span className="text-slate-200">
            ${signal.entry_trigger.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-xs">Stop</span>
          <span className="text-slate-200">${signal.stop.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        <span>Confidence: {signal.confidence}</span>
        <span>RS: {signal.rs_rating}</span>
      </div>
      {signal.rationale.length > 0 && (
        <ul className="text-xs text-slate-400 list-disc list-inside space-y-0.5">
          {signal.rationale.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DiscordCTA() {
  if (!DISCORD_URL) return null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 px-6 py-8 mt-10 text-center">
      <h3 className="text-lg font-semibold text-white mb-2">
        Get Live Signals Daily
      </h3>
      <p className="text-slate-400 text-sm mb-4">
        Join the PaperEdge community on Discord for real-time signals, market
        commentary, and trade journaling tools.
      </p>
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join the PaperEdge Discord community for live signals"
        className="inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4752C4] transition-colors"
      >
        Join Discord →
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SignalArchiveContent() {
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [entry, setEntry] = useState<ArchiveEntryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch signals for a specific date
  const fetchSignalsForDate = useCallback(async (date: string) => {
    setError(false);
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(
        `${API_URL}/api/signals/archive/${date}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const data: ArchiveEntryResponse = await res.json();
        setEntry(data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: fetch available dates, auto-select most recent
  useEffect(() => {
    async function init() {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch(
          `${API_URL}/api/signals/archive/dates`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const dateList: string[] = data.dates ?? [];
          setDates(dateList);

          if (dateList.length > 0) {
            const mostRecent = dateList[0];
            setSelectedDate(mostRecent);
            await fetchSignalsForDate(mostRecent);
          } else {
            // No dates available
            setLoading(false);
          }
        } else {
          setError(true);
          setLoading(false);
        }
      } catch {
        setError(true);
        setLoading(false);
      }
    }

    init();
  }, [fetchSignalsForDate]);

  // Handle date selection change
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    fetchSignalsForDate(date);
  };

  // ─── Empty state: no dates available ───
  if (!loading && !error && dates.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-5xl mb-4">📭</p>
          <h2 className="text-xl font-bold text-white mb-2">
            No Signal Data Yet
          </h2>
          <p className="text-slate-400">
            Signal scans haven&apos;t been recorded yet. Check back after the
            first daily scan completes.
          </p>
        </div>
      </div>
    );
  }

  // ─── Loading state ───
  if (loading && !entry) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4 animate-pulse">📡</p>
          <p className="text-slate-400">Loading signal archive...</p>
        </div>
      </div>
    );
  }

  // ─── Error state (preserves DateNavigator) ───
  if (error) {
    return (
      <div>
        <DateNavigator
          dates={dates}
          selectedDate={selectedDate}
          onSelect={handleDateSelect}
        />
        <div className="min-h-[40vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-5xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold text-white mb-2">
              Data Unavailable
            </h2>
            <p className="text-slate-400">
              Unable to load signal data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loaded state ───
  return (
    <div>
      <DateNavigator
        dates={dates}
        selectedDate={selectedDate}
        onSelect={handleDateSelect}
      />

      {entry && (
        <>
          <MarketContextBanner context={entry.market_context} />

          {/* Active signals */}
          {entry.active.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">
                Active Signals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entry.active.map((signal) => (
                  <ActiveSignalCard
                    key={`${signal.ticker}-${signal.strategy}`}
                    signal={signal}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Near signals */}
          {entry.near.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">
                Near Setups
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entry.near.map((signal) => (
                  <NearSignalCard
                    key={`${signal.ticker}-${signal.strategy}`}
                    signal={signal}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty entry: date exists but no signals */}
          {entry.active.length === 0 && entry.near.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">
                No signals were generated on this date.
              </p>
            </div>
          )}

          <DiscordCTA />
        </>
      )}
    </div>
  );
}
