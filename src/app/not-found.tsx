import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  description: "お探しのページは見つかりませんでした。",
  robots: { index: false, follow: true },
};

const DESTINATIONS = [
  { href: "/", label: "Archive Top", description: "今日の更新と最近の投稿" },
  { href: "/archive", label: "Post Archive", description: "カレンダーから過去の投稿を辿る" },
  { href: "/search", label: "Search", description: "キャラクター名・タグで探す" },
  { href: "/news", label: "Latest News", description: "ちいかわ関連の最新ニュース" },
];

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="mb-8 animate-fade-in-up">
        <p className="text-[10px] tracking-[0.2em] text-warm-muted mb-3 font-light">404 NOT FOUND</p>
        <h1 className="text-xl font-serif text-warm-text tracking-wide mb-2">
          ページが見つかりませんでした
        </h1>
        <p className="text-sm text-warm-muted leading-relaxed">
          URLが変更されたか、削除された可能性があります。
          お探しの内容は下のページから見つかるかもしれません。
        </p>
      </div>

      <nav className="card divide-y divide-warm-border overflow-hidden" aria-label="主なページ">
        {DESTINATIONS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-baseline justify-between gap-4 p-4 hover:bg-cream-100 transition-colors"
          >
            <span className="text-sm text-warm-text tracking-wide">{item.label}</span>
            <span className="text-xs text-warm-muted text-right">{item.description}</span>
          </Link>
        ))}
      </nav>

      <p className="text-xs text-warm-muted mt-6 leading-relaxed">
        リンク切れを見つけた場合は
        <Link href="/contact" className="text-mint-500 hover:underline mx-1">
          Contact
        </Link>
        よりお知らせいただけると助かります。
      </p>
    </div>
  );
}
