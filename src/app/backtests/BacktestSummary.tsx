"use client";

import { useEffect, useState } from "react";
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
  | "strategy"
  | "return"
  | "vs_benchmark"
  | "win_rate"
  | "trades"
  | "max_drawdown"
  | "sharpe"
  | "last_tuned_at";

type SortDirection = "asc" | "desc";

function formatStrategy(strategy: string): string {
  return strategy
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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
    case "strategy":
      return entry.strategy;
    case "return":
      return entry.return;
    case "vs_benchmark":
      return entry.return - entry.benchmark;
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
  }

  function handleRowClick(ticker: string) {
    router.push(`/backtests/${ticker}`);
  }

  // Sort entries
  const sortedEntries = data
    ? [...data.entries].sort((a, b) => {
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
      })
    : [];

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
          <p className="text-slate-400 mt-2">
            Walk-forward validated strategy performance across all tickers.
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
                    label="Strategy"
                    field="strategy"
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
                    label="vs Bench"
                    field="vs_benchmark"
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
                {sortedEntries.map((entry, idx) => {
                  const vsBenchmark = entry.return - entry.benchmark;
                  return (
                    <tr
                      key={`${entry.ticker}-${entry.strategy}-${idx}`}
                      onClick={() => handleRowClick(entry.ticker)}
                      className="border-b border-slate-800/50 hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                        {entry.ticker}
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                        {formatStrategy(entry.strategy)}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium whitespace-nowrap ${
                          entry.return >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {formatReturn(entry.return)}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap ${
                          vsBenchmark >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {formatReturn(vsBenchmark)}
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
        </div>
      </main>
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
