"use client";

import { useMemo, useState } from "react";
import type { CategoryFilter, SiteData } from "@/types";
import { useSiteJson } from "@/lib/client-data";
import PostCard from "./PostCard";
import CategoryFilterBar from "./ui/CategoryFilterBar";
import EmptyState from "./ui/EmptyState";

const PAGE_SIZE = 20;
const MIN_QUERY_LENGTH = 2;

export default function SearchViewer() {
  const posts = useSiteJson<SiteData>("posts.json");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const normalizedQuery = query.trim().toLowerCase();
  const hasQuery = normalizedQuery.length >= MIN_QUERY_LENGTH;
  const hasFilter = category !== "all";

  const matches = useMemo(() => {
    if (!posts.data || (!hasQuery && !hasFilter)) return [];
    return posts.data.posts.filter((post) => {
      if (category !== "all" && post.category !== category) return false;
      if (!hasQuery) return true;
      return (
        post.summary?.toLowerCase().includes(normalizedQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
        post.characters.some((char) => char.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [posts.data, normalizedQuery, hasQuery, hasFilter, category]);

  // 条件が変わったら1ページ目から表示し直す
  function handleQueryChange(value: string) {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleCategoryChange(value: CategoryFilter) {
    setCategory(value);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = matches.slice(0, visibleCount);

  return (
    <div className="space-y-5">
      {/* 検索入力 */}
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="キャラクター名・タグ・キーワードで検索…"
          aria-label="投稿を検索"
          className="w-full bg-white border border-warm-border rounded-2xl pl-5 pr-12 py-4 text-sm text-warm-text placeholder:text-warm-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-300 focus:border-mint-400 transition-all shadow-soft"
        />
        {query ? (
          <button
            type="button"
            onClick={() => handleQueryChange("")}
            aria-label="検索キーワードを消す"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-warm-muted hover:bg-cream-100 hover:text-warm-text transition-colors"
          >
            ×
          </button>
        ) : (
          <span
            aria-hidden="true"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-muted"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
        )}
      </div>

      <CategoryFilterBar value={category} onChange={handleCategoryChange} />

      {posts.status === "loading" ? (
        <EmptyState title="アーカイブを読み込んでいます…" />
      ) : posts.status === "error" ? (
        <EmptyState
          title="アーカイブを読み込めませんでした"
          hint="時間をおいて再度お試しください"
        />
      ) : !hasQuery && !hasFilter ? (
        <EmptyState
          title="キーワードを入力、またはカテゴリを選択してください"
          hint={`${posts.data.totalPosts.toLocaleString()}件のアーカイブから検索します（2文字以上）`}
        />
      ) : matches.length === 0 ? (
        <EmptyState
          title="一致する投稿が見つかりませんでした"
          hint={hasQuery ? `「${query.trim()}」` : undefined}
        />
      ) : (
        <div className="animate-fade-in space-y-4">
          <p className="on-photo inline-block px-3.5 py-2 text-xs text-warm-muted tracking-wide">
            <span className="tabular-nums">{matches.length.toLocaleString()}</span> 件
            {visible.length < matches.length && (
              <span className="ml-1">（{visible.length}件を表示中）</span>
            )}
          </p>

          {visible.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {visible.length < matches.length && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="btn-secondary"
              >
                もっと見る
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
