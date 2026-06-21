"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BacktestEntry {
  ticker: string;
  strategy: string;
  return: number;
  benchmark: number;
  win_rate: number;
  trades: number;
  max_drawdown: number;
  sharpe: number;
  last_tuned_at: string;
}

interface BacktestManifest {
  generated_at: string;
  entries: BacktestEntry[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SortField =
  | "ticker"
  | "return"
  | "win_rate"
  | "trades"
  | "max_drawdown"
  | "sharpe"
  | "last_tuned_at";

type SortDirection = "asc" | "desc";

const PAGE_SIZE = 25;

function formatReturn(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatWinRate(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

function formatMaxDrawdown(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatSharpe(value: number): string {
  return value.toFixed(2);
}

function formatTunedDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getSortValue(entry: BacktestEntry, field: SortField): string | number {
  switch (field) {
    case "ticker":
      return entry.ticker;
    case "return":
      return entry.return;
    case "win_rate":
      return entry.win_rate;
    case "trades":
      return entry.trades;
    case "max_drawdown":
      return entry.max_drawdown;
    case "sharpe":
      return entry.sharpe;
    case "last_tuned_at":
      return new Date(entry.last_tuned_at).getTime();
    default:
      return 0;
  }
}

/**
 * Compute which page numbers to display with ellipsis logic.
 * Shows first page, last page, and a window of ±2 around current page.
 * Returns an array of page numbers and null (representing ellipsis).
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | null)[] = [];
  const windowStart = Math.max(2, currentPage - 2);
  const windowEnd = Math.min(totalPages - 1, currentPage + 2);

  pages.push(1);

  if (windowStart > 2) {
    pages.push(null); // ellipsis
  }

  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  if (windowEnd < totalPages - 1) {
    pages.push(null); // ellipsis
  }

  pages.push(totalPages);

  return pages;
}

// ---------------------------------------------------------------------------
// API URL
// ---------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_RAILWAY_API_URL || "";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BacktestSummary() {
  const router = useRouter();
  const [data, setData] = useState<BacktestManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("return");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchBacktests() {
      try {
        const res = await fetch(`${API_URL}/api/backtests`);
        if (res.status === 503) {
          setError("unavailable");
          return;
        }
        if (!res.ok) {
          setError("fetch");
          return;
        }
        const json: BacktestManifest = await res.json();
        setData(json);
      } catch {
        setError("fetch");
      } finally {
        setLoading(false);
      }
    }

    fetchBacktests();
  }, []);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setPage(1);
  }

  function handleRowClick(ticker: string) {
    router.push(`/backtests/${ticker}`);
  }

  // Deduplicate: keep only the best entry (highest return) per ticker
  const deduplicatedEntries = data
    ? Object.values(
        data.entries.reduce<Record<string, BacktestEntry>>((acc, entry) => {
          if (!acc[entry.ticker] || entry.return > acc[entry.ticker].return) {
            acc[entry.ticker] = entry;
          }
          return acc;
        }, {})
      )
    : [];

  // Sort entries
  const sortedEntries = [...deduplicatedEntries].sort((a, b) => {
        const aVal = getSortValue(a, sortField);
        const bVal = getSortValue(b, sortField);

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        const aNum = aVal as number;
        const bNum = bVal as number;
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      });

  // Pagination
  const totalPages = Math.ceil(sortedEntries.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, sortedEntries.length);
  const paginatedEntries = sortedEntries.slice(startIndex, endIndex);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 w-64 bg-slate-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-800/50 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error: unavailable (503)
  if (error === "unavailable") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-6">📊</p>
          <h1 className="text-2xl font-bold text-white mb-4">
            Backtest Data Not Yet Available
          </h1>
          <p className="text-slate-400 text-lg">
            Backtest data will be available after the next weekly tune. Check back
            after Sunday.
          </p>
        </div>
      </div>
    );
  }

  // Error: fetch failure
  if (error === "fetch") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-6">⚠️</p>
          <h1 className="text-2xl font-bold text-white mb-4">
            Failed to Load Data
          </h1>
          <p className="text-slate-400 text-lg">
            Something went wrong loading backtest data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.entries.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-6">📭</p>
          <h1 className="text-2xl font-bold text-white mb-4">
            No Backtest Data Available
          </h1>
          <p className="text-slate-400 text-lg">
            No backtest results have been generated yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Backtest Results</h1>
          <p className="text-slate-400 mt-2 max-w-3xl text-sm leading-relaxed">
            These results use <span className="text-slate-200">walk-forward validation</span>: we take 5 years of price data, train the strategy on the first 70% (~3.5 years), then test it on the remaining 30% (~1.5 years) that it never saw during training. The numbers below are from that unseen test period only — no overfitting, no cherry-picking.
          </p>
          {data.generated_at && (
            <p className="text-xs text-slate-500 mt-1">
              Last updated:{" "}
              {new Date(data.generated_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Summary Stats */}
        {deduplicatedEntries.length > 0 && (
          <SummaryStats entries={deduplicatedEntries} />
        )}

        {/* Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <SortableHeader
                    label="Ticker"
                    field="ticker"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="Return"
                    field="return"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="Win Rate"
                    field="win_rate"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="Trades"
                    field="trades"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="Max DD"
                    field="max_drawdown"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="Sharpe"
                    field="sharpe"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="Tuned"
                    field="last_tuned_at"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {paginatedEntries.map((entry) => {
                  return (
                    <tr
                      key={entry.ticker}
                      onClick={() => handleRowClick(entry.ticker)}
                      className="border-b border-slate-800/50 hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                        {entry.ticker}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium whitespace-nowrap ${
                          entry.return >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {formatReturn(entry.return)}
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                        {formatWinRate(entry.win_rate)}
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                        {entry.trades}
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                        {formatMaxDrawdown(entry.max_drawdown)}
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                        {formatSharpe(entry.sharpe)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatTunedDate(entry.last_tuned_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
              <p className="text-sm text-slate-400">
                Showing {startIndex + 1}–{endIndex} of {sortedEntries.length}
              </p>
              <div className="flex items-center gap-1">
                {/* Previous button */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 text-sm rounded text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  ←
                </button>

                {/* Page numbers */}
                {getPageNumbers(page, totalPages).map((pageNum, idx) =>
                  pageNum === null ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-slate-500">
                      …
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        pageNum === page
                          ? "bg-indigo-600 text-white"
                          : "text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                {/* Next button */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 text-sm rounded text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary Stats Component
// ---------------------------------------------------------------------------

function SummaryStats({ entries }: { entries: BacktestEntry[] }) {
  const stats = useMemo(() => {
    const count = entries.length;
    const avgReturn = entries.reduce((s, e) => s + e.return, 0) / (count || 1);
    const avgWinRate = entries.reduce((s, e) => s + e.win_rate, 0) / (count || 1);
    const totalTrades = entries.reduce((s, e) => s + e.trades, 0);
    const avgMaxDD = entries.reduce((s, e) => s + e.max_drawdown, 0) / (count || 1);
    const avgSharpe = entries.reduce((s, e) => s + e.sharpe, 0) / (count || 1);
    return { count, avgReturn, avgWinRate, totalTrades, avgMaxDD, avgSharpe };
  }, [entries]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
        <p className="text-xs text-slate-500 mb-1">Avg Return</p>
        <p
          className={`text-lg font-bold ${
            stats.avgReturn >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {stats.avgReturn >= 0 ? "+" : ""}
          {stats.avgReturn.toFixed(1)}%
        </p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
        <p className="text-xs text-slate-500 mb-1">Avg Win Rate</p>
        <p className="text-lg font-bold text-white">
          {(stats.avgWinRate * 100).toFixed(0)}%
        </p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
        <p className="text-xs text-slate-500 mb-1">Total Trades</p>
        <p className="text-lg font-bold text-white">{stats.totalTrades}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
        <p className="text-xs text-slate-500 mb-1">Avg Max DD</p>
        <p className="text-lg font-bold text-white">
          {stats.avgMaxDD.toFixed(1)}%
        </p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
        <p className="text-xs text-slate-500 mb-1">Avg Sharpe</p>
        <p className="text-lg font-bold text-white">
          {stats.avgSharpe.toFixed(2)}
        </p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
        <p className="text-xs text-slate-500 mb-1">Tickers</p>
        <p className="text-lg font-bold text-white">{stats.count}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable Header Component
// ---------------------------------------------------------------------------

function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onClick,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onClick: (field: SortField) => void;
}) {
  const isActive = currentField === field;

  return (
    <th
      onClick={() => onClick(field)}
      className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && (
          <span className="text-indigo-400">
            {direction === "asc" ? "↑" : "↓"}
          </span>
        )}
      </span>
    </th>
  );
}
