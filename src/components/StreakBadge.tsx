"use client";

import { useEffect, useState } from "react";
import { toJstDateString, todayJst } from "@/lib/date";

const STORAGE_KEY = "chiikawa_obs_visit";

interface VisitRecord {
  date: string;
  count: number;
}

/** 前回の訪問記録から、今日時点の連続訪問日数を求める */
function nextStreak(previous: VisitRecord | null, today: string): number {
  if (!previous) return 1;
  if (previous.date === today) return previous.count;

  const yesterday = toJstDateString(Date.now() - 86_400_000);
  return previous.date === yesterday ? previous.count + 1 : 1;
}

/** 連続で見に来た日数を表示するバッジ。記録は端末の localStorage にのみ保存する。 */
export default function StreakBadge() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    // localStorage は SSR 時に存在しないため、ハイドレーション後に一度だけ読み書きする
    try {
      const today = todayJst();
      const raw = localStorage.getItem(STORAGE_KEY);
      const previous = raw ? (JSON.parse(raw) as VisitRecord) : null;
      const count = nextStreak(previous, today);

      if (previous?.date !== today) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }));
      }
      // 端末ローカルの値をハイドレーション後に一度だけ反映する意図的な同期処理
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStreak(count);
    } catch {
      // プライベートブラウジング等で localStorage が使えない場合は何も表示しない
    }
  }, []);

  if (streak === null || streak < 2) return null;

  return (
    <div className="bg-honey-200 border border-honey-300 rounded-full px-3 py-1 text-xs font-medium text-warm-text animate-fade-in">
      {streak >= 30 ? `${streak}日連続！すごい！！` : `${streak}日連続観測中`}
    </div>
  );
}
