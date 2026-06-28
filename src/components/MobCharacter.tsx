"use client";

import { useState, useCallback } from "react";

const PHRASES = [
  "がんばれ！！",
  "えらい！えらい！",
  "また来てくれた！！",
  "いっしょに観測しよう",
  "うれしい～！",
  "ぬくぬく...",
  "みんなだいすき",
  "更新きてるかな？",
  "ちいかわ見た？",
  "今日もよろしくね",
  "ちいかわすきです",
  "かわいい〜！",
  "おつかれ！！",
  "ここにいるよ",
  "にょ",
  "えらい！えらい！えらい！",
  "ちいかわ好き？わたしも好き",
  "くいーん！",
  "なんかすごいもの見た",
];

interface MobCharacterProps {
  size?: number;
  className?: string;
}

export default function MobCharacter({ size = 80, className = "" }: MobCharacterProps) {
  const [phrase, setPhrase] = useState<string | null>(null);
  const [bounce, setBounce] = useState(false);

  const handleClick = useCallback(() => {
    const next = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    setPhrase(next);
    setBounce(true);
    setTimeout(() => setBounce(false), 300);
    setTimeout(() => setPhrase(null), 2800);
  }, []);

  const height = Math.round(size * 1.15);

  return (
    <div
      className={`relative inline-flex flex-col items-center cursor-pointer select-none ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-label="グレーの子（クリックするとセリフが出るよ）"
    >
      {/* 吹き出し（キャラクターの上） */}
      <div className="min-h-[38px] flex items-end justify-center mb-0.5">
        {phrase && (
          <div className="relative bg-white border-2 border-warm-border rounded-2xl px-3 py-1.5 text-xs font-bold text-warm-text whitespace-nowrap shadow-soft animate-scale-in">
            {phrase}
            {/* 吹き出しの三角（下向き） */}
            <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-warm-border rotate-45" />
          </div>
        )}
      </div>

      {/* SVG キャラクター */}
      <svg
        width={size}
        height={height}
        viewBox="0 0 100 115"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-150 ${bounce ? "scale-110" : "hover:scale-105"}`}
        aria-hidden="true"
      >
        {/* 耳（左） */}
        <ellipse cx="32" cy="22" rx="12" ry="15" fill="#9BA5B0" />
        <ellipse cx="32" cy="24" rx="7" ry="10" fill="#BEC8D0" />
        {/* 耳（右） */}
        <ellipse cx="68" cy="22" rx="12" ry="15" fill="#9BA5B0" />
        <ellipse cx="68" cy="24" rx="7" ry="10" fill="#BEC8D0" />
        {/* 頭 */}
        <circle cx="50" cy="50" r="28" fill="#9BA5B0" />
        {/* 体 */}
        <ellipse cx="50" cy="86" rx="26" ry="24" fill="#9BA5B0" />
        {/* 目（左） */}
        <circle cx="40" cy="49" r="6" fill="#1C1C2E" />
        <circle cx="42" cy="47" r="2.2" fill="white" />
        {/* 目（右） */}
        <circle cx="60" cy="49" r="6" fill="#1C1C2E" />
        <circle cx="62" cy="47" r="2.2" fill="white" />
        {/* 鼻 */}
        <ellipse cx="50" cy="58" rx="2.8" ry="2.2" fill="#7E8E9E" />
        {/* 口 */}
        <path d="M 44 63 Q 50 67.5 56 63" stroke="#7E8E9E" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* 腕（左） */}
        <ellipse cx="27" cy="84" rx="10" ry="6" fill="#9BA5B0" transform="rotate(-28 27 84)" />
        {/* 腕（右） */}
        <ellipse cx="73" cy="84" rx="10" ry="6" fill="#9BA5B0" transform="rotate(28 73 84)" />
        {/* 足（左） */}
        <ellipse cx="39" cy="107" rx="13" ry="8.5" fill="#9BA5B0" />
        {/* 足（右） */}
        <ellipse cx="61" cy="107" rx="13" ry="8.5" fill="#9BA5B0" />
      </svg>
    </div>
  );
}
