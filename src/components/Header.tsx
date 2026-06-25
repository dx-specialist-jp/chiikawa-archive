"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "観測所" },
  { href: "/news", label: "ニュース" },
  { href: "/archive", label: "アーカイブ" },
  { href: "/rights", label: "権利者様へ" },
  { href: "/contact", label: "お問い合わせ" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-sm border-b border-warm-border shadow-soft">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="text-2xl select-none" role="img" aria-label="望遠鏡">🔭</span>
          <div>
            <div className="font-bold text-warm-text text-sm leading-tight">
              ちいかわ観測所
            </div>
            <div className="text-xs text-warm-muted leading-tight">
              非公式ナレッジサイト
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                isActive(item.href)
                  ? "bg-mint-200 text-mint-500"
                  : "text-warm-muted hover:bg-cream-200 hover:text-warm-text"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-cream-200 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={menuOpen}
        >
          <span className={`block w-5 h-0.5 bg-warm-text rounded-full transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-warm-text rounded-full transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-warm-text rounded-full transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="px-4 pb-3 flex flex-col gap-1 border-t border-warm-border">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                isActive(item.href)
                  ? "bg-mint-200 text-mint-500"
                  : "text-warm-muted hover:bg-cream-200 hover:text-warm-text"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
