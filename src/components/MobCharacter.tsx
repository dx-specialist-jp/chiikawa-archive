"use client";

import { useState, useCallback } from "react";

const PHRASES = [
  "がんばれ",
  "えらいね",
  "また来てくれた",
  "いっしょに観測しよう",
  "うれしい",
  "ぬくぬく",
  "みんなが好き",
  "更新きてるかな",
  "ちいかわ、見た？",
  "今日もよろしく",
  "すき",
  "おつかれ",
  "ここにいるよ",
  "いい日でありますように",
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
    setTimeout(() => setBounce(false), 250);
    setTimeout(() => setPhrase(null), 2600);
  }, []);

  const height = Math.round(size * 1.15);

  return (
    <div
      className={`relative inline-flex flex-col items-center cursor-pointer select-none ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-label="キャラクターをクリック"
    >
      {/* 吹き出し */}
      <div className="min-h-[30px] flex items-end justify-center mb-1">
        {phrase && (
          <div className="relative bg-white border border-warm-border rounded-xl px-3 py-1 text-xs text-warm-muted whitespace-nowrap shadow-soft animate-scale-in tracking-wide">
            {phrase}
            <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-warm-border rotate-45" />
          </div>
        )}
      </div>

      {/* SVG — シルエット型（B） */}
      <svg
        width={size}
        height={height}
        viewBox="0 0 100 115"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-200 ${bounce ? "scale-105" : "hover:scale-[1.03]"}`}
        aria-hidden="true"
      >
        {/* 耳（左） */}
        <ellipse cx="30" cy="24" rx="11" ry="15" fill="#2E3E4C"/>
        <ellipse cx="30" cy="26" rx="6.5" ry="9.5" fill="#6A8898"/>
        {/* 耳（右） */}
        <ellipse cx="70" cy="24" rx="11" ry="15" fill="#2E3E4C"/>
        <ellipse cx="70" cy="26" rx="6.5" ry="9.5" fill="#6A8898"/>
        {/* 頭 */}
        <circle cx="50" cy="50" r="27" fill="#2E3E4C"/>
        {/* 体 */}
        <ellipse cx="50" cy="87" rx="28" ry="23" fill="#2E3E4C"/>
        {/* 目（白い三日月） */}
        <path d="M 37 48 Q 42 54 47 48"
              stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M 53 48 Q 58 54 63 48"
              stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* 鼻 */}
        <circle cx="50" cy="57" r="1.8" fill="#6A8898"/>
        {/* 口 */}
        <path d="M 44 63 Q 50 66.5 56 63"
              stroke="#6A8898" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        {/* 腕（左） */}
        <ellipse cx="23" cy="84" rx="9" ry="13" fill="#2E3E4C"/>
        {/* 腕（右） */}
        <ellipse cx="77" cy="84" rx="9" ry="13" fill="#2E3E4C"/>
        {/* 足（左） */}
        <ellipse cx="37" cy="108" rx="13" ry="7.5" fill="#2E3E4C"/>
        {/* 足（右） */}
        <ellipse cx="63" cy="108" rx="13" ry="7.5" fill="#2E3E4C"/>
      </svg>
    </div>
  );
}
