"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PortfolioStats {
  total_trades: number;
  open_count: number;
  closed_trades: number;
  win_rate: number;
  wins: number;
  losses: number;
  expired: number;
  avg_r_multiple: number;
  total_pnl: number;
  expectancy: number;
}

interface OpenPosition {
  ticker: string;
  strategy: string;
  signal_date: string;
  entry_price: number;
  stop_price: number;
  target_price: number;
  current_price: number | null;
  pnl_pct: number | null;
  days_held: number;
  target_progress: number | null;
}

interface ClosedTrade {
  ticker: string;
  strategy: string;
  signal_date: string;
  entry_price: number;
  stop_price: number;
  target_price: number;
  outcome: "won" | "lost" | "expired";
  outcome_date: string;
  outcome_price: number | null;
  pnl_pct: number;
}

interface PortfolioData {
  confidence_threshold: number;
  stats: PortfolioStats;
  openPositions: OpenPosition[];
  closedTrades: ClosedTrade[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatStrategy(strategy: string): string {
  return strategy
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function pnlColor(pnl: number | null): string {
  if (pnl === null) return "text-zinc-400";
  return pnl >= 0 ? "text-emerald-400" : "text-red-400";
}

function outcomeBadge(outcome: string) {
  switch (outcome) {
    case "won":
      return (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/50 text-emerald-300">
          Won
        </span>
      );
    case "lost":
      return (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-300">
          Lost
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300">
          Expired
        </span>
      );
  }
}

// ---------------------------------------------------------------------------
// StatsCards
// ---------------------------------------------------------------------------

function StatsCards({ stats }: { stats: PortfolioStats }) {
  const pnlPositive = stats.total_pnl >= 0;
  const winRateGood = stats.win_rate >= 0.5;
  const avgRGood = stats.avg_r_multiple > 1;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      <StatCard
        label="Total P&L"
        value={`${pnlPositive ? "+" : "-"}$${Math.abs(stats.total_pnl).toFixed(0)}`}
        color={pnlPositive ? "text-emerald-400" : "text-red-400"}
      />
      <StatCard
        label="Win Rate"
        value={`${Math.round(stats.win_rate * 100)}%`}
        color={winRateGood ? "text-emerald-400" : "text-red-400"}
        sub={`${stats.wins}W / ${stats.losses}L`}
      />
      <StatCard
        label="Total Trades"
        value={`${stats.closed_trades}`}
        color="text-zinc-100"
        sub={`${stats.open_count} open`}
      />
      <StatCard
        label="Avg R-Multiple"
        value={stats.avg_r_multiple.toFixed(2)}
        color={avgRGood ? "text-emerald-400" : "text-red-400"}
      />
      <StatCard
        label="Expectancy"
        value={`$${stats.expectancy.toFixed(0)}`}
        color={stats.expectancy >= 0 ? "text-emerald-400" : "text-red-400"}
        sub="per trade"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-4 text-center">
      <div className="text-xs text-zinc-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OpenPositionsTable
// ---------------------------------------------------------------------------

function OpenPositionsTable({ positions }: { positions: OpenPosition[] }) {
  if (positions.length === 0) {
    return (
      <div className="text-zinc-500 text-sm py-4">No open positions.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-400 text-xs border-b border-zinc-700/50">
            <th className="text-left py-2 px-2">Ticker</th>
            <th className="text-left py-2 px-2">Strategy</th>
            <th className="text-right py-2 px-2">Entry</th>
            <th className="text-right py-2 px-2">Current</th>
            <th className="text-right py-2 px-2">P&L</th>
            <th className="text-right py-2 px-2">Days</th>
            <th className="text-right py-2 px-2">Progress</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr
              key={`${pos.ticker}-${pos.signal_date}`}
              className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
            >
              <td className="py-2 px-2 font-medium text-zinc-100">
                {pos.ticker}
              </td>
              <td className="py-2 px-2 text-zinc-400">
                {formatStrategy(pos.strategy)}
              </td>
              <td className="py-2 px-2 text-right text-zinc-300">
                ${pos.entry_price.toFixed(2)}
              </td>
              <td className="py-2 px-2 text-right text-zinc-300">
                {pos.current_price != null
                  ? `$${pos.current_price.toFixed(2)}`
                  : "—"}
              </td>
              <td
                className={`py-2 px-2 text-right font-medium ${pnlColor(pos.pnl_pct)}`}
              >
                {pos.pnl_pct != null
                  ? `${pos.pnl_pct >= 0 ? "+" : ""}${pos.pnl_pct.toFixed(1)}%`
                  : "—"}
              </td>
              <td className="py-2 px-2 text-right text-zinc-400">
                {pos.days_held}d
              </td>
              <td className="py-2 px-2 text-right text-zinc-400">
                {pos.target_progress != null
                  ? `${Math.round(pos.target_progress)}%`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TradeHistoryTable
// ---------------------------------------------------------------------------

function TradeHistoryTable({ trades }: { trades: ClosedTrade[] }) {
  const [showCount, setShowCount] = useState(50);

  if (trades.length === 0) {
    return (
      <div className="text-zinc-500 text-sm py-4">
        No trades have been closed yet.
      </div>
    );
  }

  const visible = trades.slice(0, showCount);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-400 text-xs border-b border-zinc-700/50">
              <th className="text-left py-2 px-2">Ticker</th>
              <th className="text-left py-2 px-2">Strategy</th>
              <th className="text-right py-2 px-2">Entry</th>
              <th className="text-right py-2 px-2">Exit</th>
              <th className="text-right py-2 px-2">P&L</th>
              <th className="text-center py-2 px-2">Outcome</th>
              <th className="text-right py-2 px-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((trade, i) => (
              <tr
                key={`${trade.ticker}-${trade.outcome_date}-${i}`}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
              >
                <td className="py-2 px-2 font-medium text-zinc-100">
                  {trade.ticker}
                </td>
                <td className="py-2 px-2 text-zinc-400">
                  {formatStrategy(trade.strategy)}
                </td>
                <td className="py-2 px-2 text-right text-zinc-300">
                  ${trade.entry_price.toFixed(2)}
                </td>
                <td className="py-2 px-2 text-right text-zinc-300">
                  {trade.outcome_price != null
                    ? `$${trade.outcome_price.toFixed(2)}`
                    : trade.outcome === "won"
                      ? `$${trade.target_price.toFixed(2)}`
                      : `$${trade.stop_price.toFixed(2)}`}
                </td>
                <td
                  className={`py-2 px-2 text-right font-medium ${pnlColor(trade.pnl_pct)}`}
                >
                  {trade.pnl_pct >= 0 ? "+" : ""}
                  {trade.pnl_pct.toFixed(1)}%
                </td>
                <td className="py-2 px-2 text-center">
                  {outcomeBadge(trade.outcome)}
                </td>
                <td className="py-2 px-2 text-right text-zinc-400">
                  {formatDate(trade.outcome_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {trades.length > showCount && (
        <button
          onClick={() => setShowCount((c) => c + 50)}
          className="mt-4 px-4 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors"
        >
          Show more ({trades.length - showCount} remaining)
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function PortfolioContent() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_RAILWAY_API_URL;
    fetch(`${apiUrl}/api/portfolio`)
      .then((res) => {
        if (res.status === 503) throw new Error("Portfolio data not yet available. Check back after the first daily scan.");
        if (!res.ok) throw new Error("Failed to load portfolio data.");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-800 rounded w-64" />
          <div className="grid grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-zinc-800 rounded" />
            ))}
          </div>
          <div className="h-64 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-zinc-100 mb-4">
          Auto-Portfolio
        </h1>
        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-6 text-zinc-400">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Auto-Portfolio</h1>
        <p className="text-zinc-400 mt-1">
          Every signal with{" "}
          <span className="text-zinc-200 font-medium">
            ≥{Math.round(data.confidence_threshold * 100)}% confidence
          </span>{" "}
          is entered automatically. No cherry-picking. Full transparency.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={data.stats} />

      {/* Open Positions */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-200 mb-3">
          Open Positions ({data.openPositions.length})
        </h2>
        <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-4">
          <OpenPositionsTable positions={data.openPositions} />
        </div>
      </section>

      {/* Trade History */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-200 mb-3">
          Trade History ({data.closedTrades.length} closed)
        </h2>
        <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-4">
          <TradeHistoryTable trades={data.closedTrades} />
        </div>
      </section>
    </div>
  );
}
