"use client";

import { useState } from "react";
import type { NewsArticle, PostCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import CategoryBadge from "@/components/CategoryBadge";

const CATEGORY_FILTERS: { label: string; value: PostCategory | "all" }[] = [
  { label: "すべて", value: "all" },
  { label: "漫画", value: "manga" },
  { label: "アニメ", value: "anime" },
  { label: "グッズ", value: "goods" },
  { label: "コラボ", value: "collab" },
  { label: "イベント", value: "event" },
  { label: "その他", value: "other" },
];

interface NewsViewerProps {
  articles: NewsArticle[];
}

export default function NewsViewer({ articles }: NewsViewerProps) {
  const [category, setCategory] = useState<PostCategory | "all">("all");

  const filtered =
    category === "all" ? articles : articles.filter((a) => a.category === category);

  return (
    <>
      {/* カテゴリフィルター */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setCategory(f.value)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              category === f.value
                ? "bg-mint-300 text-mint-500"
                : "bg-cream-200 text-warm-muted hover:bg-cream-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-warm-muted animate-fade-in">
          <p className="text-3xl mb-3">🌙</p>
          <p className="font-semibold mb-1">
            {articles.length === 0 ? "ニュースがまだありません" : "該当する記事がありません"}
          </p>
          <p className="text-sm">
            {articles.length === 0
              ? "次回の自動更新をお待ちください"
              : "別のカテゴリを選んでみてください"}
          </p>
        </div>
      ) : (
        <>
          <div className="text-sm text-warm-muted mb-4">
            {filtered.length} 件の記事
            {category !== "all" && <span> — {CATEGORY_LABELS[category]}</span>}
          </div>
          <div className="space-y-3">
            {filtered.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const date = new Date(article.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  });

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-hover p-4 block"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={article.category} />
          <span className="text-xs text-warm-muted">{article.source}</span>
        </div>
        <time className="text-xs text-warm-muted shrink-0">{date}</time>
      </div>
      <h2 className="font-bold text-warm-text mb-2 leading-snug line-clamp-2">
        {article.title}
      </h2>
      {article.summary && (
        <p className="text-sm text-warm-muted leading-relaxed line-clamp-2">
          {article.summary}
        </p>
      )}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {article.tags.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-cream-200 text-warm-muted px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-2 text-xs text-mint-500 font-medium">
        元記事を読む →
      </div>
    </a>
  );
}
