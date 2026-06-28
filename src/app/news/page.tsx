import { promises as fs } from "fs";
import path from "path";
import type { Metadata } from "next";
import type { NewsData } from "@/types";
import NewsViewer from "@/components/NewsViewer";

export const metadata: Metadata = {
  title: "Latest News",
  description: "ちいかわ関連の最新ニュースをお届けする CHIIKAWA ARCHIVE のニュースページです。",
};

async function getNewsData(): Promise<NewsData> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "news.json");
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as NewsData;
  } catch {
    return { lastUpdated: "", totalArticles: 0, articles: [] };
  }
}

export default async function NewsPage() {
  const data = await getNewsData();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-xl font-serif text-warm-text tracking-wide mb-1">Latest News</h1>
        <p className="text-sm text-warm-muted">
          Google アラートで収集したちいかわ関連の最新情報をお届けします。毎日自動更新。
        </p>
      </div>

      <div className="bg-cream-200 border border-warm-border rounded-2xl p-3 mb-6 text-xs text-warm-muted flex items-start gap-2 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <span>ℹ</span>
        <span>各記事は外部サイトへのリンクです。記事内容は各メディアが執筆したものです。</span>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <NewsViewer articles={data.articles} />
      </div>
    </div>
  );
}
