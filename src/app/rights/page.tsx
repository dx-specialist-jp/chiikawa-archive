import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import InfoCard from "@/components/ui/InfoCard";
import BulletList from "@/components/ui/BulletList";
import NoteBox from "@/components/ui/NoteBox";

export const metadata: Metadata = {
  title: "Rights",
  description:
    "CHIIKAWA ARCHIVE の権利者向け情報ページ。著作権・権利侵害に関するお問い合わせ先を掲載しています。",
};

const COMMITMENTS = [
  "漫画画像・動画のサイト内保存・転載をしない",
  "公式X埋め込み機能のみでコンテンツを表示",
  "埋め込みで画像が見切れる場合も、画像を独自取得せずXの元投稿へのリンクのみ設置",
  "公式コンテンツへの直接リンクを明示",
  "AIによる漫画再生成・模倣をしない",
  "商業目的での利用をしない",
  "権利者様からのご連絡に迅速対応",
];

const GALLERY_POLICY = [
  "投稿は自動的に公開されます（事前の個別承認は行っていません）",
  "個人の記念写真の範囲に限定し、公式アートの転載や第三者の写真の投稿は禁止",
  "不適切な投稿を確認した場合、管理者が随時削除します",
  "権利者様からの削除依頼があれば画像・コメントを速やかに削除",
];

const RESPONSE_FLOW = [
  "お問い合わせページよりご連絡いただく",
  "内容を確認（原則24時間以内）",
  "速やかに該当コンテンツの修正・削除対応",
  "対応完了をご報告",
];

export default function RightsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="Rights" description="著作権・商標権をお持ちの方へのご案内ページです。" />

      <div className="space-y-5">
        <InfoCard title="当サイトについて" highlight>
          <div className="space-y-3 text-sm text-warm-text leading-relaxed">
            <p>
              当サイト（CHIIKAWA ARCHIVE）は、作品を応援することを目的とした
              <strong className="text-lavender-500">非営利のファンサイト</strong>
              です。
            </p>
            <p>著作権・商標権その他のすべての権利は権利者様に帰属します。</p>
            <p>
              当サイトは公式X（旧Twitter）の埋め込み機能を通じて情報を表示しており、
              漫画画像・動画・イラスト等をサイト内に保存・転載しておりません。
            </p>
          </div>
        </InfoCard>

        <InfoCard title="当サイトの取り組み">
          <BulletList items={COMMITMENTS} />
        </InfoCard>

        <InfoCard title="ギャラリー投稿機能について">
          <p className="text-sm text-warm-muted mb-4 leading-relaxed">
            ユーザーが自分で購入したグッズ・参加したイベントの写真を投稿できる
            <Link href="/gallery" className="text-mint-500 hover:underline mx-1">
              Gallery
            </Link>
            機能があります。投稿された写真にはグッズに印字された公式イラスト等が写り込む場合があります。
            投稿は外部フォームサービス（Tally）を通じて受け付けています。
          </p>
          <BulletList items={GALLERY_POLICY} />
        </InfoCard>

        <InfoCard title="権利侵害・不適切掲載のご連絡">
          <p className="text-sm text-warm-muted mb-4 leading-relaxed">
            権利侵害または不適切な掲載がございましたら、お問い合わせページよりご連絡ください。
            内容を確認後、速やかに修正・削除等の対応を実施いたします。
          </p>

          <div className="bg-cream-100 rounded-2xl p-4 mb-5">
            <div className="text-xs font-medium text-warm-text mb-3 tracking-wide">対応の流れ</div>
            <ol className="space-y-2.5">
              {RESPONSE_FLOW.map((step, i) => (
                <li key={step} className="flex items-center gap-2.5 text-xs text-warm-muted">
                  <span className="w-5 h-5 bg-mint-200 text-mint-500 rounded-full flex items-center justify-center font-medium shrink-0 tabular-nums">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
            お問い合わせページへ
          </Link>
        </InfoCard>

        <NoteBox title="免責事項">
          <p>
            当サイトはファンによる非公式サイトであり、公式とは一切関係ありません。
            サイト内に掲載されている情報・考察は管理人の独自判断によるものです。
            公式情報は必ず公式X（旧Twitter）等の公式チャンネルをご確認ください。
          </p>
        </NoteBox>
      </div>
    </div>
  );
}
