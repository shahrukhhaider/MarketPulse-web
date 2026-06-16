import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PaperEdge — Practice Trading with Real Market Opportunities",
  description:
    "Discover real swing trading opportunities, paper trade them, and build your edge through experience. Learn by doing, not by following predictions.",
  openGraph: {
    siteName: "PaperEdge",
    title: "PaperEdge — Practice Trading with Real Market Opportunities",
    description:
      "Discover real swing trading opportunities, paper trade them, and build your edge through experience. Learn by doing, not by following predictions.",
    images: [{ url: "/og-image.png" }],
  },
};

const features = [
  {
    title: "Discover Opportunities",
    description:
      "Daily swing-trading opportunities generated from market-wide scans across 100+ tickers.",
  },
  {
    title: "Practice Without Risk",
    description:
      "Paper trade ideas before committing real capital. Log trades and track your progress.",
  },
  {
    title: "Trade History & Outcomes",
    description:
      "Review how opportunities evolved over time. Study winners, losers, and everything in between. The goal is not prediction. The goal is understanding.",
  },
  {
    title: "Learn Faster",
    description:
      "Understand how different setups perform across market conditions.",
  },
  {
    title: "AI Assistant",
    description:
      "Ask questions about any ticker, strategy, or market condition. Get answers grounded in live data.",
  },
];

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "during beta",
    features: [
      "Community access",
      "Real-time opportunities",
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
      "Real-time opportunities",
      "Morning digest",
      "Annotated opportunity charts",
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
          Discover real trading opportunities, paper trade them, and build your
          edge through experience.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#00c853] px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-[#00c853]/20 hover:bg-[#00e676] transition-colors"
          >
            Start Paper Trading
          </a>
          <Link
            href="/signals"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
          >
            Browse Opportunities →
          </Link>
          <p className="mt-2 text-sm text-slate-500">
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 underline underline-offset-2 hover:text-slate-300 transition-colors"
            >
              Join the Discord community
            </a>
            {" "}— discuss opportunities and learn together
          </p>
        </div>
      </section>

      {/* How PaperEdge Works Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          How PaperEdge Works
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              icon: "🔍",
              title: "Discover",
              description:
                "PaperEdge scans hundreds of stocks daily and surfaces high-quality swing trading opportunities.",
            },
            {
              icon: "📝",
              title: "Practice",
              description:
                "Paper trade setups without risking capital.",
            },
            {
              icon: "📊",
              title: "Track",
              description:
                "Every opportunity remains visible and trackable.",
            },
            {
              icon: "📖",
              title: "Learn",
              description:
                "Study how real setups behave under real market conditions.",
            },
            {
              icon: "💪",
              title: "Build Your Edge",
              description:
                "Develop confidence through experience, not prediction.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center"
            >
              <div className="text-4xl">{step.icon}</div>
              <h3 className="mt-4 text-lg font-bold text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why PaperEdge Section */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Why PaperEdge?
        </h2>
        <p className="mt-6 text-lg leading-8 text-slate-400">
          Most trading communities tell you what to buy. PaperEdge lets you
          participate. Every opportunity can be paper traded, tracked, and
          reviewed so you can develop confidence through experience rather than
          prediction.
        </p>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Image Showcase Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          What members see every day
        </h2>
        <div className="mt-12 flex flex-col items-center">
          <div className="overflow-hidden rounded-xl border border-slate-800 shadow-2xl shadow-black/40">
            <Image
              src="/signal-card-preview.png"
              alt="Example opportunity card showing AAPL trend pullback with entry, stop, target, and annotated chart"
              width={900}
              height={720}
              className="block w-full h-auto"
            />
          </div>
          <p className="mt-6 max-w-2xl text-center text-sm leading-6 text-slate-400">
            Daily opportunities posted to Discord after market close — entry, stop, target, and annotated chart included
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Simple, Transparent Pricing
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg font-medium text-slate-300">
          Built in public. Help shape the future of PaperEdge.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400">
          Join as a participant, not just a subscriber. Your feedback, ideas, and trades directly shape what we build next.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm italic text-slate-500">
          All features free during beta. Early participants influence the product roadmap. Trader plan launches at $49/mo when we exit beta.
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
