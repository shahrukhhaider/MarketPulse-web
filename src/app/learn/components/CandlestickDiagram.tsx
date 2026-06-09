"use client";

/**
 * An educational SVG diagram showing a single bullish candlestick
 * with labeled parts (open, close, high, low, body, wicks).
 */
export function CandlestickDiagram() {
  const width = 320;
  const height = 280;

  // Candlestick values (visual positions, not real data)
  const high = 40;
  const close = 80;
  const open = 180;
  const low = 240;

  const bodyX = 120;
  const bodyWidth = 48;
  const wickX = bodyX + bodyWidth / 2;

  return (
    <figure className="my-8 flex flex-col items-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="max-w-full"
        aria-label="Anatomy of a bullish candlestick showing open, close, high, and low prices"
        role="img"
      >
        {/* Upper wick */}
        <line
          x1={wickX}
          y1={high}
          x2={wickX}
          y2={close}
          stroke="#22c55e"
          strokeWidth={2}
        />
        {/* Lower wick */}
        <line
          x1={wickX}
          y1={open}
          x2={wickX}
          y2={low}
          stroke="#22c55e"
          strokeWidth={2}
        />
        {/* Body */}
        <rect
          x={bodyX}
          y={close}
          width={bodyWidth}
          height={open - close}
          fill="#22c55e"
          rx={2}
        />

        {/* Labels */}
        <text x={200} y={high + 5} fill="#94a3b8" fontSize={12} fontFamily="sans-serif">
          High
        </text>
        <line x1={wickX + 2} y1={high} x2={195} y2={high} stroke="#475569" strokeWidth={1} strokeDasharray="3,3" />

        <text x={200} y={close + 5} fill="#94a3b8" fontSize={12} fontFamily="sans-serif">
          Close
        </text>
        <line x1={bodyX + bodyWidth + 2} y1={close} x2={195} y2={close} stroke="#475569" strokeWidth={1} strokeDasharray="3,3" />

        <text x={200} y={open + 5} fill="#94a3b8" fontSize={12} fontFamily="sans-serif">
          Open
        </text>
        <line x1={bodyX + bodyWidth + 2} y1={open} x2={195} y2={open} stroke="#475569" strokeWidth={1} strokeDasharray="3,3" />

        <text x={200} y={low + 5} fill="#94a3b8" fontSize={12} fontFamily="sans-serif">
          Low
        </text>
        <line x1={wickX + 2} y1={low} x2={195} y2={low} stroke="#475569" strokeWidth={1} strokeDasharray="3,3" />

        {/* Body label */}
        <text x={50} y={(close + open) / 2 + 4} fill="#94a3b8" fontSize={11} fontFamily="sans-serif" textAnchor="end">
          Body
        </text>
        <line x1={55} y1={(close + open) / 2} x2={bodyX - 4} y2={(close + open) / 2} stroke="#475569" strokeWidth={1} strokeDasharray="3,3" />

        {/* Upper wick label */}
        <text x={50} y={(high + close) / 2 + 4} fill="#94a3b8" fontSize={11} fontFamily="sans-serif" textAnchor="end">
          Wick
        </text>
        <line x1={55} y1={(high + close) / 2} x2={wickX - 4} y2={(high + close) / 2} stroke="#475569" strokeWidth={1} strokeDasharray="3,3" />

        {/* Lower wick label */}
        <text x={50} y={(open + low) / 2 + 4} fill="#94a3b8" fontSize={11} fontFamily="sans-serif" textAnchor="end">
          Wick
        </text>
        <line x1={55} y1={(open + low) / 2} x2={wickX - 4} y2={(open + low) / 2} stroke="#475569" strokeWidth={1} strokeDasharray="3,3" />
      </svg>
      <figcaption className="mt-2 text-xs text-slate-500">
        A single bullish (green) candlestick — price opened low and closed higher.
      </figcaption>
    </figure>
  );
}
