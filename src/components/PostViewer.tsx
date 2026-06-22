"use client";

import { useState, useMemo } from "react";
import type { Post, CalendarDay, PostCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import TwitterEmbed from "./TwitterEmbed";
import CategoryBadge from "./CategoryBadge";

const CATEGORY_EMOJIS: Record<PostCategory, string> = {
  manga: "📖",
  goods: "🛍️",
  anime: "📺",
  collab: "🤝",
  event: "🎪",
  other: "📌",
};

const ALL_CATEGORIES: PostCategory[] = ["manga", "goods", "anime", "collab", "event", "other"];

function getPostDateJst(publishedAt: string): string {
  return new Date(publishedAt).toLocaleDateString("sv", { timeZone: "Asia/Tokyo" });
}

function getCellStyle(count: number, isSelected: boolean, isToday: boolean): string {
  const base = "w-4 h-4 rounded-sm transition-all";
  if (isSelected) return `${base} bg-mint-500 ring-2 ring-mint-600 ring-offset-1`;
  if (count === 0) return `${base} bg-cream-200 cursor-default ${isToday ? "ring-1 ring-mint-300 ring-offset-1" : ""}`;
  const color =
    count === 1 ? "bg-mint-200 hover:bg-mint-300" :
    count === 2 ? "bg-mint-300 hover:bg-mint-400" :
    "bg-mint-400 hover:bg-mint-500";
  return `${base} ${color} cursor-pointer ${isToday ? "ring-1 ring-mint-400 ring-offset-1" : ""}`;
}

interface PostViewerProps {
  posts: Post[];
  calendarData: CalendarDay[];
}

export default function PostViewer({ posts, calendarData }: PostViewerProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | "all">("all");

  const today = new Date().toLocaleDateString("sv", { timeZone: "Asia/Tokyo" });

  // Build 90-day calendar grid
  const { weeks, dataMap } = useMemo(() => {
    const map = Object.fromEntries(calendarData.map((d) => [d.date, d]));

    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 90);

    const days: CalendarDay[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toLocaleDateString("sv", { timeZone: "Asia/Tokyo" });
      days.push(map[dateStr] ?? { date: dateStr, count: 0, categories: [] });
    }

    const firstDow = new Date(days[0].date).getDay();
    const padded: (CalendarDay | null)[] = [...Array(firstDow).fill(null), ...days];
    const wks: (CalendarDay | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) wks.push(padded.slice(i, i + 7));

    return { weeks: wks, dataMap: map };
  }, [calendarData]);

  const filtered = useMemo(() => {
    return posts
      .filter((p) => {
        if (selectedDate && getPostDateJst(p.publishedAt) !== selectedDate) return false;
        if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
        return true;
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [posts, selectedDate, selectedCategory]);

  function handleDateClick(date: string) {
    const entry = dataMap[date];
    if (!entry || entry.count === 0) return;
    setSelectedDate((prev) => (prev === date ? null : date));
  }

  const resultLabel = useMemo(() => {
    const parts: string[] = [];
    if (selectedDate) {
      parts.push(
        new Date(selectedDate).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Asia/Tokyo",
        })
      );
    }
    if (selectedCategory !== "all") parts.push(CATEGORY_LABELS[selectedCategory]);
    return parts.length > 0 ? parts.join(" ・ ") : "すべての投稿";
  }, [selectedDate, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="card p-4">
        <div className="section-title mb-3">
          <span>📅</span>
          <span>更新カレンダー</span>
          <span className="text-xs font-normal text-warm-muted ml-1">
            投稿のある日をクリックで絞り込み（過去90日）
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => {
                  if (!day) return <div key={di} className="w-4 h-4" />;
                  return (
                    <button
                      key={di}
                      type="button"
                      title={`${day.date}：${day.count}件`}
                      onClick={() => handleDateClick(day.date)}
                      className={getCellStyle(day.count, day.date === selectedDate, day.date === today)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-warm-muted">少</span>
          {["bg-cream-200", "bg-mint-200", "bg-mint-300", "bg-mint-400"].map((c, i) => (
            <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
          ))}
          <span className="text-xs text-warm-muted">多</span>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="ml-auto text-xs text-warm-muted hover:text-warm-text underline"
            >
              日付の絞り込みを解除
            </button>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="card p-4">
        <div className="section-title mb-3">
          <span>🗂️</span>
          <span>カテゴリ</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-mint-200 text-mint-600"
                : "bg-cream-100 text-warm-muted hover:bg-cream-200"
            }`}
          >
            すべて
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? "all" : cat)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-mint-200 text-mint-600"
                  : "bg-cream-100 text-warm-muted hover:bg-cream-200"
              }`}
            >
              {CATEGORY_EMOJIS[cat]} {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Post list */}
      <div>
        <div className="section-title mb-3">
          <span>📋</span>
          <span>{resultLabel}</span>
          <span className="text-xs font-normal text-warm-muted ml-1">{filtered.length}件</span>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-warm-muted">
            <p className="text-2xl mb-2">🌙</p>
            <p className="text-sm">該当する投稿がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post) => (
              <PostEmbedCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostEmbedCard({ post }: { post: Post }) {
  const date = new Date(post.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });

  return (
    <article className="card p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <CategoryBadge category={post.category} />
        <time className="text-xs text-warm-muted">{date}</time>
      </div>

      <TwitterEmbed tweetId={post.tweetId} />

      {(post.characters.length > 0 || post.tags.length > 0) && (
        <div className="mt-3 pt-3 border-t border-warm-border flex flex-wrap items-center gap-2">
          {post.characters.map((char) => (
            <span
              key={char}
              className="text-xs bg-lavender-100 text-lavender-400 px-2 py-0.5 rounded-full"
            >
              {char}
            </span>
          ))}
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs text-warm-muted">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
