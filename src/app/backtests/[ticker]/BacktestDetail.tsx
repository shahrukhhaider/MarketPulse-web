"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TradeEntry {
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  won: boolean;
}

interface StrategyMetrics {
  return: number;
  win_rate: number;
  trades: number;
  max_drawdown: number;
  sharpe: number;
}

interface StrategyData {
  strategy: string;
  metrics: StrategyMetrics;
  last_tuned_at: string;
  trades: TradeEntry[];
}

interface CombinedMetrics {
  return: number;
  win_rate: number;
  trades: number;
  max_drawdown: number;
  sharpe: number;
  strategy_count: number;
}

interface OHLCBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface BacktestDetailResponse {
  ticker: string;
  combined: CombinedMetrics;
  strategies: StrategyData[];
  ohlc: OHLCBar[];
}

// ---------------------------------------------------------------------------
// Strategy helpers
// ---------------------------------------------------------------------------

const STRATEGY_COLORS: Record<string, string> = {
  trend_pullback: "#42a5f5",
  consolidation_breakout: "#26a69a",
  keltner_mean_reversion: "#ab47bc",
  bear_breakdown: "#ef5350",
  volume_dry_up: "#ffa726",
  post_earnings_drift: "#ffa726",
};

function getStrategyColor(strategy: string): string {
  return STRATEGY_COLORS[strategy] || "#94a3b8";
}

function formatStrategyName(strategy: string): string {
  const names: Record<string, string> = {
    consolidation_breakout: "Consolidation Breakout",
    trend_pullback: "Trend Pullback",
    keltner_mean_reversion: "Keltner Mean Reversion",
    bear_breakdown: "Bear Breakdown",
    volume_dry_up: "Volume Dry-Up",
    post_earnings_drift: "Post-Earnings Drift",
  };
  return names[strategy] ?? strategy.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ---------------------------------------------------------------------------
// Combined Banner
// ---------------------------------------------------------------------------

function CombinedBanner({ combined, ticker }: { combined: CombinedMetrics; ticker: string }) {
  const returnColor = combined.return >= 0 ? "text-green-400" : "text-red-400";
  const returnPrefix = combined.return >= 0 ? "+" : "";

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-5 mb-6">
      <div className="flex items-baseline gap-3 mb-4">
        <h1 className="text-2xl font-bold text-white">{ticker}</h1>
        <span className="text-slate-400 text-sm">
          Combined Strategy Suite · {combined.strategy_count}{" "}
          {combined.strategy_count === 1 ? "strategy" : "strategies"} · OOS walk-forward
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-800/60 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Return</p>
          <p className={`text-xl font-bold ${returnColor}`}>
            {returnPrefix}{combined.return.toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Win Rate</p>
          <p className="text-xl font-bold text-white">
            {Math.round(combined.win_rate * 100)}%
          </p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Trades</p>
          <p className="text-xl font-bold text-white">{combined.trades}</p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Max Drawdown</p>
          <p className="text-xl font-bold text-red-400">
            {combined.max_drawdown.toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Sharpe</p>
          <p className="text-xl font-bold text-white">{combined.sharpe.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Strategy Breakdown Table
// ---------------------------------------------------------------------------

function StrategyBreakdownTable({ strategies }: { strategies: StrategyData[] }) {
  // Show all strategies that have trades; dimmed if negative return
  const visible = strategies.filter((s) => s.metrics.trades > 0);
  if (visible.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Strategy Breakdown
      </h2>
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Trades
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Max DD
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Sharpe
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((strat) => {
                const isPassing = strat.metrics.return >= 0;
                const returnColor = strat.metrics.return >= 0 ? "text-green-400" : "text-red-400";
                const rowClass = isPassing
                  ? "border-b border-slate-800/50"
                  : "border-b border-slate-800/50 opacity-50";

                return (
                  <tr key={strat.strategy} className={rowClass}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getStrategyColor(strat.strategy) }}
                        />
                        <span className={isPassing ? "text-white font-medium" : "text-slate-400"}>
                          {formatStrategyName(strat.strategy)}
                        </span>
                        {!isPassing && (
                          <span className="text-xs text-slate-600 ml-1">excluded</span>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${returnColor}`}>
                      {strat.metrics.return >= 0 ? "+" : ""}
                      {strat.metrics.return.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 whitespace-nowrap">
                      {Math.round(strat.metrics.win_rate * 100)}%
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 whitespace-nowrap">
                      {strat.metrics.trades}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 whitespace-nowrap">
                      {strat.metrics.max_drawdown.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 whitespace-nowrap">
                      {strat.metrics.sharpe.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart zoom helpers
// ---------------------------------------------------------------------------

type ZoomRange = "1M" | "3M" | "6M" | "1Y" | "All";

function getDateRange(range: ZoomRange, data: OHLCBar[]): { from: string; to: string } | null {
  if (data.length === 0) return null;
  const lastDate = data[data.length - 1].time;
  if (range === "All") return { from: data[0].time, to: lastDate };

  const d = new Date(lastDate);
  switch (range) {
    case "1M": d.setMonth(d.getMonth() - 1); break;
    case "3M": d.setMonth(d.getMonth() - 3); break;
    case "6M": d.setMonth(d.getMonth() - 6); break;
    case "1Y": d.setFullYear(d.getFullYear() - 1); break;
  }
  return { from: d.toISOString().slice(0, 10), to: lastDate };
}

// ---------------------------------------------------------------------------
// Candlestick Chart
// ---------------------------------------------------------------------------

function CandlestickChart({
  ohlc,
  strategies,
}: {
  ohlc: OHLCBar[];
  strategies: StrategyData[];
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  const [activeRange, setActiveRange] = useState<ZoomRange>("6M");
  const [chartReady, setChartReady] = useState(false);

  const applyZoom = useCallback(
    (range: ZoomRange) => {
      if (!chartRef.current || ohlc.length === 0) return;
      const dateRange = getDateRange(range, ohlc);
      if (!dateRange) return;
      if (range === "All") {
        chartRef.current.timeScale().fitContent();
      } else {
        chartRef.current.timeScale().setVisibleRange({
          from: dateRange.from as unknown as import("lightweight-charts").Time,
          to: dateRange.to as unknown as import("lightweight-charts").Time,
        });
      }
      setActiveRange(range);
    },
    [ohlc]
  );

  useEffect(() => {
    if (!chartContainerRef.current || ohlc.length === 0) return;
    let disposed = false;

    async function initChart() {
      const { createChart } = await import("lightweight-charts");
      if (disposed || !chartContainerRef.current) return;

      const container = chartContainerRef.current;
      const chart = createChart(container, {
        width: container.clientWidth,
        height: 450,
        layout: { background: { color: "transparent" }, textColor: "#94a3b8" },
        grid: {
          vertLines: { color: "rgba(51, 65, 85, 0.3)" },
          horzLines: { color: "rgba(51, 65, 85, 0.3)" },
        },
        crosshair: {
          vertLine: { color: "#475569", width: 1, style: 3 },
          horzLine: { color: "#475569", width: 1, style: 3 },
        },
        timeScale: { borderColor: "#334155", timeVisible: false },
        rightPriceScale: { borderColor: "#334155" },
      });
      chartRef.current = chart;

      const candleSeries = chart.addCandlestickSeries({
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderUpColor: "#26a69a",
        borderDownColor: "#ef5350",
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });
      candleSeries.setData(
        ohlc.map((bar) => ({
          time: bar.time as unknown as import("lightweight-charts").Time,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        }))
      );

      // Trade markers — all strategies
      const markers: Array<{
        time: import("lightweight-charts").Time;
        position: "aboveBar" | "belowBar";
        color: string;
        shape: "arrowUp" | "arrowDown";
        text: string;
      }> = [];

      for (const strat of strategies) {
        if (strat.metrics.trades === 0) continue;
        const color = getStrategyColor(strat.strategy);
        for (const trade of strat.trades) {
          markers.push({
            time: trade.entry_date as unknown as import("lightweight-charts").Time,
            position: "belowBar",
            color,
            shape: "arrowUp",
            text: formatStrategyName(strat.strategy),
          });
          markers.push({
            time: trade.exit_date as unknown as import("lightweight-charts").Time,
            position: "aboveBar",
            color: trade.won ? color : "#ef5350",
            shape: "arrowDown",
            text: trade.won ? "Win" : "Loss",
          });
        }
      }

      markers.sort((a, b) => (a.time as string).localeCompare(b.time as string));
      candleSeries.setMarkers(markers);

      // Default zoom
      const dateRange = getDateRange("6M", ohlc);
      if (dateRange) {
        chart.timeScale().setVisibleRange({
          from: dateRange.from as unknown as import("lightweight-charts").Time,
          to: dateRange.to as unknown as import("lightweight-charts").Time,
        });
      }

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          chart.applyOptions({ width: entry.contentRect.width });
        }
      });
      resizeObserver.observe(container);
      setChartReady(true);

      return () => {
        disposed = true;
        resizeObserver.disconnect();
        chart.remove();
        chartRef.current = null;
      };
    }

    const cleanup = initChart();
    return () => {
      disposed = true;
      cleanup.then((fn) => fn?.());
    };
  }, [ohlc, strategies]);

  const zoomRanges: ZoomRange[] = ["1M", "3M", "6M", "1Y", "All"];

  return (
    <div>
      {/* Zoom controls */}
      <div className="flex items-center gap-2 mb-3">
        {zoomRanges.map((range) => (
          <button
            key={range}
            onClick={() => applyZoom(range)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeRange === range
                ? "bg-slate-700 text-white"
                : "bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div
        ref={chartContainerRef}
        className="w-full rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden"
        style={{ minHeight: 450 }}
      >
        {!chartReady && ohlc.length > 0 && (
          <div className="flex items-center justify-center h-[450px]">
            <p className="text-slate-500 animate-pulse">Loading chart...</p>
          </div>
        )}
      </div>

      {/* Strategy legend */}
      {strategies.filter((s) => s.metrics.trades > 0).length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
          {strategies
            .filter((s) => s.metrics.trades > 0)
            .map((strat) => (
              <div key={strat.strategy} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStrategyColor(strat.strategy) }}
                />
                <span>{formatStrategyName(strat.strategy)}</span>
                <span className="text-slate-600">({strat.trades.length} trades)</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 animate-pulse">
      <div className="h-28 bg-slate-800/50 rounded-xl mb-6" />
      <div className="h-[450px] bg-slate-800/30 rounded-xl mb-6" />
      <div className="h-48 bg-slate-800/20 rounded-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_RAILWAY_API_URL || "";

export default function BacktestDetail({ ticker }: { ticker: string }) {
  const [data, setData] = useState<BacktestDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    async function fetchData() {
      try {
        const res = await fetch(`${API_URL}/api/backtests/${ticker}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.status === 404) { setError("not_found"); return; }
        if (!res.ok) { setError("fetch_error"); return; }

        const json: BacktestDetailResponse = await res.json();
        setData(json);
      } catch {
        setError("fetch_error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [ticker]);

  if (loading) return <LoadingSkeleton />;

  if (error === "not_found") {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <BackLink />
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-5xl mb-4">📭</p>
            <h2 className="text-xl font-bold text-white mb-2">Not Found</h2>
            <p className="text-slate-400">
              No backtest data available for <span className="font-semibold text-white">{ticker}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error === "fetch_error" || !data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <BackLink />
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-5xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
            <p className="text-slate-400">Failed to load backtest data. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <BackLink />

      {/* Combined banner — hero content */}
      <div className="mt-4">
        <CombinedBanner combined={data.combined} ticker={data.ticker} />
      </div>

      {/* Candlestick chart with multi-strategy trade markers */}
      {data.ohlc.length > 0 ? (
        <CandlestickChart
          ohlc={data.ohlc}
          strategies={data.strategies}
        />
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 flex items-center justify-center h-[450px]">
          <p className="text-slate-500">Price data unavailable for chart display.</p>
        </div>
      )}

      {/* Per-strategy breakdown table */}
      <StrategyBreakdownTable strategies={data.strategies} />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/backtests"
      className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
    >
      ← Back to Backtests
    </Link>
  );
}
