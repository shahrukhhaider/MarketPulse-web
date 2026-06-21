# PaperEdge Web

The frontend for [PaperEdge](https://getpaperedge.com/) — a market intelligence platform for swing traders. Built with Next.js 15 (App Router), Tailwind CSS, and deployed on Vercel.

**Website:** [https://getpaperedge.com](https://getpaperedge.com/)

## Pages

- `/` — Landing page with features, pricing, and showcase preview
- `/market` — Live market mood dashboard with winning trades
- `/backtests` — Sortable strategy performance table
- `/backtests/[ticker]` — Per-ticker candlestick chart with trade markers
- `/learn` — Educational articles (MDX)
- `/signals` — Signal archive

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view locally.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_RAILWAY_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_DISCORD_INVITE_URL` | Discord invite link |

## Deployment

Deployed automatically to [Vercel](https://vercel.com) on push to `main`.
