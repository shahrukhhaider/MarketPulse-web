import type { Metadata } from "next";
import MarketContent from "./MarketContent";

export const metadata: Metadata = {
  title: "Market Mood Today: {mood} | VIX {vix} | PaperEdge",
  description:
    "Daily market regime analysis — mood, VIX, breadth, trend, and exposure signals for swing traders. Plus winning signals from last week.",
  openGraph: {
    siteName: "PaperEdge",
    title: "Market Mood Today | PaperEdge",
    description:
      "Daily market regime analysis — mood, VIX, breadth, trend, and exposure signals for swing traders.",
  },
};

export default function MarketPage() {
  return <MarketContent />;
}
