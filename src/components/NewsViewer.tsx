"use client";

import { useCallback, useRef, useState } from "react";
import type { CategoryFilter, NewsArticle, NewsData } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { fetchSiteJson } from "@/lib/client-data";
import { formatJst } from "@/lib/date";
import CategoryBadge from "@/components/CategoryBadge";
import CategoryFilterBar from "@/components/ui/CategoryFilterBar";
import EmptyState from "@/components/ui/EmptyState";

const PAGE_SIZE = 30;

interface NewsViewerProps {
  /** ビルド時に埋め込む直近の記事。初回表示はこれだけで完結する。 */
  initialArticles: NewsArticle[];
  /** 全件数とカテゴリ別件数（全件 JSON を読まずに件数を出すため） */
  totalArticles: number;
  categoryCounts: Record<CategoryFilter, number>;
}

/**
 * ニュース一覧。記事は数千件あり、全件を HTML に埋め込むと
 * ページが数MBになる。初期表示は直近ぶんだけをサーバーから受け取り、
 * 絞り込み・続きの読み込みが必要になった時点で news.json を取得する。
 */
export default function NewsViewer({
  initialArticles,
  totalArticles,
  categoryCounts,
}: NewsViewerProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [allArticles, setAllArticles] = useState<NewsArticle[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const requestedRef = useRef(false);

  const loadAll = useCallback(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    setStatus("loading");
    fetchSiteJson<NewsData>("news.json")
      .then((data) => {
        setAllArticles(data.articles);
        setStatus("idle");
      })
      .catch(() => {
        requestedRef.current = false; // 再試行できるようにする
        setStatus("error");
      });
  }, []);

  function handleCategoryChange(next: CategoryFilter) {
    setCategory(next);
    setVisibleCount(PAGE_SIZE);
    // 初期表示ぶんには該当カテゴリの記事が十分含まれないため全件を取りに行く
    if (next !== "all") loadAll();
  }

  function showMore() {
    if (visibleCount + PAGE_SIZE > initialArticles.length) loadAll();
    setVisibleCount((count) => count + PAGE_SIZE);
  }

  const hasAll = allArticles !== null;
  const articles = allArticles ?? initialArticles;
  const filtered =
    category === "all" ? articles : articles.filter((a) => a.category === category);
  const visible = filtered.slice(0, visibleCount);

  // 全件未取得のうちは埋め込みぶんではなく、ビルド時に数えた総数を表示する
  const matchCount = hasAll
    ? filtered.length
    : category === "all"
    ? totalArticles
    : categoryCounts[category];

  return (
    <>
      <CategoryFilterBar
        value={category}
        onChange={handleCategoryChange}
        counts={categoryCounts}
        className="mb-6"
      />

      {visible.length === 0 && status !== "loading" ? (
        <EmptyState
          title={totalArticles === 0 ? "ニュースがまだありません" : "該当する記事がありません"}
          hint={
            totalArticles === 0
              ? "次回の自動更新をお待ちください"
              : "別のカテゴリを選んでみてください"
          }
        />
      ) : (
        <>
          <p className="on-photo inline-block px-3.5 py-2 text-xs text-warm-muted mb-4 tracking-wide">
            <span className="tabular-nums">{matchCount.toLocaleString()}</span> 件
            {category !== "all" && <span> — {CATEGORY_LABELS[category]}</span>}
          </p>

          <div className="space-y-3">
            {visible.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}

      {status === "loading" && (
        <p className="text-center text-xs text-warm-muted py-6 animate-fade-in">読み込み中…</p>
      )}

      {status === "error" && (
        <p className="text-center text-xs text-warm-muted py-6">
          記事の読み込みに失敗しました。時間をおいて再度お試しください。
        </p>
      )}

      {status === "idle" && visible.length < matchCount && (
        <div className="text-center mt-6">
          <button type="button" onClick={showMore} className="btn-secondary">
            もっと見る
          </button>
        </div>
      )}
    </>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
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
        <time
          dateTime={article.publishedAt}
          className="text-xs text-warm-muted shrink-0 tabular-nums"
        >
          {formatJst(article.publishedAt, "longDate")}
        </time>
      </div>

      <h2 className="font-medium text-warm-text mb-2 leading-snug line-clamp-2">{article.title}</h2>

      {article.summary && (
        <p className="text-sm text-warm-muted leading-relaxed line-clamp-2">{article.summary}</p>
      )}

      {article.tags.length > 0 && (
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

      <span className="mt-2 block text-xs text-mint-500 font-medium">元記事を読む ↗</span>
    </a>
  );
}
