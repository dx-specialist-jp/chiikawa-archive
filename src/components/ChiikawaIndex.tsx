import type { ChiikawaIndex as ChiikawaIndexType } from "@/types";

interface ChiikawaIndexProps {
  data: ChiikawaIndexType;
}

const moodConfig = {
  happy: { emoji: "☀️", color: "from-honey-100 to-peach-100", barColor: "bg-honey-300" },
  sad: { emoji: "🌧️", color: "from-lavender-100 to-cream-100", barColor: "bg-lavender-300" },
  exciting: { emoji: "⚡", color: "from-mint-100 to-honey-100", barColor: "bg-mint-300" },
  calm: { emoji: "🌿", color: "from-mint-100 to-cream-100", barColor: "bg-mint-300" },
  mixed: { emoji: "🌈", color: "from-lavender-100 to-mint-100", barColor: "bg-lavender-300" },
};

export default function ChiikawaIndex({ data }: ChiikawaIndexProps) {
  const config = moodConfig[data.mood];

  return (
    <div className={`card p-4 bg-gradient-to-br ${config.color}`}>
      <div className="section-title mb-3">
        <span>{config.emoji}</span>
        <span>ちいかわ指数</span>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <div className="text-4xl font-bold text-warm-text">{data.score}</div>
        <div className="mb-1">
          <div className="text-xs text-warm-muted">/ 100</div>
          <div className="font-semibold text-warm-text text-sm">{data.label}</div>
        </div>
      </div>

      <div className="w-full bg-white/50 rounded-full h-2 mb-3">
        <div
          className={`${config.barColor} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${data.score}%` }}
        />
      </div>

      <p className="text-xs text-warm-muted leading-relaxed">{data.description}</p>

      <p className="text-xs text-warm-muted/60 mt-2">
        ※ 直近投稿の感情分析による独自指標です
      </p>
    </div>
  );
}
