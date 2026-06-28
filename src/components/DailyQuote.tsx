"use client";

import { useState, useEffect } from "react";

const QUOTES = [
  { text: "なにか頑張ったなあ…えらい", speaker: "ちいかわ" },
  { text: "えらいえらい！！", speaker: "ハチワレ" },
  { text: "うれしい～！", speaker: "ちいかわ" },
  { text: "かわいいね…かわいいね…！", speaker: "ハチワレ" },
  { text: "ここにいるよ", speaker: "グレーの子" },
  { text: "いっしょにいようね", speaker: "うさぎ" },
  { text: "がんばれるよ！もっとがんばれるよ！", speaker: "うさぎ" },
  { text: "ぬくぬく…", speaker: "ちいかわ" },
  { text: "また来てくれた！！", speaker: "グレーの子" },
  { text: "ご飯、食べた？", speaker: "ハチワレ" },
  { text: "今日もかわいい", speaker: "ハチワレ" },
  { text: "お疲れ様でした", speaker: "くりまんじゅう" },
  { text: "きょうも観測できた！！", speaker: "グレーの子" },
  { text: "みんなだいすき", speaker: "ちいかわ" },
  { text: "もふもふしたい…", speaker: "ちいかわ" },
  { text: "がんばってるね", speaker: "ハチワレ" },
  { text: "またね！！", speaker: "うさぎ" },
  { text: "かわいいものが好きです", speaker: "ちいかわ" },
  { text: "にょ", speaker: "うさぎ" },
  { text: "えらい！えらい！えらい！", speaker: "うさぎ" },
  { text: "ちいかわ好き？わたしも好き", speaker: "グレーの子" },
  { text: "くいーん！", speaker: "うさぎ" },
  { text: "今日の観測、どうだった？", speaker: "グレーの子" },
  { text: "ありがとう～！！", speaker: "ちいかわ" },
  { text: "いい夢見てね", speaker: "ハチワレ" },
  { text: "なんかすごいもの見た", speaker: "ちいかわ" },
  { text: "一緒に観測しよう", speaker: "グレーの子" },
  { text: "今日もちいかわがかわいかった", speaker: "観測員" },
  { text: "おはよう！！元気にしてた？", speaker: "うさぎ" },
  { text: "かわいい…かわいいが過ぎる…", speaker: "ハチワレ" },
  { text: "すき……", speaker: "ちいかわ" },
];

export default function DailyQuote() {
  const [quote, setQuote] = useState<(typeof QUOTES)[0] | null>(null);

  useEffect(() => {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
    setQuote(QUOTES[dayOfYear % QUOTES.length]);
  }, []);

  if (!quote) return null;

  return (
    <div className="card p-4 animate-fade-in">
      <div className="section-title mb-3">
        <span>💬</span>
        <span>今日の一言</span>
      </div>
      <div className="bg-cream-50 rounded-2xl p-3 border border-warm-border">
        <p className="text-sm text-warm-text font-medium leading-relaxed">
          「{quote.text}」
        </p>
        <p className="text-xs text-warm-muted mt-1.5 text-right">— {quote.speaker}</p>
      </div>
    </div>
  );
}
