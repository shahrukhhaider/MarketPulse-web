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
  benchmark: number;
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

interface OHLCBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface BacktestDetailResponse {
  ticker: string;
  strategies: StrategyData[];
  ohlc: OHLCBar[];
}

// ---------------------------------------------------------------------------
// Strategy Color Mapping
// ---------------------------------------------------------------------------

const STRATEGY_COLORS: Record<string, string> = {
  trend_pullback: "#42a5f5",
  consolidation_breakout: "#26a69a",
  keltner_mean_reversion: "#ab47bc",
  bear_breakdown: "#ef5350",
  post_earnings_drift: "#ffa726",
};

function getStrategyColor(strategy: string): string {
  return STRATEGY_COLORS[strategy] || "#94a3b8";
}

function formatStrategyName(strategy: string): string {
  return strategy
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------------------------------------------------------------------------
// Zoom Range Buttons
// ---------------------------------------------------------------------------

type ZoomRange = "1M" | "3M" | "6M" | "1Y" | "All";

function getDateRange(range: ZoomRange, data: OHLCBar[]): { from: string; to: string } | null {
  if (data.length === 0) return null;

  const lastDate = data[data.length - 1].time;
  const to = lastDate;

  if (range === "All") {
    return { from: data[0].time, to };
  }

  const d = new Date(lastDate);
  switch (range) {
    case "1M":
      d.setMonth(d.getMonth() - 1);
      break;
    case "3M":
      d.setMonth(d.getMonth() - 3);
      break;
    case "6M":
      d.setMonth(d.getMonth() - 6);
      break;
    case "1Y":
      d.setFullYear(d.getFullYear() - 1);
      break;
  }

  const from = d.toISOString().slice(0, 10);
  return { from, to };
}

// ---------------------------------------------------------------------------
// Metrics Card
// ---------------------------------------------------------------------------

function MetricsCard({ strategy }: { strategy: StrategyData }) {
  const color = getStrategyColor(strategy.strategy);
  const m = strategy.metrics;

  return (
    <div
      className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"
      style={{ borderTopColor: color, borderTopWidth: 3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-sm font-semibold text-white">
          {formatStrategyName(strategy.strategy)}
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <p className="text-slate-500">Return</p>
          <p className={`font-semibold ${m.return >= 0 ? "text-green-400" : "text-red-400"}`}>
            {m.return >= 0 ? "+" : ""}
            {m.return.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-slate-500">Win Rate</p>
          <p className="font-semibold text-slate-200">
            {Math.round(m.win_rate * 100)}%
          </p>
        </div>
        <div>
          <p className="text-slate-500">Trades</p>
          <p className="font-semibold text-slate-200">{m.trades}</p>
        </div>
        <div>
          <p className="text-slate-500">Sharpe</p>
          <p className="font-semibold text-slate-200">{m.sharpe.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-slate-500">Max DD</p>
          <p className="font-semibold text-red-400">
            {m.max_drawdown.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-slate-500">vs Bench</p>
          <p
            className={`font-semibold ${m.return - m.benchmark >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {m.return - m.benchmark >= 0 ? "+" : ""}
            {(m.return - m.benchmark).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart Component
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
        layout: {
          background: { color: "transparent" },
          textColor: "#94a3b8",
        },
        grid: {
          vertLines: { color: "rgba(51, 65, 85, 0.3)" },
          horzLines: { color: "rgba(51, 65, 85, 0.3)" },
        },
        crosshair: {
          vertLine: { color: "#475569", width: 1, style: 3 },
          horzLine: { color: "#475569", width: 1, style: 3 },
        },
        timeScale: {
          borderColor: "#334155",
          timeVisible: false,
        },
        rightPriceScale: {
          borderColor: "#334155",
        },
      });

      chartRef.current = chart;

      // Add candlestick series
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

      // Add trade markers
      const markers: Array<{
        time: import("lightweight-charts").Time;
        position: "aboveBar" | "belowBar";
        color: string;
        shape: "arrowUp" | "arrowDown";
        text: string;
      }> = [];

      for (const strat of strategies) {
        const color = getStrategyColor(strat.strategy);
        for (const trade of strat.trades) {
          markers.push({
            time: trade.entry_date as unknown as import("lightweight-charts").Time,
            position: "belowBar",
            color,
            shape: "arrowUp",
            text: `${formatStrategyName(strat.strategy)} Entry`,
          });
          markers.push({
            time: trade.exit_date as unknown as import("lightweight-charts").Time,
            position: "aboveBar",
            color: trade.won ? color : "#ef5350",
            shape: "arrowDown",
            text: `${trade.won ? "Win" : "Loss"} Exit`,
          });
        }
      }

      // Sort markers by time
      markers.sort((a, b) => (a.time as string).localeCompare(b.time as string));
      candleSeries.setMarkers(markers);

      // Apply default zoom (6M)
      const dateRange = getDateRange("6M", ohlc);
      if (dateRange) {
        chart.timeScale().setVisibleRange({
          from: dateRange.from as unknown as import("lightweight-charts").Time,
          to: dateRange.to as unknown as import("lightweight-charts").Time,
        });
      }

      // Responsive resize
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width } = entry.contentRect;
          chart.applyOptions({ width });
        }
      });
      resizeObserver.observe(container);

      setChartReady(true);

      // Cleanup
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

      {/* Chart container */}
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

      {/* Trade legend */}
      {strategies.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
          {strategies.map((strat) => (
            <div key={strat.strategy} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
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
      <div className="h-6 w-32 bg-slate-800 rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-slate-800/50 rounded-xl" />
        ))}
      </div>
      <div className="h-[450px] bg-slate-800/30 rounded-xl" />
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

        if (res.status === 404) {
          setError("not_found");
          return;
        }

        if (!res.ok) {
          setError("fetch_error");
          return;
        }

        const json: BacktestDetailResponse = await res.json();
        setData(json);
      } catch {
        setError("fetch_error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [ticker]);

  // ─── Loading ───
  if (loading) {
    return <LoadingSkeleton />;
  }

  // ─── 404 ───
  if (error === "not_found") {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/backtests"
          className="text-sm text-slate-400 hover:text-white transition-colors mb-6 inline-flex items-center gap-1"
        >
          ← Back to Backtests
        </Link>
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

  // ─── Error ───
  if (error === "fetch_error" || !data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/backtests"
          className="text-sm text-slate-400 hover:text-white transition-colors mb-6 inline-flex items-center gap-1"
        >
          ← Back to Backtests
        </Link>
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-5xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
            <p className="text-slate-400">
              Failed to load backtest data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Success ───
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Back link */}
      <Link
        href="/backtests"
        className="text-sm text-slate-400 hover:text-white transition-colors mb-6 inline-flex items-center gap-1"
      >
        ← Back to Backtests
      </Link>

      {/* Page header */}
      <h1 className="text-2xl font-bold text-white mb-6 mt-4">{data.ticker} Backtest</h1>

      {/* Metrics cards */}
      {data.strategies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {data.strategies.map((strat) => (
            <MetricsCard key={strat.strategy} strategy={strat} />
          ))}
        </div>
      )}

      {/* Chart */}
      {data.ohlc.length > 0 ? (
        <CandlestickChart ohlc={data.ohlc} strategies={data.strategies} />
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 flex items-center justify-center h-[450px]">
          <p className="text-slate-500">Price data unavailable for chart display.</p>
        </div>
      )}
    </div>
  );
}
