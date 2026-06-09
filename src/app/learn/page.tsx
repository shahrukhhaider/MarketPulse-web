import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn | PaperEdge",
  description:
    "Free educational guides on market analysis, chart reading, and building your edge as a trader.",
  openGraph: {
    siteName: "PaperEdge",
    title: "Learn | PaperEdge",
    description:
      "Free educational guides on market analysis, chart reading, and building your edge as a trader.",
  },
};

interface ArticleMeta {
  title: string;
  description: string;
  date: string;
  slug: string;
  readTime: string;
  seriesOrder?: number;
}

function getArticles(): ArticleMeta[] {
  const contentDir = path.join(process.cwd(), "content", "learn");
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  const articles = files.map((file) => {
    const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
    const { data } = matter(raw);
    return data as ArticleMeta;
  });

  return articles;
}

function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <Link
      href={`/learn/${article.slug}`}
      className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-colors hover:border-slate-700 hover:bg-slate-900"
    >
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <time dateTime={article.date}>
          {new Date(article.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
        <span>·</span>
        <span>{article.readTime}</span>
      </div>
      <h2 className="mt-3 text-lg font-semibold text-white group-hover:text-[#00c853] transition-colors">
        {article.seriesOrder != null && (
          <span className="text-sm text-slate-500 font-normal mr-2">
            {article.seriesOrder}.
          </span>
        )}
        {article.title}
      </h2>
      <p className="mt-2 text-sm text-slate-400 line-clamp-3">
        {article.description}
      </p>
    </Link>
  );
}

export default function LearnPage() {
  const articles = getArticles();

  // Split into series articles (have seriesOrder) and standalone articles
  const seriesArticles = articles
    .filter((a) => a.seriesOrder != null)
    .sort((a, b) => a.seriesOrder! - b.seriesOrder!);

  const standaloneArticles = articles
    .filter((a) => a.seriesOrder == null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Learn</h1>
      <p className="mt-3 text-slate-400 max-w-2xl">
        Free educational guides on market analysis, chart reading, and building
        your edge as a trader.
      </p>

      {seriesArticles.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white">
            Course: First Principles to First Trade
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A complete beginner course — from reading your first chart to placing
            your first paper trade.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {seriesArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      )}

      {standaloneArticles.length > 0 && (
        <div className="mt-12">
          {seriesArticles.length > 0 && (
            <h2 className="text-xl font-semibold text-white mb-6">
              More Articles
            </h2>
          )}
          <div className="grid gap-6 sm:grid-cols-2">
            {standaloneArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
