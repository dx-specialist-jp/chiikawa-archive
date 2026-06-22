import Link from "next/link";
import type { PostCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

const categories: {
  key: PostCategory;
  emoji: string;
  color: string;
  description: string;
}[] = [
  {
    key: "manga",
    emoji: "📖",
    color: "from-mint-100 to-mint-200 hover:from-mint-200 hover:to-mint-300",
    description: "ナガノ先生の漫画投稿",
  },
  {
    key: "goods",
    emoji: "🛍️",
    color: "from-peach-100 to-peach-200 hover:from-peach-200 hover:to-peach-300",
    description: "グッズ・商品情報",
  },
  {
    key: "anime",
    emoji: "📺",
    color: "from-lavender-100 to-lavender-200 hover:from-lavender-200 hover:to-lavender-300",
    description: "アニメ放送・配信情報",
  },
  {
    key: "collab",
    emoji: "🤝",
    color: "from-honey-100 to-honey-200 hover:from-honey-200 hover:to-honey-300",
    description: "コラボ・タイアップ情報",
  },
  {
    key: "event",
    emoji: "🎪",
    color: "from-peach-100 to-lavender-100 hover:from-peach-200 hover:to-lavender-200",
    description: "イベント・展示会情報",
  },
  {
    key: "other",
    emoji: "📌",
    color: "from-cream-200 to-cream-300 hover:from-cream-300 hover:to-cream-400",
    description: "その他のお知らせ",
  },
];

export default function CategoryGrid() {
  return (
    <div>
      <div className="section-title mb-3">
        <span>🗂️</span>
        <span>カテゴリ</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            href={`/episodes?category=${cat.key}`}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gradient-to-br
              ${cat.color} border border-white/60 shadow-soft
              transition-all duration-200 hover:shadow-card hover:-translate-y-0.5`}
          >
            <span className="text-2xl" role="img" aria-label={CATEGORY_LABELS[cat.key]}>
              {cat.emoji}
            </span>
            <span className="text-xs font-semibold text-warm-text text-center">
              {CATEGORY_LABELS[cat.key]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
