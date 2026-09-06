interface BulletListProps {
  items: string[];
  className?: string;
}

/** 取り組み・ガイドラインなどを並べる、丸印つきのリスト */
export default function BulletList({ items, className = "" }: BulletListProps) {
  return (
    <ul className={`space-y-2.5 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-warm-text leading-relaxed">
          <span
            aria-hidden="true"
            className="w-4 h-4 rounded-full border border-mint-400 flex items-center justify-center shrink-0 mt-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-mint-400" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
