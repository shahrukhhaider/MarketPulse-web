import type { Metadata } from "next";
import MarketContent from "./MarketContent";

export const metadata: Metadata = {
  title: "Market Signals | MarketPulse",
  description:
    "Daily market regime analysis — mood, VIX, breadth, trend, and exposure signals for swing traders. Plus winning signals from last week.",
};

export default function MarketPage() {
  return <MarketContent />;
}
