import type { Metadata } from "next";
import BacktestDetail from "./BacktestDetail";

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const displayTicker = ticker.toUpperCase();

  return {
    title: `${displayTicker} Backtest — Strategy Performance | PaperEdge`,
    description: `Backtest results for ${displayTicker}. View candlestick chart with trade entries/exits, strategy metrics, and performance history.`,
    openGraph: {
      siteName: "PaperEdge",
      title: `${displayTicker} Backtest | PaperEdge`,
      description: `Backtested strategy performance for ${displayTicker} — chart, trades, and metrics.`,
    },
  };
}

export default async function BacktestTickerPage({ params }: PageProps) {
  const { ticker } = await params;
  return <BacktestDetail ticker={ticker.toUpperCase()} />;
}
