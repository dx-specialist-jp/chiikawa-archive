interface TagListProps {
  characters?: string[];
  tags?: string[];
  /** 上に区切り線を引いてカード本文と分ける */
  divided?: boolean;
  className?: string;
}

/** 投稿・記事に付くキャラクター名とタグのチップ列 */
export default function TagList({
  characters = [],
  tags = [],
  divided = false,
  className = "",
}: TagListProps) {
  if (characters.length === 0 && tags.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 ${
        divided ? "mt-3 pt-3 border-t border-warm-border" : ""
      } ${className}`}
    >
      {characters.map((char) => (
        <span
          key={char}
          className="text-xs bg-lavender-100 text-lavender-400 px-2 py-0.5 rounded-full"
        >
          {char}
        </span>
      ))}
      {tags.map((tag) => (
        <span key={tag} className="text-xs text-warm-muted">
          #{tag}
        </span>
      ))}
    </div>
  );
}
