interface NoteBoxProps {
  title: string;
  children: React.ReactNode;
}

/** 免責事項・補足などの控えめな注記ボックス */
export default function NoteBox({ title, children }: NoteBoxProps) {
  return (
    <aside className="bg-cream-100 border border-warm-border rounded-2xl p-4 text-xs text-warm-muted leading-relaxed">
      <p className="font-medium text-warm-text mb-1">{title}</p>
      {children}
    </aside>
  );
}
