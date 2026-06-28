"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Archive" },
  { href: "/news", label: "News" },
  { href: "/archive", label: "Posts" },
  { href: "/rights", label: "Rights" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 bg-cream-50/96 backdrop-blur-sm border-b border-warm-border">
      <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* ブランドマーク */}
        <Link href="/" className="flex flex-col leading-none gap-0.5" onClick={() => setMenuOpen(false)}>
          <span className="font-serif text-base font-medium tracking-[0.18em] text-warm-text">
            CHIIKAWA ARCHIVE
          </span>
          <span className="text-[10px] tracking-widest text-warm-muted font-light">
            UNOFFICIAL FAN ARCHIVE
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-[11px] tracking-widest font-light transition-colors duration-200 ${
                isActive(item.href)
                  ? "text-mint-400 border-b border-mint-400"
                  : "text-warm-muted hover:text-warm-text"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={menuOpen}
        >
          <span className={`block w-5 h-px bg-warm-text transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`block w-5 h-px bg-warm-text transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-warm-text transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className={`sm:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}>
        <nav className="px-6 pb-4 flex flex-col gap-0.5 border-t border-warm-border pt-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`py-2 text-xs tracking-widest font-light transition-colors duration-200 ${
                isActive(item.href) ? "text-mint-400" : "text-warm-muted hover:text-warm-text"
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
