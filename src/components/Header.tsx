"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "観測所" },
  { href: "/archive", label: "アーカイブ" },
  { href: "/episodes", label: "図書館" },
  { href: "/rights", label: "権利者様へ" },
  { href: "/contact", label: "お問い合わせ" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-sm border-b border-warm-border shadow-soft">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
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

        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-mint-200 text-mint-500"
                    : "text-warm-muted hover:bg-cream-200 hover:text-warm-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <nav className="sm:hidden flex items-center gap-0.5">
          {navItems.slice(0, 3).map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-mint-200 text-mint-500"
                    : "text-warm-muted hover:bg-cream-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
