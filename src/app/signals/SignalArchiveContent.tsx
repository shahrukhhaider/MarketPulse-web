"use client";

import { useEffect, useState, useCallback, Fragment, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  closedDate: string | null;
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
  const router = useRouter();

  if (dates.length === 0) return null;

  const handleChange = (date: string) => {
    onSelect(date);
    router.push(`/signals/${date}`);
  };

  return (
    <div className="flex items-center gap-2 mb-6">
      <label htmlFor="archive-date-select" className="text-sm text-slate-400">
        Scan Date:
      </label>
      <select
        id="archive-date-select"
        value={selectedDate ?? ""}
        onChange={(e) => handleChange(e.target.value)}
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

function MarketContextBanner({
  context,
  signals,
}: {
  context: MarketContext | null;
  signals: ActiveSignal[];
}) {
  if (!context || !context.market_mood) return null;

  const moodColor =
    context.market_mood === "bullish"
      ? "text-green-400"
      : context.market_mood === "bearish"
        ? "text-red-400"
        : "text-yellow-400";

  // Compute trade summary from signals
  const openCount = signals.filter((s) => s.outcome === "open").length;
  const closedCount = signals.filter(
    (s) => s.outcome === "target_hit" || s.outcome === "stopped_out"
  ).length;
  const closedSignals = signals.filter(
    (s) =>
      s.pnlPct != null &&
      (s.outcome === "target_hit" || s.outcome === "stopped_out")
  );
  const openSignals = signals.filter(
    (s) => s.pnlPct != null && s.outcome === "open"
  );
  const realizedPnl =
    closedSignals.length > 0
      ? closedSignals.reduce((sum, s) => sum + (s.pnlPct ?? 0), 0) /
        closedSignals.length
      : null;
  const unrealizedPnl =
    openSignals.length > 0
      ? openSignals.reduce((sum, s) => sum + (s.pnlPct ?? 0), 0) /
        openSignals.length
      : null;

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
        {signals.length > 0 && (
          <>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              {openCount} open · {closedCount} closed
            </span>
            {realizedPnl != null && (
              <span
                className={`font-medium ${realizedPnl >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                Realized: {realizedPnl >= 0 ? "+" : ""}
                {realizedPnl.toFixed(2)}%
              </span>
            )}
            {unrealizedPnl != null && (
              <span
                className={`font-medium ${unrealizedPnl >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                Unrealized: {unrealizedPnl >= 0 ? "+" : ""}
                {unrealizedPnl.toFixed(2)}%
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const COLUMN_TOOLTIPS: Record<string, string> = {
  Entry: "Price level to enter the trade",
  Stop: "Price level to exit at a loss (stop-loss)",
  Target: "Price level to exit at a profit",
  Current: "Latest closing price from market data",
  "P&L": "Profit or loss percentage from entry. Realized for closed trades, unrealized for open.",
  R: "Risk/Reward ratio — how many R (risk units) the target represents",
  Conf: "Model confidence score — higher means stronger signal alignment",
  RS: "Relative Strength rating vs. the market (0–99)",
  RVOL: "Relative Volume — today's volume vs. 20-day average. Above 1x = unusual activity.",
  Outcome: "Trade result: target hit, stopped out, or still open",
};

function HeaderWithTooltip({ label }: { label: string }) {
  const tooltip = COLUMN_TOOLTIPS[label];
  if (!tooltip) return <>{label}</>;

  return (
    <span className="inline-flex items-center gap-1 group/tip relative">
      {label}
      <span className="text-slate-600 group-hover/tip:text-slate-400 cursor-help text-[10px]">
        ⓘ
      </span>
      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 rounded bg-slate-700 text-xs text-slate-200 normal-case tracking-normal whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-[100] shadow-lg">
        {tooltip}
      </span>
    </span>
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

function ActiveSignalsTable({ signals, scanDate }: { signals: ActiveSignal[]; scanDate: string }) {
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
        header: () => <HeaderWithTooltip label="Entry" />,
        cell: (info) => `$${info.getValue().toFixed(2)}`,
        meta: { align: "right" },
      }),
      activeColumnHelper.accessor("stop", {
        header: () => <HeaderWithTooltip label="Stop" />,
        cell: (info) => `$${info.getValue().toFixed(2)}`,
        meta: { align: "right" },
      }),
      activeColumnHelper.accessor("target", {
        header: () => <HeaderWithTooltip label="Target" />,
        cell: (info) => `$${info.getValue().toFixed(2)}`,
        meta: { align: "right" },
      }),
      activeColumnHelper.accessor("currentPrice", {
        header: () => <HeaderWithTooltip label="Current" />,
        cell: (info) => {
          const v = info.getValue();
          return v != null ? `$${v.toFixed(2)}` : "—";
        },
        meta: { align: "right" },
      }),
      activeColumnHelper.accessor("pnlPct", {
        header: () => <HeaderWithTooltip label="P&L" />,
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
        header: () => <HeaderWithTooltip label="R" />,
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
        header: () => <HeaderWithTooltip label="Conf" />,
        cell: (info) => `${Math.round(info.getValue() * 100)}%`,
        meta: { align: "center" },
      }),
      activeColumnHelper.accessor("rs_rating", {
        header: () => <HeaderWithTooltip label="RS" />,
        meta: { align: "center" },
      }),
      activeColumnHelper.accessor("rvol", {
        header: () => <HeaderWithTooltip label="RVOL" />,
        cell: (info) => {
          const v = info.getValue();
          return v != null ? `${v.toFixed(1)}x` : "—";
        },
        meta: { align: "center" },
      }),
      activeColumnHelper.accessor("outcome", {
        header: () => <HeaderWithTooltip label="Outcome" />,
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
                    <ExpandedActiveDetail signal={row.original} scanDate={scanDate} />
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

function ExpandedActiveDetail({ signal, scanDate }: { signal: ActiveSignal; scanDate: string }) {
  const riskDistance = Math.abs(signal.entry - signal.stop);
  const rewardDistance = Math.abs(signal.target - signal.entry);
  const rMultiple =
    signal.outcome !== "pending" && riskDistance > 0
      ? (rewardDistance / riskDistance).toFixed(1)
      : null;

  // Compute days held: from scan date to close date (closed) or today (open)
  const scanDateMs = new Date(scanDate + "T00:00:00").getTime();
  let daysHeld: number | null = null;
  if (signal.outcome === "open") {
    daysHeld = Math.max(0, Math.round((Date.now() - scanDateMs) / (1000 * 60 * 60 * 24)));
  } else if (signal.closedDate) {
    const closedMs = new Date(signal.closedDate + "T00:00:00").getTime();
    daysHeld = Math.max(0, Math.round((closedMs - scanDateMs) / (1000 * 60 * 60 * 24)));
  }

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
          {(signal.outcome === "target_hit" || signal.outcome === "stopped_out" || signal.outcome === "open") && daysHeld != null && (
            <p>
              Days Held: <span className="text-slate-200 font-medium">{daysHeld}</span>
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
        header: () => <HeaderWithTooltip label="Stop" />,
        cell: (info) => `$${info.getValue().toFixed(2)}`,
        meta: { align: "right" },
      }),
      nearColumnHelper.accessor("confidence", {
        header: () => <HeaderWithTooltip label="Conf" />,
        cell: (info) => `${Math.round(info.getValue() * 100)}%`,
        meta: { align: "center" },
      }),
      nearColumnHelper.accessor("rs_rating", {
        header: () => <HeaderWithTooltip label="RS" />,
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

export default function SignalArchiveContent({ initialDate }: { initialDate?: string }) {
  const router = useRouter();
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate ?? null);
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

  // On mount: fetch available dates, auto-select based on initialDate or redirect to most recent
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
            // If initialDate is provided and valid, use it
            if (initialDate && dateList.includes(initialDate)) {
              setSelectedDate(initialDate);
              await fetchSignalsForDate(initialDate);
            } else if (initialDate && !dateList.includes(initialDate)) {
              // Invalid date — redirect to most recent
              const mostRecent = dateList[0];
              setSelectedDate(mostRecent);
              router.replace(`/signals/${mostRecent}`);
              await fetchSignalsForDate(mostRecent);
            } else {
              // No initialDate (bare /signals) — redirect to most recent
              const mostRecent = dateList[0];
              setSelectedDate(mostRecent);
              router.replace(`/signals/${mostRecent}`);
              await fetchSignalsForDate(mostRecent);
            }
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
  }, [fetchSignalsForDate, initialDate, router]);

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
          <MarketContextBanner context={entry.market_context} signals={entry.active} />

          {/* Active signals */}
          {entry.active.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">
                Active Opportunities
              </h2>
              <ActiveSignalsTable signals={entry.active} scanDate={entry.date} />
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
