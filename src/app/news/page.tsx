import type { Metadata } from "next";
import { readNewsData } from "@/lib/server-data";
import { countByCategory } from "@/lib/categories";
import NewsViewer from "@/components/NewsViewer";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Latest News",
  description: "ちいかわ関連の最新ニュースをお届けする CHIIKAWA ARCHIVE のニュースページです。",
};

/** 初回表示ぶんとしてHTMLに埋め込む件数 */
const INITIAL_ARTICLES = 30;

export default async function NewsPage() {
  const data = await readNewsData();

  // 件数はビルド時に数えておき、全件JSONを取得しなくても絞り込みUIに出せるようにする
  const categoryCounts = countByCategory(data.articles);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <PageHeader
        title="Latest News"
        description="Google アラートで収集したちいかわ関連の最新情報をお届けします。毎日自動更新。"
      />

      <p
        className="bg-cream-200/70 border border-warm-border rounded-2xl px-4 py-3 mb-6 text-xs text-warm-muted leading-relaxed animate-fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        各記事は外部サイトへのリンクです。記事内容は各メディアが執筆したものです。
      </p>

      <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <NewsViewer
          initialArticles={data.articles.slice(0, INITIAL_ARTICLES)}
          totalArticles={data.totalArticles || data.articles.length}
          categoryCounts={categoryCounts}
        />
      </div>
    </div>
  );
}
