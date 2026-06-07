import type { Metadata } from "next";

export const revalidate = 3600;

interface MarketData {
  mood: "bullish" | "neutral" | "bearish";
  vix: number;
  vixRegime: string;
  breadth: number;
  breadthLabel: string;
  spyTrend: "bullish" | "bearish" | "neutral";
  qqqTrend: "bullish" | "bearish" | "neutral";
  exposureTier: "full" | "reduced" | "minimal";
  timestamp: string;
}

async function getMarketData(): Promise<MarketData | null> {
  try {
    const res = await fetch(`${process.env.RAILWAY_API_URL}/api/market`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const raw = await res.json();
    // API returns snake_case — map to our camelCase interface
    return {
      mood: raw.market_mood,
      vix: raw.vix,
      vixRegime: raw.vix_regime,
      breadth: raw.breadth_pct,
      breadthLabel: raw.breadth_label,
      spyTrend: raw.spy_trend,
      qqqTrend: raw.qqq_trend,
      exposureTier: raw.exposure_tier,
      timestamp: raw.updated_at,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getMarketData();

  if (!data) {
    return {
      title: "Market Mood | MarketPulse",
      description:
        "Daily market regime analysis — VIX, breadth, trend, and exposure signals for swing traders.",
    };
  }

  return {
    title: `Market Mood Today: ${data.mood} | VIX ${data.vix} | MarketPulse`,
    description: `Today's market mood is ${data.mood}. VIX at ${data.vix} (${data.vixRegime}), breadth ${data.breadth}% (${data.breadthLabel}), SPY ${data.spyTrend}, QQQ ${data.qqqTrend}. Exposure tier: ${data.exposureTier}.`,
  };
}

function getMoodEmoji(mood: string) {
  switch (mood) {
    case "bullish":
      return "🟢";
    case "bearish":
      return "🔴";
    default:
      return "🟡";
  }
}

function getExplainer(mood: string, vixRegime: string): string {
  if (mood === "bullish" && vixRegime === "normal") {
    return "Markets are in a favorable regime for swing trading. Full position sizing is appropriate with strong breadth supporting upside moves.";
  }
  if (mood === "bullish" && vixRegime !== "normal") {
    return "Markets are bullish but volatility is elevated. Consider reduced position sizes and wider stops.";
  }
  if (mood === "neutral") {
    return "Markets are showing mixed signals. Be selective with entries and keep position sizes moderate.";
  }
  return "Markets are in a defensive regime. Focus on capital preservation — short setups or cash is preferred.";
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "bullish":
      return "↑";
    case "bearish":
      return "↓";
    default:
      return "→";
  }
}

function getTrendColor(trend: string) {
  switch (trend) {
    case "bullish":
      return "text-green-400";
    case "bearish":
      return "text-red-400";
    default:
      return "text-yellow-400";
  }
}

function getExposureColor(tier: string) {
  switch (tier) {
    case "full":
      return "text-green-400";
    case "reduced":
      return "text-yellow-400";
    default:
      return "text-red-400";
  }
}

export default async function MarketPage() {
  const data = await getMarketData();

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-6">📊</p>
          <h1 className="text-2xl font-bold text-white mb-4">
            Market Data Unavailable
          </h1>
          <p className="text-slate-400 text-lg">
            Market data updates after 4:30 PM ET each trading day. Check back
            after market close.
          </p>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "MarketPulse Daily Market Mood",
    description: `Daily market regime analysis: mood ${data.mood}, VIX ${data.vix}, breadth ${data.breadth}%, SPY ${data.spyTrend}, QQQ ${data.qqqTrend}, exposure ${data.exposureTier}.`,
    temporalCoverage: data.timestamp,
    creator: {
      "@type": "Organization",
      name: "MarketPulse",
    },
    distribution: {
      "@type": "DataDownload",
      contentUrl: `${process.env.RAILWAY_API_URL}/api/market`,
      encodingFormat: "application/json",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-slate-950 text-white">
        <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Mood Hero */}
          <section className="text-center mb-12">
            <p className="text-7xl mb-4">{getMoodEmoji(data.mood)}</p>
            <h1 className="text-4xl sm:text-5xl font-bold capitalize mb-2">
              {data.mood}
            </h1>
            <p className="text-slate-400 text-lg">Today&apos;s Market Mood</p>
          </section>

          {/* Metric Cards Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {/* VIX */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400 uppercase tracking-wide mb-1">
                VIX
              </p>
              <p className="text-3xl font-bold">{data.vix}</p>
              <p className="text-sm text-slate-400 mt-1 capitalize">
                {data.vixRegime}
              </p>
            </div>

            {/* Breadth */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400 uppercase tracking-wide mb-1">
                Breadth
              </p>
              <p className="text-3xl font-bold">{data.breadth}%</p>
              <p className="text-sm text-slate-400 mt-1 capitalize">
                {data.breadthLabel}
              </p>
            </div>

            {/* SPY Trend */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400 uppercase tracking-wide mb-1">
                SPY Trend
              </p>
              <p className={`text-3xl font-bold ${getTrendColor(data.spyTrend)}`}>
                {getTrendIcon(data.spyTrend)}{" "}
                <span className="capitalize">{data.spyTrend}</span>
              </p>
            </div>

            {/* QQQ Trend */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400 uppercase tracking-wide mb-1">
                QQQ Trend
              </p>
              <p className={`text-3xl font-bold ${getTrendColor(data.qqqTrend)}`}>
                {getTrendIcon(data.qqqTrend)}{" "}
                <span className="capitalize">{data.qqqTrend}</span>
              </p>
            </div>

            {/* Exposure Tier */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400 uppercase tracking-wide mb-1">
                Exposure Tier
              </p>
              <p
                className={`text-3xl font-bold capitalize ${getExposureColor(data.exposureTier)}`}
              >
                {data.exposureTier}
              </p>
            </div>
          </section>

          {/* Last Updated */}
          <p className="text-center text-sm text-slate-500 mb-12">
            Last updated: {formatTimestamp(data.timestamp)}
          </p>

          {/* Explainer */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 mb-12">
            <h2 className="text-lg font-semibold mb-3">What this means</h2>
            <p className="text-slate-300 leading-relaxed">
              {getExplainer(data.mood, data.vixRegime)}
            </p>
          </section>

          {/* Discord CTA */}
          <section className="text-center">
            <a
              href={process.env.DISCORD_INVITE_URL || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#00c853] px-8 py-3 text-lg font-medium text-slate-950 transition-colors hover:bg-[#00e676]"
            >
              See today&apos;s full signals and setups — join the community →
            </a>
          </section>
        </main>
      </div>
    </>
  );
}
