import StreakBadge from "./StreakBadge";

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
    timeZone: "Asia/Tokyo",
  });

  return (
    <section className="relative rounded-3xl bg-cream-100 border border-warm-border px-8 py-10 mb-8 animate-fade-in-up overflow-hidden">
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-warm-border to-transparent" />
      <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-warm-border to-transparent" />

      <p className="text-[10px] tracking-[0.2em] text-warm-muted mb-5 animate-fade-in-up font-light" style={{ animationDelay: "60ms" }}>
        UNOFFICIAL FAN ARCHIVE
      </p>

      <h1 className="text-2xl sm:text-3xl font-serif text-warm-text mb-2 leading-snug tracking-wide animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        ちいかわの今を、ここで。
      </h1>
      <p className="text-sm text-warm-muted mb-8 leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: "180ms" }}>
        公式X（旧Twitter）の情報を整理・検索しやすくする非公式アーカイブ
      </p>

      <div className="flex flex-wrap items-end gap-x-8 gap-y-4 animate-fade-in-up" style={{ animationDelay: "240ms" }}>
        <div className="border-l border-mint-400 pl-4">
          <div className="text-xs text-warm-muted mb-0.5 tracking-wide">今日の更新</div>
          <div className="text-xl font-medium text-warm-text">
            {todayCount}
            <span className="text-xs font-light text-warm-muted ml-1.5">件</span>
          </div>
        </div>
        <div className="border-l border-lavender-300 pl-4">
          <div className="text-xs text-warm-muted mb-0.5 tracking-wide">総観測数</div>
          <div className="text-xl font-medium text-warm-text">
            {totalPosts.toLocaleString()}
            <span className="text-xs font-light text-warm-muted ml-1.5">件</span>
          </div>
        </div>
        <div className="border-l border-warm-border pl-4">
          <div className="text-xs text-warm-muted mb-0.5 tracking-wide">最終投稿</div>
          <div className="text-sm font-light text-warm-text">{updatedDate}</div>
        </div>
        <StreakBadge />
      </div>
    </section>
  );
}
