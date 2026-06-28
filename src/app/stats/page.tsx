import { promises as fs } from "fs";
import path from "path";
import type { Metadata } from "next";
import type { SiteData, PostCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

export const metadata: Metadata = {
  title: "Stats",
  description: "ちいかわ公式X投稿の統計データと活動分析。CHIIKAWA ARCHIVE の観測データを可視化。",
};

const CATEGORY_COLORS: Record<PostCategory, string> = {
  manga:  "bg-mint-400",
  anime:  "bg-lavender-300",
  goods:  "bg-peach-300",
  collab: "bg-honey-300",
  event:  "bg-peach-200",
  other:  "bg-cream-300",
};

async function getData(): Promise<SiteData> {
  const filePath = path.join(process.cwd(), "public", "data", "posts.json");
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as SiteData;
}

export default async function StatsPage() {
  const data = await getData();
  const { posts, calendarData } = data;

  // 月別投稿数（直近24ヶ月）
  const monthlyMap: Record<string, number> = {};
  for (const day of calendarData) {
    const ym = day.date.slice(0, 7);
    monthlyMap[ym] = (monthlyMap[ym] ?? 0) + day.count;
  }
  const sortedMonths = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-24);
  const maxMonthly = Math.max(...sortedMonths.map(([, c]) => c), 1);

  // カテゴリ別
  const categoryMap: Record<PostCategory, number> = {
    manga: 0, goods: 0, anime: 0, collab: 0, event: 0, other: 0,
  };
  for (const post of posts) categoryMap[post.category]++;
  const categoryEntries = (Object.entries(categoryMap) as [PostCategory, number][])
    .sort(([, a], [, b]) => b - a);
  const categoryTotal = posts.length || 1;

  // 曜日別
  const dowMap: number[] = Array(7).fill(0);
  for (const day of calendarData) {
    const d = new Date(day.date + "T00:00:00");
    dowMap[d.getDay()] += day.count;
  }
  const maxDow = Math.max(...dowMap, 1);
  const DOW_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

  // TOP 10 最多投稿日
  const top10Days = [...calendarData]
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // キャラクター登場回数
  const charMap: Record<string, number> = {};
  for (const post of posts) {
    for (const char of post.characters ?? []) {
      if (char) charMap[char] = (charMap[char] ?? 0) + 1;
    }
  }
  const topChars = Object.entries(charMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // 活動日数
  const activeDays = calendarData.filter((d) => d.count > 0).length;
  const firstDate = calendarData.find((d) => d.count > 0)?.date ?? "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-xl font-serif text-warm-text tracking-wide mb-1">Stats</h1>
        <p className="text-sm text-warm-muted">観測データの統計と分析</p>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Posts", value: data.totalPosts.toLocaleString(), unit: "件" },
          { label: "Active Days",  value: activeDays.toLocaleString(), unit: "日" },
          { label: "Avg / Month",
            value: sortedMonths.length
              ? Math.round(sortedMonths.reduce((s, [, c]) => s + c, 0) / sortedMonths.length).toString()
              : "—",
            unit: "件" },
          { label: "First Observed",
            value: firstDate
              ? new Date(firstDate + "T00:00:00").toLocaleDateString("ja-JP", { year: "numeric", month: "short" })
              : "—",
            unit: "" },
        ].map(({ label, value, unit }) => (
          <div key={label} className="card p-4">
            <div className="section-title mb-2">{label}</div>
            <div className="text-2xl font-medium text-warm-text leading-none">
              {value}
              {unit && <span className="text-xs font-light text-warm-muted ml-1">{unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* 月別推移 */}
        <div className="card p-6">
          <div className="section-title mb-5">Monthly Trend</div>
          <div className="flex items-end gap-0.5 h-40 border-b border-warm-border">
            {sortedMonths.map(([ym, count]) => {
              const pct = Math.round((count / maxMonthly) * 100);
              return (
                <div
                  key={ym}
                  title={`${ym}: ${count}件`}
                  className="flex-1 bg-mint-200 hover:bg-mint-400 transition-colors rounded-t"
                  style={{ height: `${pct}%`, minHeight: count > 0 ? "3px" : "0" }}
                />
              );
            })}
          </div>
          <div className="flex gap-0.5 mt-1">
            {sortedMonths.map(([ym]) => {
              const month = ym.slice(5);
              const isLabelYear = month === "01";
              return (
                <div key={ym} className="flex-1 text-center">
                  <span className={`text-[9px] leading-none ${isLabelYear ? "text-mint-500 font-medium" : "text-warm-muted"}`}>
                    {isLabelYear ? ym.slice(2, 4) : month}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-warm-muted mt-2 text-right tracking-wide">直近24ヶ月 — バーにカーソルで件数表示</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* カテゴリ別 */}
          <div className="card p-6">
            <div className="section-title mb-5">Category Breakdown</div>
            <div className="space-y-3">
              {categoryEntries.map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-warm-text">{CATEGORY_LABELS[cat]}</span>
                    <span className="text-xs text-warm-muted">
                      {count}件 <span className="text-warm-border">·</span> {Math.round(count / categoryTotal * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${CATEGORY_COLORS[cat]} rounded-full`}
                      style={{ width: `${count / categoryTotal * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 曜日別 */}
          <div className="card p-6">
            <div className="section-title mb-5">Day of Week</div>
            <div className="flex items-end gap-2 h-32 border-b border-warm-border">
              {dowMap.map((count, i) => {
                const pct = Math.round((count / maxDow) * 100);
                const colorBar = i === 0 ? "bg-red-200 hover:bg-red-300" : i === 6 ? "bg-lavender-200 hover:bg-lavender-300" : "bg-mint-200 hover:bg-mint-300";
                return (
                  <div
                    key={i}
                    title={`${DOW_LABELS[i]}: ${count}件`}
                    className={`flex-1 rounded-t transition-colors ${colorBar}`}
                    style={{ height: `${pct}%`, minHeight: count > 0 ? "3px" : "0" }}
                  />
                );
              })}
            </div>
            <div className="flex gap-2 mt-1.5">
              {DOW_LABELS.map((label, i) => {
                const colorLabel = i === 0 ? "text-red-400" : i === 6 ? "text-lavender-400" : "text-warm-muted";
                return (
                  <div key={i} className="flex-1 text-center">
                    <span className={`text-xs font-medium ${colorLabel}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* TOP 10 最多投稿日 */}
        <div className="card p-6">
          <div className="section-title mb-5">Top Active Days</div>
          <div className="space-y-2.5">
            {top10Days.map((day, i) => {
              const date = new Date(day.date + "T00:00:00").toLocaleDateString("ja-JP", {
                year: "numeric", month: "long", day: "numeric",
              });
              const pct = Math.round((day.count / top10Days[0].count) * 100);
              return (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-xs text-warm-muted w-4 text-right shrink-0 tabular-nums">{i + 1}</span>
                  <span className="text-xs text-warm-text w-32 shrink-0">{date}</span>
                  <div className="flex-1 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                    <div className="h-full bg-mint-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-warm-muted shrink-0 tabular-nums w-10 text-right">{day.count}件</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* キャラクター登場回数 */}
        {topChars.length > 0 && (
          <div className="card p-6">
            <div className="section-title mb-5">Top Characters</div>
            <div className="space-y-2.5">
              {topChars.map(([char, count], i) => {
                const pct = Math.round((count / topChars[0][1]) * 100);
                return (
                  <div key={char} className="flex items-center gap-3">
                    <span className="text-xs text-warm-muted w-4 text-right shrink-0 tabular-nums">{i + 1}</span>
                    <span className="text-xs text-warm-text w-28 shrink-0">{char}</span>
                    <div className="flex-1 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                      <div className="h-full bg-lavender-300 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-warm-muted shrink-0 tabular-nums w-10 text-right">{count}回</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
