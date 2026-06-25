import type { Metadata } from "next";
import PortfolioContent from "./PortfolioContent";

export const metadata: Metadata = {
  title: "Auto-Portfolio — Live Track Record | PaperEdge",
  description:
    "See real performance from our automated trading system. Every signal with ≥85% confidence is entered automatically. Open positions, closed trades, and stats — fully transparent.",
  openGraph: {
    siteName: "PaperEdge",
    title: "Auto-Portfolio | PaperEdge",
    description:
      "Live track record of automated swing trade signals. Win rate, P&L, and every trade logged transparently.",
  },
};

export default function PortfolioPage() {
  return <PortfolioContent />;
}
