import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import Link from "next/link";

const contentDir = path.join(process.cwd(), "content", "learn");

function getArticleBySlug(slug: string) {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
    const { data, content } = matter(raw);
    if (data.slug === slug) {
      return { frontmatter: data, content };
    }
  }
  return null;
}

function getAllSlugs(): string[] {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
    const { data } = matter(raw);
    return data.slug as string;
  });
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    return { title: "Article Not Found — MarketPulse" };
  }
  return {
    title: `${article.frontmatter.title} — MarketPulse`,
    description: article.frontmatter.description,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <Link href="/learn" className="mt-4 inline-block text-[#00c853] hover:underline">
          ← Back to Learn
        </Link>
      </section>
    );
  }

  const { frontmatter, content } = article;

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      {/* Back link */}
      <Link
        href="/learn"
        className="text-sm text-slate-400 hover:text-white transition-colors"
      >
        ← Back to Learn
      </Link>

      {/* Header */}
      <header className="mt-8">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <time dateTime={frontmatter.date}>
            {new Date(frontmatter.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{frontmatter.readTime}</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {frontmatter.title}
        </h1>
        <p className="mt-3 text-lg text-slate-400">{frontmatter.description}</p>
      </header>

      {/* Article content */}
      <article className="prose-custom mt-12">
        <MDXRemote source={content} />
      </article>
    </section>
  );
}
