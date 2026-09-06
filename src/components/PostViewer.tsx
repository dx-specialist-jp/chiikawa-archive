"use client";

import { useMemo, useRef, useState } from "react";
import type { CalendarDay, CategoryFilter, Post, SiteData } from "@/types";
import { useSiteJson } from "@/lib/client-data";
import { countByCategory } from "@/lib/categories";
import { addMonths, formatJst, formatJstDateString, toJstDateString, todayJst } from "@/lib/date";
import PostCard from "./PostCard";
import CategoryFilterBar from "./ui/CategoryFilterBar";
import EmptyState from "./ui/EmptyState";
import SectionTitle from "./ui/SectionTitle";

/** ちいかわ連載開始月（これより前には遡れない） */
const MIN_YM = "2020-01";

const DOW_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

interface PostViewerProps {
  /** 日別の投稿件数。カレンダーを即座に描画するためサーバーから受け取る。 */
  calendarData: CalendarDay[];
}

/**
 * 月カレンダー＋カテゴリ絞り込みで公式X投稿を辿るビューアー。
 *
 * 投稿本体（約500KB）は HTML に埋め込まず posts.json をクライアントから取得する。
 * 検索ページと同じファイルなのでブラウザキャッシュも共有される。
 */
export default function PostViewer({ calendarData }: PostViewerProps) {
  const today = todayJst();
  const currentYM = today.slice(0, 7);

  const [viewYM, setViewYM] = useState(currentYM);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const postListRef = useRef<HTMLDivElement>(null);

  const posts = useSiteJson<SiteData>("posts.json");

  const countByDate = useMemo(
    () => new Map(calendarData.map((day) => [day.date, day.count])),
    [calendarData]
  );

  const calendarRows = useMemo(() => {
    const [year, month] = viewYM.split("-").map(Number);
    const firstDow = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const cells: ({ date: string; count: number } | null)[] = Array(firstDow).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${viewYM}-${String(day).padStart(2, "0")}`;
      cells.push({ date, count: countByDate.get(date) ?? 0 });
    }
    while (cells.length % 7 !== 0) cells.push(null);

    return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  }, [viewYM, countByDate]);

  const monthPostCount = useMemo(
    () =>
      calendarData
        .filter((day) => day.date.startsWith(viewYM))
        .reduce((sum, day) => sum + day.count, 0),
    [calendarData, viewYM]
  );

  /** 選択中の日 / 月に属する投稿（カテゴリ絞り込み前） */
  const scopedPosts = useMemo(() => {
    if (!posts.data) return [];
    return posts.data.posts
      .filter((post) => {
        const date = toJstDateString(post.publishedAt);
        return selectedDate ? date === selectedDate : date.startsWith(viewYM);
      })
      .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  }, [posts.data, selectedDate, viewYM]);

  const categoryCounts = useMemo(() => countByCategory(scopedPosts), [scopedPosts]);

  const filtered = useMemo(
    () => (category === "all" ? scopedPosts : scopedPosts.filter((p) => p.category === category)),
    [scopedPosts, category]
  );

  const [viewYear, viewMonth] = viewYM.split("-").map(Number);
  const [minYear, minMonth] = MIN_YM.split("-").map(Number);
  const [currentYear, currentMonth] = currentYM.split("-").map(Number);
  const yearOptions = Array.from({ length: currentYear - minYear + 1 }, (_, i) => minYear + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1).filter((month) => {
    const ym = `${viewYear}-${String(month).padStart(2, "0")}`;
    return ym >= MIN_YM && ym <= currentYM;
  });

  function goToMonth(ym: string) {
    setViewYM(ym);
    setSelectedDate(null);
  }

  function handleYearChange(year: number) {
    let month = viewMonth;
    if (year === minYear && month < minMonth) month = minMonth;
    if (year === currentYear && month > currentMonth) month = currentMonth;
    goToMonth(`${year}-${String(month).padStart(2, "0")}`);
  }

  function handleDayClick(date: string) {
    const isOpening = selectedDate !== date;
    setSelectedDate(isOpening ? date : null);
    if (isOpening) {
      // state 反映後にリストの位置が確定するため、次フレームでスクロールする
      requestAnimationFrame(() =>
        postListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  }

  const selectClass =
    "bg-cream-100 border border-warm-border rounded-lg px-2 py-1 text-sm font-medium text-warm-text cursor-pointer hover:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-300";
  const arrowClass =
    "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-cream-200 disabled:opacity-30 disabled:cursor-not-allowed text-warm-text text-xl";

  const resultLabel = selectedDate
    ? formatJstDateString(selectedDate, "longDate")
    : formatJst(new Date(Date.UTC(viewYear, viewMonth - 1, 1, 12)), "yearMonth");

  return (
    <div className="space-y-6">
      {/* 月カレンダー */}
      <div className="card p-4">
        <div className="flex items-center justify-between gap-2 mb-4 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => goToMonth(addMonths(viewYM, -1))}
            disabled={viewYM <= MIN_YM}
            className={arrowClass}
            aria-label="前の月"
          >
            ‹
          </button>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <select
                value={viewYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className={selectClass}
                aria-label="年を選択"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>
              <select
                value={viewMonth}
                onChange={(e) =>
                  goToMonth(`${viewYear}-${String(Number(e.target.value)).padStart(2, "0")}`)
                }
                className={selectClass}
                aria-label="月を選択"
              >
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-warm-muted tabular-nums">
              {monthPostCount > 0 ? `${monthPostCount}件の投稿` : "投稿なし"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => goToMonth(addMonths(viewYM, 1))}
            disabled={viewYM >= currentYM}
            className={arrowClass}
            aria-label="次の月"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1" aria-hidden="true">
          {DOW_LABELS.map((label, i) => (
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
          {calendarRows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-7 gap-1">
              {row.map((cell, cellIndex) => {
                if (!cell) return <div key={cellIndex} className="h-9" />;

                const dayNumber = Number(cell.date.slice(-2));
                const isToday = cell.date === today;
                const isSelected = cell.date === selectedDate;
                const hasPost = cell.count > 0;

                return (
                  <button
                    key={cell.date}
                    type="button"
                    onClick={() => handleDayClick(cell.date)}
                    disabled={!hasPost}
                    aria-pressed={hasPost ? isSelected : undefined}
                    aria-label={`${formatJstDateString(cell.date)} ${cell.count}件`}
                    className={[
                      "h-9 rounded-lg flex items-center justify-center relative text-sm transition-colors select-none tabular-nums",
                      isSelected
                        ? "bg-mint-500 text-white font-medium"
                        : hasPost
                        ? "bg-mint-100 hover:bg-mint-200 text-mint-500 cursor-pointer"
                        : "text-warm-muted/60 cursor-default",
                      isToday && !isSelected ? "ring-2 ring-mint-400 ring-offset-1" : "",
                    ].join(" ")}
                  >
                    <span className="leading-none">{dayNumber}</span>
                    {hasPost && (
                      <span
                        aria-hidden="true"
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
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-xs text-warm-muted hover:text-warm-text underline"
            >
              月全体を表示
            </button>
          </div>
        )}
      </div>

      {/* カテゴリ絞り込み */}
      <div className="card p-4">
        <SectionTitle className="mb-3">Category</SectionTitle>
        <CategoryFilterBar
          value={category}
          onChange={setCategory}
          counts={posts.status === "ready" ? categoryCounts : undefined}
        />
      </div>

      {/* 投稿リスト */}
      <div ref={postListRef} className="scroll-mt-20">
        <SectionTitle
          floating
          className="mb-3"
          meta={posts.status === "ready" ? `${filtered.length}件` : undefined}
        >
          {resultLabel}
        </SectionTitle>

        {posts.status === "loading" ? (
          <EmptyState title="投稿を読み込んでいます…" />
        ) : posts.status === "error" ? (
          <EmptyState
            title="投稿データを読み込めませんでした"
            hint="時間をおいて再度お試しください"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              selectedDate
                ? "この日の投稿はアーカイブされていません"
                : "この月の投稿はまだアーカイブされていません"
            }
            hint={category !== "all" ? "カテゴリの絞り込みを外すと表示されることがあります" : undefined}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((post: Post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
