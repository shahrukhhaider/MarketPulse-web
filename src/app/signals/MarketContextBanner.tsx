"use client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MarketContextBannerProps {
  marketContext: {
    market_mood?: string;
    market_regime?: string;
    vix?: number | null;
    vix_regime?: string;
    breadth_pct?: number | null;
    breadth_label?: string;
  } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMoodColor(mood: string): string {
  switch (mood) {
    case "bullish":
      return "text-green-400";
    case "bearish":
      return "text-red-400";
    default:
      return "text-yellow-400";
  }
}

function getMoodBorderColor(mood: string): string {
  switch (mood) {
    case "bullish":
      return "border-green-500/30";
    case "bearish":
      return "border-red-500/30";
    default:
      return "border-yellow-500/30";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MarketContextBanner({ marketContext }: MarketContextBannerProps) {
  // Hide banner entirely when market_context is null or market_mood is absent
  if (!marketContext || !marketContext.market_mood) {
    return null;
  }

  const { market_mood, vix, vix_regime, breadth_pct, breadth_label } = marketContext;

  const vixDisplay = vix != null ? vix.toFixed(1) : "—";
  const breadthDisplay = breadth_pct != null ? `${Math.round(breadth_pct)}%` : "—";

  return (
    <div
      className={`rounded-xl border ${getMoodBorderColor(market_mood)} bg-slate-900 p-4 mb-6`}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {/* Mood */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase tracking-wide text-xs">Mood</span>
          <span className={`font-semibold capitalize ${getMoodColor(market_mood)}`}>
            {market_mood}
          </span>
        </div>

        {/* VIX */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase tracking-wide text-xs">VIX</span>
          <span className="text-slate-100 font-medium">{vixDisplay}</span>
          {vix_regime && (
            <span className="text-slate-500 text-xs capitalize">{vix_regime}</span>
          )}
        </div>

        {/* Breadth */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase tracking-wide text-xs">Breadth</span>
          <span className="text-slate-100 font-medium">{breadthDisplay}</span>
          {breadth_label && (
            <span className="text-slate-500 text-xs capitalize">{breadth_label}</span>
          )}
        </div>
      </div>
    </div>
  );
}
