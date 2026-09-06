interface PageHeaderProps {
  /** ページ見出し（英字のセクション名） */
  title: string;
  /** 見出し下の補足説明 */
  description?: string;
  children?: React.ReactNode;
}

/** 各ページ共通の見出しブロック */
export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-6 animate-fade-in-up">
      <h1 className="text-xl font-serif text-warm-text tracking-wide">{title}</h1>
      {description && (
        <p className="text-sm text-warm-muted mt-1 leading-relaxed">{description}</p>
      )}
      {children}
    </div>
  );
}
