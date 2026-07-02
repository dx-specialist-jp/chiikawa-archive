"use client";

import { useState, useEffect } from "react";

export default function StreakBadge() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    // localStorage は SSR 時に存在しないため、ここでの読み込み・setState は
    // ハイドレーション後の一度きりの同期処理として意図的に行っている
    try {
      const today = new Date().toLocaleDateString("sv", { timeZone: "Asia/Tokyo" });
      const raw = localStorage.getItem("chiikawa_obs_visit");

      if (!raw) {
        localStorage.setItem("chiikawa_obs_visit", JSON.stringify({ date: today, count: 1 }));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStreak(1);
        return;
      }

      const { date, count } = JSON.parse(raw) as { date: string; count: number };

      if (date === today) {
        setStreak(count);
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toLocaleDateString("sv", { timeZone: "Asia/Tokyo" });
      const next = date === yStr ? count + 1 : 1;

      localStorage.setItem("chiikawa_obs_visit", JSON.stringify({ date: today, count: next }));
      setStreak(next);
    } catch {
      // localStorage 利用不可の場合は何もしない
    }
  }, []);

  if (!streak || streak < 2) return null;

  const label =
    streak >= 30
      ? `${streak}日連続！すごい！！`
      : `${streak}日連続観測中`;

  return (
    <div className="bg-honey-200 border border-honey-300 rounded-full px-3 py-1 text-xs font-bold text-warm-text animate-fade-in">
      {label}
    </div>
  );
}
