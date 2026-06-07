import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MarketPulse — Market Intelligence for Swing Traders",
  description:
    "Daily swing trade signals, market regime detection, and AI-powered intelligence. Join the community for free.",
  openGraph: {
    title: "MarketPulse — Market Intelligence for Swing Traders",
    description:
      "Daily swing trade signals, market regime detection, and AI-powered intelligence. Join the community for free.",
    images: [{ url: "/og-image.png" }],
  },
};

const features = [
  {
    title: "Daily Signals + Charts",
    description:
      "Multi-strategy scan across 100+ tickers with entry, stop, and target levels. Full chart images posted to Discord.",
  },
  {
    title: "Morning Intelligence Digest",
    description:
      "Pre-market briefing with market mood, VIX regime, sector breadth, and exposure guidance.",
  },
  {
    title: "AI Assistant Bot",
    description:
      "Ask questions about any ticker, strategy, or market condition. Get answers grounded in live data.",
  },
  {
    title: "Member Trade Journal",
    description:
      "Log paper trades with /trade-add. Track P&L, R:R ratios, and win rates transparently.",
  },
];

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Community access",
      "Delayed signals (1 week)",
      "Educational content",
      "Market mood dashboard",
    ],
    cta: "Join Free",
    highlighted: false,
  },
  {
    name: "Intelligence",
    price: "$49",
    period: "/mo",
    features: [
      "Everything in Free",
      "Real-time signals",
      "Morning digest",
      "Signal charts",
      "Full archive",
    ],
    cta: "Get Intelligence",
    highlighted: true,
  },
  {
    name: "Trader",
    price: "$79",
    period: "/mo",
    features: [
      "Everything in Intelligence",
      "AI assistant",
      "Trade journal",
      "Parameter tuning alerts",
      "Priority support",
    ],
    cta: "Go Trader",
    highlighted: false,
  },
];

export default function Home() {
  const discordUrl = process.env.DISCORD_INVITE_URL || "#";

  return (
    <div className="bg-slate-950">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 text-center sm:pt-32 sm:pb-32">
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Market Intelligence for Swing Traders
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Daily signals, regime detection, and AI-powered analysis — all
          delivered to Discord before market open.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-[#00c853] px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-[#00c853]/20 hover:bg-[#00e676] transition-colors"
          >
            Join the Community
          </a>
          <p className="text-sm text-slate-500">
            Free tier available · No credit card required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-slate-700"
            >
              <h3 className="text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Simple, Transparent Pricing
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">
          Start free. Upgrade when you're ready for real-time edge.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-8 flex flex-col ${
                tier.highlighted
                  ? "border-[#00c853] bg-slate-900 ring-1 ring-[#00c853]/30"
                  : "border-slate-800 bg-slate-900"
              }`}
            >
              <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">
                  {tier.price}
                </span>
                <span className="text-sm text-slate-400">{tier.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <span className="mt-0.5 text-[#00c853]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                  tier.highlighted
                    ? "bg-[#00c853] text-slate-950 hover:bg-[#00e676]"
                    : "border border-slate-700 text-white hover:bg-slate-800"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof / Testimonial Placeholder */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <blockquote className="mx-auto max-w-2xl text-lg italic text-slate-300">
            "MarketPulse changed how I approach swing trading. The morning
            digest alone saves me an hour of research every day."
          </blockquote>
          <p className="mt-4 text-sm text-slate-500">
            — Community Member (testimonial placeholder)
          </p>
        </div>
      </section>
    </div>
  );
}
