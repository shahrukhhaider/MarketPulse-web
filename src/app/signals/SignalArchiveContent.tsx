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

const OUTCOME_MAP = {
  target_hit: { text: "✓ Target Hit", color: "text-green-400" },
  stopped_out: { text: "✗ Stopped Out", color: "text-red-400" },
  open: { text: "◌ Open", color: "text-slate-400" },
  pending: { text: "— Pending", color: "text-slate-600" },
};

function ActiveSignalsTable({ signals }: { signals: ActiveSignal[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-900 text-xs uppercase text-slate-400 border-b border-slate-800">
          <tr>
            <th className="px-4 py-3">Ticker</th>
            <th className="px-4 py-3">Strategy</th>
            <th className="px-4 py-3 text-right">Entry</th>
            <th className="px-4 py-3 text-right">Stop</th>
            <th className="px-4 py-3 text-right">Target</th>
            <th className="px-4 py-3 text-right">Current</th>
            <th className="px-4 py-3 text-right">P&L</th>
            <th className="px-4 py-3 text-center">R</th>
            <th className="px-4 py-3 text-center">Conf</th>
            <th className="px-4 py-3 text-center">RS</th>
            <th className="px-4 py-3 text-center">RVOL</th>
            <th className="px-4 py-3">Outcome</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {signals.map((signal) => {
            const pnlColor =
              signal.pnlPct != null && signal.pnlPct > 0
                ? "text-green-400"
                : "text-red-400";
            const outcome = OUTCOME_MAP[signal.outcome];
            const riskDistance = Math.abs(signal.entry - signal.stop);
            const rewardDistance = Math.abs(signal.target - signal.entry);
            const rMultiple =
              signal.outcome !== "pending" && riskDistance > 0
                ? (rewardDistance / riskDistance).toFixed(1)
                : "—";

            return (
              <tr
                key={`${signal.ticker}-${signal.strategy}`}
                className="bg-slate-950 hover:bg-slate-900/70 transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                  {signal.ticker}
                </td>
                <td className="px-4 py-3 text-slate-400 capitalize whitespace-nowrap">
                  {signal.strategy.replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3 text-right text-slate-200 tabular-nums">
                  ${signal.entry.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-slate-200 tabular-nums">
                  ${signal.stop.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-slate-200 tabular-nums">
                  ${signal.target.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                  {signal.currentPrice != null
                    ? `$${signal.currentPrice.toFixed(2)}`
                    : "—"}
                </td>
                <td className={`px-4 py-3 text-right font-medium tabular-nums ${signal.pnlPct != null ? pnlColor : "text-slate-600"}`}>
                  {signal.pnlPct != null
                    ? `${signal.pnlPct >= 0 ? "+" : ""}${signal.pnlPct.toFixed(2)}%`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-center text-slate-400 tabular-nums">
                  {rMultiple}
                </td>
                <td className="px-4 py-3 text-center text-slate-400 tabular-nums">
                  {signal.confidence}
                </td>
                <td className="px-4 py-3 text-center text-slate-400 tabular-nums">
                  {signal.rs_rating}
                </td>
                <td className="px-4 py-3 text-center text-slate-400 tabular-nums">
                  {signal.rvol != null ? `${signal.rvol.toFixed(1)}x` : "—"}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap font-medium ${outcome.color}`}>
                  {outcome.text}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function NearSignalsTable({ signals }: { signals: NearSignal[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-900 text-xs uppercase text-slate-400 border-b border-slate-800">
          <tr>
            <th className="px-4 py-3">Ticker</th>
            <th className="px-4 py-3">Strategy</th>
            <th className="px-4 py-3 text-right">Entry Trigger</th>
            <th className="px-4 py-3 text-right">Stop</th>
            <th className="px-4 py-3 text-center">Conf</th>
            <th className="px-4 py-3 text-center">RS</th>
            <th className="px-4 py-3">Rationale</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {signals.map((signal) => (
            <tr
              key={`${signal.ticker}-${signal.strategy}`}
              className="bg-slate-950 hover:bg-slate-900/70 transition-colors"
            >
              <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                {signal.ticker}
              </td>
              <td className="px-4 py-3 text-slate-400 capitalize whitespace-nowrap">
                {signal.strategy.replace(/_/g, " ")}
              </td>
              <td className="px-4 py-3 text-right text-slate-200 tabular-nums">
                ${signal.entry_trigger.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right text-slate-200 tabular-nums">
                ${signal.stop.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-center text-slate-400 tabular-nums">
                {signal.confidence}
              </td>
              <td className="px-4 py-3 text-center text-slate-400 tabular-nums">
                {signal.rs_rating}
              </td>
              <td className="px-4 py-3 text-slate-400 text-xs max-w-xs">
                {signal.rationale.length > 0
                  ? signal.rationale.join("; ")
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
              <ActiveSignalsTable signals={entry.active} />
            </section>
          )}

          {/* Near signals */}
          {entry.near.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">
                Near Setups
              </h2>
              <NearSignalsTable signals={entry.near} />
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
