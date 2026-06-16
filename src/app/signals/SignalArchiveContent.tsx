"use client";

import { useEffect, useState, useCallback, Fragment, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ExpandedState,
  type SortingState,
} from "@tanstack/react-table";

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
  chartUrl: string | null;
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

// ---------------------------------------------------------------------------
// Active Signals Table (TanStack Table with expandable rows)
// ---------------------------------------------------------------------------

const activeColumnHelper = createColumnHelper<ActiveSignal>();

function ActiveSignalsTable({ signals }: { signals: ActiveSignal[] }) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "confidence", desc: true },
  ]);

  const columns = useMemo(
    () => [
      activeColumnHelper.display({
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
          <button
            onClick={row.getToggleExpandedHandler()}
            className="text-slate-500 text-xs p-1"
            aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
          >
            <span
              className={`inline-block transition-transform duration-150 ${
                row.getIsExpanded() ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
          </button>
        ),
        size: 32,
      }),
      activeColumnHelper.accessor("ticker", {
        header: "Ticker",
        cell: (info) => (
          <span className="font-semibold text-white">{info.getValue()}</span>
        ),
      }),
      activeColumnHelper.accessor("strategy", {
        header: "Strategy",
        cell: (info) => (
          <span className="text-slate-400 capitalize">
            {info.getValue().replace(/_/g, " ")}
          </span>
        ),
      }),
      activeColumnHelper.accessor("entry", {
        header: "Entry",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
        meta: { align: "right" },
      }),
      activeColumnHelper.accessor("stop", {
        header: "Stop",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
        meta: { align: "right" },
      }),
      activeColumnHelper.accessor("target", {
        header: "Target",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
        meta: { align: "right" },
      }),
      activeColumnHelper.accessor("currentPrice", {
        header: "Current",
        cell: (info) => {
          const v = info.getValue();
          return v != null ? `$${v.toFixed(2)}` : "—";
        },
        meta: { align: "right" },
      }),
      activeColumnHelper.accessor("pnlPct", {
        header: "P&L",
        cell: (info) => {
          const v = info.getValue();
          if (v == null) return <span className="text-slate-600">—</span>;
          const color = v > 0 ? "text-green-400" : "text-red-400";
          return (
            <span className={`font-medium ${color}`}>
              {v >= 0 ? "+" : ""}
              {v.toFixed(2)}%
            </span>
          );
        },
        meta: { align: "right" },
      }),
      activeColumnHelper.display({
        id: "rMultiple",
        header: "R",
        cell: ({ row }) => {
          const s = row.original;
          const risk = Math.abs(s.entry - s.stop);
          const reward = Math.abs(s.target - s.entry);
          if (s.outcome === "pending" || risk === 0) return "—";
          return (reward / risk).toFixed(1);
        },
        meta: { align: "center" },
      }),
      activeColumnHelper.accessor("confidence", {
        header: "Conf",
        cell: (info) => `${Math.round(info.getValue() * 100)}%`,
        meta: { align: "center" },
      }),
      activeColumnHelper.accessor("rs_rating", {
        header: "RS",
        meta: { align: "center" },
      }),
      activeColumnHelper.accessor("rvol", {
        header: "RVOL",
        cell: (info) => {
          const v = info.getValue();
          return v != null ? `${v.toFixed(1)}x` : "—";
        },
        meta: { align: "center" },
      }),
      activeColumnHelper.accessor("outcome", {
        header: "Outcome",
        cell: (info) => {
          const o = OUTCOME_MAP[info.getValue()];
          return <span className={`font-medium ${o.color}`}>{o.text}</span>;
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: signals,
    columns,
    state: { expanded, sorting },
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowCanExpand: () => true,
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-900 text-xs uppercase text-slate-400 border-b border-slate-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const align = (header.column.columnDef.meta as { align?: string })?.align;
                return (
                  <th
                    key={header.id}
                    className={`px-4 py-3 ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""} ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-slate-200" : ""}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" && " ↑"}
                    {header.column.getIsSorted() === "desc" && " ↓"}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <tr
                className="bg-slate-950 hover:bg-slate-900/70 transition-colors cursor-pointer border-b border-slate-800/50"
                onClick={row.getToggleExpandedHandler()}
              >
                {row.getVisibleCells().map((cell) => {
                  const align = (cell.column.columnDef.meta as { align?: string })?.align;
                  return (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 tabular-nums whitespace-nowrap ${align === "right" ? "text-right text-slate-200" : align === "center" ? "text-center text-slate-400" : ""}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
              {row.getIsExpanded() && (
                <tr className="bg-slate-900/50 border-b border-slate-800/50">
                  <td colSpan={row.getVisibleCells().length} className="px-8 py-4">
                    <ExpandedActiveDetail signal={row.original} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignalChartImage({
  chartUrl,
  ticker,
  strategy,
}: {
  chartUrl: string;
  ticker: string;
  strategy: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const src = `${API_URL}${chartUrl}`;
  const alt = `Opportunity chart for ${ticker.toUpperCase()} ${strategy.replace(/_/g, " ")}`;

  if (errored) return null;

  return (
    <div className="w-full" style={{ minHeight: loaded ? "auto" : "300px" }}>
      <img
        src={src}
        alt={alt}
        className="w-full max-h-[400px] object-contain rounded-lg"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        style={{ display: loaded ? "block" : "none" }}
      />
      {!loaded && (
        <div className="w-full h-[300px] bg-slate-800/50 rounded-lg animate-pulse" />
      )}
    </div>
  );
}

function ExpandedActiveDetail({ signal }: { signal: ActiveSignal }) {
  const riskDistance = Math.abs(signal.entry - signal.stop);
  const rewardDistance = Math.abs(signal.target - signal.entry);
  const rMultiple =
    signal.outcome !== "pending" && riskDistance > 0
      ? (rewardDistance / riskDistance).toFixed(1)
      : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
      {signal.chartUrl && (
        <div className="col-span-full mb-4">
          <SignalChartImage
            chartUrl={signal.chartUrl}
            ticker={signal.ticker}
            strategy={signal.strategy}
          />
        </div>
      )}
      <div>
        <span className="text-slate-500 uppercase tracking-wide font-medium block mb-2">
          Exit Price Detail
        </span>
        <div className="space-y-1.5 text-slate-300">
          <p>
            Stop Loss:{" "}
            <span className="text-red-400 font-medium">${signal.stop.toFixed(2)}</span>
            <span className="text-slate-500 ml-1">
              ({riskDistance > 0 ? `-${((riskDistance / signal.entry) * 100).toFixed(1)}%` : "—"} from entry)
            </span>
          </p>
          <p>
            Target:{" "}
            <span className="text-green-400 font-medium">${signal.target.toFixed(2)}</span>
            <span className="text-slate-500 ml-1">
              ({rewardDistance > 0 ? `+${((rewardDistance / signal.entry) * 100).toFixed(1)}%` : "—"} from entry)
            </span>
          </p>
          {rMultiple && (
            <p>
              Risk/Reward: <span className="text-blue-400 font-medium">{rMultiple}R</span>
            </p>
          )}
        </div>
      </div>
      {signal.rationale.length > 0 && (
        <div>
          <span className="text-slate-500 uppercase tracking-wide font-medium block mb-2">
            Rationale
          </span>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            {signal.rationale.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Near Signals Table (TanStack Table with expandable rows)
// ---------------------------------------------------------------------------

const nearColumnHelper = createColumnHelper<NearSignal>();

function NearSignalsTable({ signals }: { signals: NearSignal[] }) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "confidence", desc: true },
  ]);

  const columns = useMemo(
    () => [
      nearColumnHelper.display({
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
          <button
            onClick={row.getToggleExpandedHandler()}
            className="text-slate-500 text-xs p-1"
            aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
          >
            <span
              className={`inline-block transition-transform duration-150 ${
                row.getIsExpanded() ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
          </button>
        ),
        size: 32,
      }),
      nearColumnHelper.accessor("ticker", {
        header: "Ticker",
        cell: (info) => (
          <span className="font-semibold text-white">{info.getValue()}</span>
        ),
      }),
      nearColumnHelper.accessor("strategy", {
        header: "Strategy",
        cell: (info) => (
          <span className="text-slate-400 capitalize">
            {info.getValue().replace(/_/g, " ")}
          </span>
        ),
      }),
      nearColumnHelper.accessor("entry_trigger", {
        header: "Entry Trigger",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
        meta: { align: "right" },
      }),
      nearColumnHelper.accessor("stop", {
        header: "Stop",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
        meta: { align: "right" },
      }),
      nearColumnHelper.accessor("confidence", {
        header: "Conf",
        cell: (info) => `${Math.round(info.getValue() * 100)}%`,
        meta: { align: "center" },
      }),
      nearColumnHelper.accessor("rs_rating", {
        header: "RS",
        meta: { align: "center" },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: signals,
    columns,
    state: { expanded, sorting },
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowCanExpand: () => true,
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-900 text-xs uppercase text-slate-400 border-b border-slate-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const align = (header.column.columnDef.meta as { align?: string })?.align;
                return (
                  <th
                    key={header.id}
                    className={`px-4 py-3 ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""} ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-slate-200" : ""}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" && " ↑"}
                    {header.column.getIsSorted() === "desc" && " ↓"}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <tr
                className="bg-slate-950 hover:bg-slate-900/70 transition-colors cursor-pointer border-b border-slate-800/50"
                onClick={row.getToggleExpandedHandler()}
              >
                {row.getVisibleCells().map((cell) => {
                  const align = (cell.column.columnDef.meta as { align?: string })?.align;
                  return (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 tabular-nums whitespace-nowrap ${align === "right" ? "text-right text-slate-200" : align === "center" ? "text-center text-slate-400" : ""}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
              {row.getIsExpanded() && (
                <tr className="bg-slate-900/50 border-b border-slate-800/50">
                  <td colSpan={row.getVisibleCells().length} className="px-8 py-4">
                    <ExpandedNearDetail signal={row.original} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExpandedNearDetail({ signal }: { signal: NearSignal }) {
  return (
    <div className="text-xs">
      {signal.rationale.length > 0 && (
        <div>
          <span className="text-slate-500 uppercase tracking-wide font-medium block mb-2">
            Rationale
          </span>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            {signal.rationale.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-3">
        <span className="text-slate-500 uppercase tracking-wide font-medium block mb-2">
          Entry Detail
        </span>
        <div className="space-y-1 text-slate-300">
          <p>Entry Trigger: <span className="text-blue-400 font-medium">${signal.entry_trigger.toFixed(2)}</span></p>
          <p>Stop: <span className="text-red-400 font-medium">${signal.stop.toFixed(2)}</span></p>
        </div>
      </div>
    </div>
  );
}

function DiscordCTA() {
  if (!DISCORD_URL) return null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 px-6 py-8 mt-10 text-center">
      <h3 className="text-lg font-semibold text-white mb-2">
        Join the Community
      </h3>
      <p className="text-slate-400 text-sm mb-4">
        Join traders discussing opportunities, sharing paper trades, and
        learning together.
      </p>
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join the PaperEdge trading community on Discord"
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
            No Opportunity Data Yet
          </h2>
          <p className="text-slate-400">
            Opportunity scans haven&apos;t been recorded yet. Check back after the
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
          <p className="text-slate-400">Loading opportunity archive...</p>
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
              Unable to load opportunity data. Please try again later.
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
                Active Opportunities
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
                No opportunities were generated on this date.
              </p>
            </div>
          )}

          <DiscordCTA />
        </>
      )}
    </div>
  );
}
