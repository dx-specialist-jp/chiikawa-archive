"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE } from "@/lib/site";

const NAV_ITEMS = [
  { href: "/", label: "Archive", description: "トップ" },
  { href: "/news", label: "News", description: "最新ニュース" },
  { href: "/archive", label: "Posts", description: "投稿アーカイブ" },
  { href: "/gallery", label: "Gallery", description: "ファン投稿" },
  { href: "/search", label: "Search", description: "検索" },
  { href: "/stats", label: "Stats", description: "統計" },
  { href: "/rights", label: "Rights", description: "権利について" },
  { href: "/contact", label: "Contact", description: "お問い合わせ" },
];

export default function Header() {
  const pathname = usePathname();
  // 「どのページで開いたか」を持つことで、戻る操作を含むページ遷移で
  // メニューが自動的に閉じる（副作用なしに描画時点で導出できる）
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const menuOpen = openedOn === pathname;

  function isCurrent(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 bg-cream-50/96 backdrop-blur-sm border-b border-warm-border">
      <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex flex-col leading-none gap-0.5 shrink-0">
          <span className="font-serif text-base font-medium tracking-[0.18em] text-warm-text">
            {SITE.name}
          </span>
          <span className="text-[10px] tracking-widest text-warm-muted font-light">
            {SITE.tagline}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5" aria-label="メインメニュー">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              title={item.description}
              className={`px-3 py-1.5 text-[11px] tracking-widest font-light border-b transition-colors duration-200 ${
                isCurrent(item.href)
                  ? "text-mint-400 border-mint-400"
                  : "text-warm-muted border-transparent hover:text-warm-text hover:border-warm-border"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 shrink-0"
          onClick={() => setOpenedOn(menuOpen ? null : pathname)}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          <span
            className={`block w-5 h-px bg-warm-text transition-transform duration-200 ${
              menuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`block w-5 h-px bg-warm-text transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-px bg-warm-text transition-transform duration-200 ${
              menuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!menuOpen}
        className="md:hidden border-t border-warm-border animate-fade-in"
      >
        <nav className="px-6 py-2" aria-label="メインメニュー（モバイル）">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              className={`flex items-baseline justify-between gap-3 py-2.5 border-b border-warm-border/60 last:border-0 transition-colors ${
                isCurrent(item.href) ? "text-mint-400" : "text-warm-muted hover:text-warm-text"
              }`}
            >
              <span className="text-xs tracking-widest font-light">{item.label}</span>
              <span className="text-[10px] text-warm-muted">{item.description}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
