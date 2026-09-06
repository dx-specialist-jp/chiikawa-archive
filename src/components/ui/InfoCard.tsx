interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  /** ページ内で目を引かせたいカードを淡いグラデーションにする */
  highlight?: boolean;
  className?: string;
}

/** 見出しつきの本文カード */
export default function InfoCard({
  title,
  children,
  highlight = false,
  className = "",
}: InfoCardProps) {
  return (
    <section
      className={`card p-6 ${
        highlight ? "bg-gradient-to-br from-lavender-100 to-cream-100" : ""
      } ${className}`}
    >
      <h2 className="font-medium text-warm-text mb-4 tracking-wide">{title}</h2>
      {children}
    </section>
  );
}
