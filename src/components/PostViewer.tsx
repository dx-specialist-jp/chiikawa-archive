"use client";

import { useState, useMemo, useRef } from "react";
import type { Post, CalendarDay, PostCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import TwitterEmbed from "./TwitterEmbed";
import CategoryBadge from "./CategoryBadge";

const ALL_CATEGORIES: PostCategory[] = ["manga", "goods", "anime", "collab", "event", "other"];

// ちいかわ連載開始月（これより前には遡れない）
const MIN_YM = "2020-01";

function getJstDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("sv", { timeZone: "Asia/Tokyo" });
}

function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

interface PostViewerProps {
  posts: Post[];
  calendarData: CalendarDay[];
}

export default function PostViewer({ posts, calendarData }: PostViewerProps) {
  const todayJst = new Date().toLocaleDateString("sv", { timeZone: "Asia/Tokyo" });
  const currentYM = todayJst.slice(0, 7);

  const [viewYM, setViewYM] = useState(currentYM);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | "all">("all");
  const postListRef = useRef<HTMLDivElement>(null);

  const dataMap = useMemo(
    () => Object.fromEntries(calendarData.map((d) => [d.date, d])),
    [calendarData]
  );

  const calendarRows = useMemo(() => {
    const [y, m] = viewYM.split("-").map(Number);
    const firstDow = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();

    const cells: ({ date: string; count: number } | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYM}-${String(d).padStart(2, "0")}`;
      cells.push({ date: dateStr, count: dataMap[dateStr]?.count ?? 0 });
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: ({ date: string; count: number } | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [viewYM, dataMap]);

  const monthPostCount = useMemo(
    () => calendarData.filter((d) => d.date.startsWith(viewYM)).reduce((s, d) => s + d.count, 0),
    [calendarData, viewYM]
  );

  function handleDayClick(date: string, count: number) {
    if (count === 0) return;
    setSelectedDate((prev) => {
      if (prev !== date) {
        setTimeout(() => {
          postListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
      return prev === date ? null : date;
    });
  }

  const filtered = useMemo(() => {
    return posts
      .filter((p) => {
        const d = getJstDate(p.publishedAt);
        if (selectedDate ? d !== selectedDate : !d.startsWith(viewYM)) return false;
        if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
        return true;
      })
      .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
  }, [posts, selectedDate, viewYM, selectedCategory]);

  const [vYear, vMonth] = viewYM.split("-").map(Number);
  const viewMonthLabel = new Date(vYear, vMonth - 1, 1).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  const [minYear, minMonth] = MIN_YM.split("-").map(Number);
  const [curYear, curMonth] = currentYM.split("-").map(Number);
  const yearOptions = Array.from({ length: curYear - minYear + 1 }, (_, i) => minYear + i);

  function handleYearChange(newYear: number) {
    let month = vMonth;
    if (newYear === minYear && month < minMonth) month = minMonth;
    if (newYear === curYear && month > curMonth) month = curMonth;
    setViewYM(`${newYear}-${String(month).padStart(2, "0")}`);
    setSelectedDate(null);
  }

  function handleMonthChange(newMonth: number) {
    setViewYM(`${vYear}-${String(newMonth).padStart(2, "0")}`);
    setSelectedDate(null);
  }

  const selectClass =
    "bg-cream-100 border border-warm-border rounded-lg px-2 py-1 text-sm font-medium text-warm-text cursor-pointer hover:bg-cream-200 focus:outline-none focus:ring-2 focus:ring-mint-300";

  const resultLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00+09:00").toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Tokyo",
      })
    : viewMonthLabel;

  const DOW = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="space-y-6">
      {/* Month Calendar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { setViewYM(addMonths(viewYM, -1)); setSelectedDate(null); }}
            disabled={viewYM <= MIN_YM}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-cream-200 disabled:opacity-30 disabled:cursor-not-allowed text-warm-text text-xl font-bold"
            aria-label="前の月"
          >
            ‹
          </button>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <select
                value={vYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className={selectClass}
                aria-label="年を選択"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
              <select
                value={vMonth}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className={selectClass}
                aria-label="月を選択"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1)
                  .filter((m) => {
                    const ym = `${vYear}-${String(m).padStart(2, "0")}`;
                    return ym >= MIN_YM && ym <= currentYM;
                  })
                  .map((m) => (
                    <option key={m} value={m}>{m}月</option>
                  ))}
              </select>
            </div>
            <p className="text-xs text-warm-muted">
              {monthPostCount > 0 ? `${monthPostCount}件の投稿` : "投稿なし"}
            </p>
          </div>

          <button
            onClick={() => { setViewYM(addMonths(viewYM, 1)); setSelectedDate(null); }}
            disabled={viewYM >= currentYM}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-cream-200 disabled:opacity-30 disabled:cursor-not-allowed text-warm-text text-xl font-bold"
            aria-label="次の月"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DOW.map((label, i) => (
            <div
              key={label}
              className={`text-center text-xs py-1 font-medium ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-warm-muted"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {calendarRows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-7 gap-1">
              {row.map((cell, ci) => {
                if (!cell) return <div key={ci} className="h-9" />;
                const dayNum = parseInt(cell.date.slice(-2));
                const isToday = cell.date === todayJst;
                const isSelected = cell.date === selectedDate;
                const hasPost = cell.count > 0;
                return (
                  <button
                    key={ci}
                    type="button"
                    onClick={() => handleDayClick(cell.date, cell.count)}
                    disabled={!hasPost}
                    title={hasPost ? `${cell.date}：${cell.count}件` : cell.date}
                    className={[
                      "h-9 rounded-lg flex flex-col items-center justify-center relative text-sm transition-colors select-none",
                      isSelected
                        ? "bg-mint-500 text-white"
                        : hasPost
                        ? "bg-mint-100 hover:bg-mint-200 text-mint-500 cursor-pointer"
                        : "text-warm-muted cursor-default",
                      isToday && !isSelected ? "ring-2 ring-mint-400 ring-offset-1" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className="leading-none text-sm">{dayNum}</span>
                    {hasPost && (
                      <span
                        className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                          isSelected ? "bg-white" : "bg-mint-400"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {selectedDate && (
          <div className="mt-3 text-center">
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-warm-muted hover:text-warm-text underline"
            >
              月全体を表示
            </button>
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="card p-4">
        <div className="section-title mb-3">Category</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-mint-200 text-mint-500"
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
                  ? "bg-mint-200 text-mint-500"
                  : "bg-cream-100 text-warm-muted hover:bg-cream-200"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Post list */}
      <div ref={postListRef}>
        <div className="section-title mb-3">
          <span>{resultLabel}</span>
          <span className="font-normal normal-case text-warm-muted">{filtered.length}件</span>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-warm-muted">
            <p className="text-sm">この月の投稿はまだアーカイブされていません</p>
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

      <TwitterEmbed tweetId={post.tweetId} url={post.url} photoUrl={post.photoUrl} />

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
