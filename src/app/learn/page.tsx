import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn to Trade | PaperEdge",
  description:
    "Educational articles on swing trading concepts, market regimes, and signal interpretation.",
  openGraph: {
    siteName: "PaperEdge",
    title: "Learn to Trade | PaperEdge",
    description:
      "Educational articles on swing trading concepts, market regimes, and signal interpretation.",
  },
};

interface ArticleMeta {
  title: string;
  description: string;
  date: string;
  slug: string;
  readTime: string;
}

function getArticles(): ArticleMeta[] {
  const contentDir = path.join(process.cwd(), "content", "learn");
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  const articles = files.map((file) => {
    const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
    const { data } = matter(raw);
    return data as ArticleMeta;
  });

  // Sort by date descending
  articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return articles;
}

export default function LearnPage() {
  const articles = getArticles();

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Learn</h1>
      <p className="mt-3 text-slate-400 max-w-2xl">
        Educational guides on swing trading concepts, market regime analysis, and
        how to interpret PaperEdge signals.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
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
              {article.title}
            </h2>
            <p className="mt-2 text-sm text-slate-400 line-clamp-3">
              {article.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
