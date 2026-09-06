interface EmptyStateProps {
  /** 主メッセージ */
  title: string;
  /** 補足の一行 */
  hint?: React.ReactNode;
}

/** 検索結果ゼロ・データ未取得などの空状態カード */
export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div className="card p-10 text-center animate-fade-in">
      <p className="text-sm text-warm-text">{title}</p>
      {hint && <p className="text-xs text-warm-muted mt-1.5 font-light">{hint}</p>}
    </div>
  );
}
