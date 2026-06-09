import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "PaperEdge — Learn to Trade with Real Signals",
  description:
    "Daily swing trade signals, market regime detection, and AI-powered intelligence. Join the community for free.",
  openGraph: {
    siteName: "PaperEdge",
    title: "PaperEdge — Learn to Trade with Real Signals",
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
      "Trade journal",
    ],
    cta: "Join Free — Beta Access",
    highlighted: false,
  },
  {
    name: "Intelligence",
    price: "$49",
    period: "/mo",
    note: "Launching after beta · $49/mo",
    features: [
      "Everything in Free",
      "Real-time signals",
      "Morning digest",
      "Annotated signal charts",
      "Full archive",
      "AI assistant",
    ],
    cta: "Get Intelligence",
    highlighted: true,
  },
];

export default function Home() {
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || process.env.DISCORD_INVITE_URL || "#";

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
            className="inline-flex items-center gap-3 rounded-lg bg-[#5865F2] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#5865F2]/20 hover:bg-[#4752C4] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
            </svg>
            Join the Discord Community
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

      {/* How It Works Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          How it works
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "🚀",
              title: "Join free",
              description:
                "Create a Discord account and join the PaperEdge community. No credit card, no brokerage account required.",
            },
            {
              icon: "📊",
              title: "Watch real signals",
              description:
                "Follow daily signals across 100+ tickers — entry, stop, target, and annotated charts posted after market close.",
            },
            {
              icon: "📓",
              title: "Paper trade with the journal",
              description:
                "Log paper trades with `/trade add`. Track your P&L, win rate, and open positions as you build confidence.",
            },
            {
              icon: "🤖",
              title: "Go deeper with AI",
              description:
                "Ask the AI assistant why a signal triggered, what the market regime means, or how to size a position. Upgrade to Trader for full access.",
            },
          ].map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center"
            >
              <div className="text-4xl">{step.icon}</div>
              <h3 className="mt-4 text-lg font-bold text-white">
                Step {index + 1} — {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-lg text-slate-400">Ready to start?</p>
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#5865F2]/20 hover:bg-[#4752C4] transition-colors"
          >
            Join the Community →
          </a>
        </div>
      </section>

      {/* Image Showcase Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          What members see every day
        </h2>
        <div className="mt-12 flex flex-col items-center">
          <div className="overflow-hidden rounded-xl border border-slate-800 shadow-2xl shadow-black/40">
            <Image
              src="/signal-card-preview.png"
              alt="Example Discord signal card showing entry, stop, target, and annotated chart"
              width={800}
              height={600}
              className="block"
            />
          </div>
          <p className="mt-6 max-w-2xl text-center text-sm leading-6 text-slate-400">
            Daily signals posted to Discord after market close — entry, stop, target, and annotated chart included
          </p>
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
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm italic text-slate-500">
          All features free during beta. Trader plan launches at $49/mo when we exit beta.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-8 flex flex-col ${
                tier.highlighted
                  ? "border-[#00c853] bg-slate-900 ring-1 ring-[#00c853]/30"
                  : "border-slate-800 bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                {tier.name === "Free" && (
                  <span className="inline-flex items-center rounded-full bg-[#5865F2]/20 px-2.5 py-0.5 text-xs font-medium text-[#5865F2] ring-1 ring-inset ring-[#5865F2]/30">
                    Beta
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">
                  {tier.price}
                </span>
                <span className="text-sm text-slate-400">{tier.period}</span>
              </div>
              {tier.note && (
                <p className="mt-2 text-xs text-slate-400">{tier.note}</p>
              )}
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

    </div>
  );
}
