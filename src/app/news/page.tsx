import { promises as fs } from "fs";
import path from "path";
import type { NewsData } from "@/types";
import NewsViewer from "@/components/NewsViewer";

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
        <h1 className="text-2xl font-bold text-warm-text flex items-center gap-2 mb-1">
          <span>📰</span>
          ちいかわ最新ニュース
        </h1>
        <p className="text-sm text-warm-muted">
          Google アラートで収集したちいかわ関連の最新情報をお届けします。毎日自動更新。
        </p>
      </div>

      <div className="bg-honey-100 border border-yellow-200 rounded-2xl p-3 mb-6 text-xs text-yellow-700 flex items-start gap-2 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <span>ℹ️</span>
        <span>
          各記事は外部サイトへのリンクです。記事内容は各メディアが執筆したものです。
        </span>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <NewsViewer articles={data.articles} />
      </div>
    </div>
  );
}
