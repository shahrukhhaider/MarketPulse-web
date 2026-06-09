import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signal Archive — Week of {date} | PaperEdge",
  description:
    "Browse the archive of PaperEdge swing trade signals by week.",
  openGraph: {
    siteName: "PaperEdge",
    title: "Signal Archive | PaperEdge",
    description:
      "Browse the archive of PaperEdge swing trade signals by week.",
  },
};

export default function SignalsPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Signal Archive
      </h1>
      <p className="mt-3 text-slate-400 max-w-2xl">
        Browse past signals by week. Live signals are available to community
        members on Discord.
      </p>
    </section>
  );
}
