interface SectionTitleProps {
  children: React.ReactNode;
  /** 右端に添えるカウントなどの補足 */
  meta?: React.ReactNode;
  /**
   * カードの外（背景写真の上）に置く見出しかどうか。
   * true にすると淡い下地が付き、草原の写真に重なっても読めるようになる。
   */
  floating?: boolean;
  className?: string;
}

/** カード上部やセクションの先頭に置く小見出し */
export default function SectionTitle({
  children,
  meta,
  floating = false,
  className = "",
}: SectionTitleProps) {
  return (
    <div className={`${floating ? "section-title-floating" : "section-title"} ${className}`}>
      <span>{children}</span>
      {meta != null && (
        <span className="font-normal normal-case tracking-normal text-warm-muted">{meta}</span>
      )}
    </div>
  );
}
