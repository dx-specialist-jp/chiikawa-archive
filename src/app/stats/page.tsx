import type { Metadata } from "next";
import type { CalendarDay, Post, PostCategory } from "@/types";
import { ALL_CATEGORIES, CATEGORY_LABELS } from "@/types";
import { readSiteData } from "@/lib/server-data";
import { dayOfWeek, formatJst, formatJstDateString, parseJstDate } from "@/lib/date";
import PageHeader from "@/components/ui/PageHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import EmptyState from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Stats",
  description: "ちいかわ公式X投稿の統計データと活動分析。CHIIKAWA ARCHIVE の観測データを可視化。",
};

const CATEGORY_COLORS: Record<PostCategory, string> = {
  manga: "bg-mint-400",
  anime: "bg-lavender-300",
  goods: "bg-peach-300",
  collab: "bg-honey-300",
  event: "bg-peach-200",
  other: "bg-cream-300",
};

const DOW_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const MONTHS_SHOWN = 24;
const TOP_N = 10;

/** グラフの集計結果をまとめて作る（ページ本体を読みやすく保つため分離） */
function buildStats(posts: Post[], calendarData: CalendarDay[]) {
  const monthly = new Map<string, number>();
  const dowCounts = Array<number>(7).fill(0);

  for (const day of calendarData) {
    const ym = day.date.slice(0, 7);
    monthly.set(ym, (monthly.get(ym) ?? 0) + day.count);
    dowCounts[dayOfWeek(day.date)] += day.count;
  }

  const months = [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-MONTHS_SHOWN);

  const categoryCounts = Object.fromEntries(
    ALL_CATEGORIES.map((category) => [category, 0])
  ) as Record<PostCategory, number>;
  for (const post of posts) categoryCounts[post.category]++;

  const characterCounts = new Map<string, number>();
  for (const post of posts) {
    for (const character of post.characters) {
      if (character) characterCounts.set(character, (characterCounts.get(character) ?? 0) + 1);
    }
  }

  const activeDays = calendarData.filter((day) => day.count > 0);
  const monthTotal = months.reduce((sum, [, count]) => sum + count, 0);

  return {
    months,
    maxMonthly: Math.max(...months.map(([, count]) => count), 1),
    dowCounts,
    maxDow: Math.max(...dowCounts, 1),
    categories: (Object.entries(categoryCounts) as [PostCategory, number][]).sort(
      ([, a], [, b]) => b - a
    ),
    topDays: [...activeDays].sort((a, b) => b.count - a.count).slice(0, TOP_N),
    topCharacters: [...characterCounts.entries()].sort(([, a], [, b]) => b - a).slice(0, TOP_N),
    activeDayCount: activeDays.length,
    averagePerMonth: months.length ? Math.round(monthTotal / months.length) : 0,
    // calendarData の並び順に依存しないよう最小の日付を取る
    firstObserved: activeDays.reduce(
      (earliest, day) => (earliest === "" || day.date < earliest ? day.date : earliest),
      ""
    ),
  };
}

/** 横棒1行（最多値を100%とした相対バー） */
function RankedBar({
  rank,
  label,
  value,
  unit,
  ratio,
  barClass,
  labelWidth,
}: {
  rank: number;
  label: string;
  value: number;
  unit: string;
  ratio: number;
  barClass: string;
  labelWidth: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-warm-muted w-4 text-right shrink-0 tabular-nums">{rank}</span>
      <span className={`text-xs text-warm-text shrink-0 truncate ${labelWidth}`}>{label}</span>
      <div className="flex-1 h-1.5 bg-cream-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${Math.max(ratio * 100, 2)}%` }}
        />
      </div>
      <span className="text-xs text-warm-muted shrink-0 tabular-nums w-10 text-right">
        {value}
        {unit}
      </span>
    </div>
  );
}

export default async function StatsPage() {
  const data = await readSiteData();
  const stats = buildStats(data.posts, data.calendarData);
  const categoryTotal = data.posts.length || 1;

  const summary = [
    { label: "Total Posts", value: data.totalPosts.toLocaleString(), unit: "件" },
    { label: "Active Days", value: stats.activeDayCount.toLocaleString(), unit: "日" },
    {
      label: "Avg / Month",
      value: stats.averagePerMonth ? stats.averagePerMonth.toLocaleString() : "—",
      unit: stats.averagePerMonth ? "件" : "",
    },
    {
      label: "First Observed",
      value: stats.firstObserved ? formatJstDateString(stats.firstObserved, "shortDate") : "—",
      unit: "",
    },
  ];

  if (data.posts.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <PageHeader title="Stats" description="観測データの統計と分析" />
        <EmptyState title="まだ集計できるデータがありません" hint="次回の自動更新をお待ちください" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <PageHeader title="Stats" description="観測データの統計と分析" />

      {/* サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {summary.map(({ label, value, unit }) => (
          <div key={label} className="card p-4">
            <SectionTitle className="mb-2">{label}</SectionTitle>
            <div className="text-2xl font-medium text-warm-text leading-none tabular-nums">
              {value}
              {unit && <span className="text-xs font-light text-warm-muted ml-1">{unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* 月別推移 */}
        <div className="card p-6">
          <SectionTitle className="mb-5" meta={`直近${MONTHS_SHOWN}ヶ月`}>
            Monthly Trend
          </SectionTitle>
          <div className="flex items-end gap-0.5 h-40 border-b border-warm-border">
            {stats.months.map(([ym, count]) => (
              <div
                key={ym}
                title={`${formatJst(parseJstDate(`${ym}-01`), "yearMonth")}：${count}件`}
                className="flex-1 bg-mint-200 hover:bg-mint-400 transition-colors rounded-t"
                style={{
                  height: `${(count / stats.maxMonthly) * 100}%`,
                  minHeight: count > 0 ? "3px" : "0",
                }}
              />
            ))}
          </div>
          <div className="flex gap-0.5 mt-1">
            {stats.months.map(([ym]) => {
              const month = ym.slice(5);
              const isYearStart = month === "01";
              return (
                <div key={ym} className="flex-1 text-center">
                  <span
                    className={`text-[9px] leading-none tabular-nums ${
                      isYearStart ? "text-mint-500 font-medium" : "text-warm-muted"
                    }`}
                  >
                    {isYearStart ? ym.slice(2, 4) : month}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-warm-muted mt-2 text-right tracking-wide">
            バーにカーソルを合わせると件数を表示します
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* カテゴリ別 */}
          <div className="card p-6">
            <SectionTitle className="mb-5">Category Breakdown</SectionTitle>
            <div className="space-y-3">
              {stats.categories.map(([category, count]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-warm-text">{CATEGORY_LABELS[category]}</span>
                    <span className="text-xs text-warm-muted tabular-nums">
                      {count}件 <span className="text-warm-border">·</span>{" "}
                      {Math.round((count / categoryTotal) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${CATEGORY_COLORS[category]}`}
                      style={{ width: `${(count / categoryTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 曜日別 */}
          <div className="card p-6">
            <SectionTitle className="mb-5">Day of Week</SectionTitle>
            <div className="flex items-end gap-2 h-32 border-b border-warm-border">
              {stats.dowCounts.map((count, i) => (
                <div
                  key={DOW_LABELS[i]}
                  title={`${DOW_LABELS[i]}曜：${count}件`}
                  className={`flex-1 rounded-t transition-colors ${
                    i === 0
                      ? "bg-red-200 hover:bg-red-300"
                      : i === 6
                      ? "bg-lavender-200 hover:bg-lavender-300"
                      : "bg-mint-200 hover:bg-mint-300"
                  }`}
                  style={{
                    height: `${(count / stats.maxDow) * 100}%`,
                    minHeight: count > 0 ? "3px" : "0",
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-1.5">
              {DOW_LABELS.map((label, i) => (
                <div key={label} className="flex-1 text-center">
                  <span
                    className={`text-xs font-medium ${
                      i === 0 ? "text-red-400" : i === 6 ? "text-lavender-400" : "text-warm-muted"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 最多投稿日 */}
        {stats.topDays.length > 0 && (
          <div className="card p-6">
            <SectionTitle className="mb-5">Top Active Days</SectionTitle>
            <div className="space-y-2.5">
              {stats.topDays.map((day, i) => (
                <RankedBar
                  key={day.date}
                  rank={i + 1}
                  label={formatJstDateString(day.date, "longDate")}
                  value={day.count}
                  unit="件"
                  ratio={day.count / stats.topDays[0].count}
                  barClass="bg-mint-400"
                  labelWidth="w-32"
                />
              ))}
            </div>
          </div>
        )}

        {/* キャラクター登場回数 */}
        {stats.topCharacters.length > 0 && (
          <div className="card p-6">
            <SectionTitle className="mb-5">Top Characters</SectionTitle>
            <div className="space-y-2.5">
              {stats.topCharacters.map(([character, count], i) => (
                <RankedBar
                  key={character}
                  rank={i + 1}
                  label={character}
                  value={count}
                  unit="回"
                  ratio={count / stats.topCharacters[0][1]}
                  barClass="bg-lavender-300"
                  labelWidth="w-28"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
