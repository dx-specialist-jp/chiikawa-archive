import Link from "next/link";
import InfoCard from "@/components/ui/InfoCard";
import BulletList from "@/components/ui/BulletList";

const GUIDELINES = [
  "アカウント登録は不要です（写真をアップロードするだけで投稿できます）",
  "自分が購入したグッズ・自分が参加したイベントの個人的な記念写真に限ります",
  "他人の写真やスクリーンショット、公式イラストの転載はご遠慮ください",
  "他人の顔や個人情報が写り込まないようご配慮ください",
  "投稿（画像・コメント）は自動的に公開されます。不適切な内容は管理者が確認後に削除する場合があります",
  "非商用・ファン活動の範囲内でのご利用に限ります",
];

export default function GuidelineNotice() {
  return (
    <InfoCard title="投稿ガイドライン" highlight>
      <BulletList items={GUIDELINES} />
      <p className="text-xs text-warm-muted mt-4 leading-relaxed">
        権利者様からの削除依頼は
        <Link href="/rights" className="text-mint-500 hover:underline mx-1">
          Rights
        </Link>
        のページの窓口より承ります。
      </p>
    </InfoCard>
  );
}
