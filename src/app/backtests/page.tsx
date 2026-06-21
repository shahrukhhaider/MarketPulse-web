import type { Metadata } from "next";
import BacktestSummary from "./BacktestSummary";

export const metadata: Metadata = {
  title: "Backtest Results — Strategy Performance | PaperEdge",
  description:
    "View backtested strategy performance across all tickers. Sortable metrics table showing returns, win rates, Sharpe ratios, and more.",
  openGraph: {
    siteName: "PaperEdge",
    title: "Backtest Results | PaperEdge",
    description:
      "Backtested strategy performance across all tickers — returns, win rates, Sharpe ratios, and drawdowns.",
  },
};

export default function BacktestsPage() {
  return <BacktestSummary />;
}
