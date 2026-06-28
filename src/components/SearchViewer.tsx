"use client";

import { useState, useEffect, useMemo } from "react";
import type { SiteData, PostCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import CategoryBadge from "./CategoryBadge";
import TwitterEmbed from "./TwitterEmbed";

const ALL_CATEGORIES: PostCategory[] = ["manga", "goods", "anime", "collab", "event", "other"];

export default function SearchViewer() {
  const [data, setData] = useState<SiteData | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PostCategory | "all">("all");

  useEffect(() => {
    fetch("/data/posts.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const q = query.trim().toLowerCase();
  const hasQuery = q.length >= 2;
  const hasFilter = category !== "all";

  const results = useMemo(() => {
    if (!data) return [];
    if (!hasQuery && !hasFilter) return [];
    return data.posts
      .filter((p) => {
        const matchQ =
          !hasQuery ||
          p.summary?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.characters.some((c) => c.toLowerCase().includes(q));
        const matchCat = category === "all" || p.category === category;
        return matchQ && matchCat;
      })
      .slice(0, 30);
  }, [data, q, hasQuery, category, hasFilter]);

  return (
    <div className="space-y-5">
      {/* Search input */}
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="キャラクター名・タグ・キーワードで検索…"
          className="w-full bg-white border border-warm-border rounded-2xl px-5 py-4 pr-12 text-sm text-warm-text placeholder:text-warm-muted focus:outline-none focus:ring-2 focus:ring-mint-300 focus:border-mint-400 transition-all shadow-soft"
          autoFocus
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-muted">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-light tracking-wide transition-colors ${category === "all" ? "bg-mint-400 text-white" : "bg-white border border-warm-border text-warm-muted hover:bg-cream-100"}`}
        >
          すべて
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat === category ? "all" : cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-light tracking-wide transition-colors ${category === cat ? "bg-mint-400 text-white" : "bg-white border border-warm-border text-warm-muted hover:bg-cream-100"}`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* State display */}
      {!data ? (
        <div className="card p-10 text-center text-warm-muted text-sm animate-fade-in">読み込み中…</div>
      ) : !hasQuery && !hasFilter ? (
        <div className="card p-12 text-center animate-fade-in">
          <p className="text-warm-muted text-sm">キーワードを入力、またはカテゴリを選択してください</p>
          <p className="text-warm-muted text-xs mt-1.5 font-light">{data.totalPosts.toLocaleString()}件のアーカイブから検索します</p>
        </div>
      ) : results.length === 0 ? (
        <div className="card p-12 text-center animate-fade-in">
          <p className="text-warm-text text-sm mb-1">一致する投稿が見つかりませんでした</p>
          {hasQuery && <p className="text-warm-muted text-xs font-light">「{query}」</p>}
        </div>
      ) : (
        <div className="animate-fade-in space-y-5">
          <p className="text-xs text-warm-muted tracking-widest uppercase">
            {results.length}件{results.length === 30 ? "（上位30件）" : ""}
          </p>
          <div className="space-y-4">
            {results.map((post) => {
              const date = new Date(post.publishedAt).toLocaleDateString("ja-JP", {
                year: "numeric", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo",
              });
              return (
                <article key={post.id} className="card p-4 animate-fade-in">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <CategoryBadge category={post.category} />
                    <time className="text-xs text-warm-muted">{date}</time>
                  </div>
                  <TwitterEmbed tweetId={post.tweetId} url={post.url} />
                  {(post.tags.length > 0 || post.characters.length > 0) && (
                    <div className="mt-3 pt-3 border-t border-warm-border flex flex-wrap gap-1.5">
                      {post.characters.map((c) => (
                        <span key={c} className="text-xs bg-lavender-100 text-lavender-400 px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                      {post.tags.map((t) => (
                        <span key={t} className="text-xs text-warm-muted">#{t}</span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
