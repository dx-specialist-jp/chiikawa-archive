interface HeroSectionProps {
  todayCount: number;
  totalPosts: number;
  lastUpdated: string;
}

export default function HeroSection({ todayCount, totalPosts, lastUpdated }: HeroSectionProps) {
  const updatedDate = new Date(lastUpdated).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-mint-100 via-cream-100 to-lavender-100 border border-warm-border px-6 py-10 mb-8">
      {/* 装飾 */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-mint-200/30 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-8 w-24 h-24 bg-lavender-200/30 rounded-full translate-y-1/2" />
      <div className="absolute top-1/2 right-16 w-16 h-16 bg-honey-200/40 rounded-full -translate-y-1/2" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl" role="img" aria-label="望遠鏡">🔭</span>
          <span className="text-xs font-medium text-mint-500 bg-mint-100 px-2 py-0.5 rounded-full border border-mint-200">
            非公式ナレッジサイト
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-warm-text mb-1">
          ちいかわの今を観測しよう
        </h1>
        <p className="text-sm text-warm-muted mb-6">
          公式X（旧Twitter）の情報を整理・検索しやすくする非公式アーカイブ
        </p>

        <div className="flex flex-wrap gap-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/80 shadow-soft">
            <div className="text-xs text-warm-muted mb-0.5">今日の更新</div>
            <div className="text-2xl font-bold text-mint-500">
              {todayCount}
              <span className="text-sm font-normal text-warm-muted ml-1">件</span>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/80 shadow-soft">
            <div className="text-xs text-warm-muted mb-0.5">総観測数</div>
            <div className="text-2xl font-bold text-lavender-400">
              {totalPosts.toLocaleString()}
              <span className="text-sm font-normal text-warm-muted ml-1">件</span>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/80 shadow-soft">
            <div className="text-xs text-warm-muted mb-0.5">最終更新</div>
            <div className="text-sm font-semibold text-warm-text">{updatedDate}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
