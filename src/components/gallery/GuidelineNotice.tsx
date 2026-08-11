import Link from "next/link";

export default function GuidelineNotice() {
  return (
    <div className="card p-6 bg-gradient-to-br from-lavender-100 to-cream-100">
      <h2 className="font-medium text-warm-text mb-3 tracking-wide">投稿ガイドライン</h2>
      <ul className="space-y-2.5">
        {[
          "アカウント登録は不要です(写真をアップロードするだけで投稿できます)",
          "自分が購入したグッズ・自分が参加したイベントの個人的な記念写真に限ります",
          "他人の写真やスクリーンショット、公式イラストの転載はご遠慮ください",
          "他人の顔や個人情報が写り込まないようご配慮ください",
          "投稿（画像・コメント）は自動的に公開されます。不適切な内容は管理者が確認後に削除する場合があります",
          "非商用・ファン活動の範囲内でのご利用に限ります",
        ].map((text) => (
          <li key={text} className="flex items-start gap-3 text-sm text-warm-text">
            <span className="w-4 h-4 rounded-full border border-mint-400 flex items-center justify-center shrink-0 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-mint-400" />
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-warm-muted mt-4 leading-relaxed">
        権利者様からの削除依頼は
        <Link href="/rights" className="text-mint-500 hover:underline mx-1">
          権利者様へ
        </Link>
        のページの窓口より承ります。
      </p>
    </div>
  );
}
