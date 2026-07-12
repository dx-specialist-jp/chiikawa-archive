import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rights",
  description: "CHIIKAWA ARCHIVE の権利者向け情報ページ。著作権・権利侵害に関するお問い合わせ先を掲載しています。",
};

export default function RightsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-serif text-warm-text tracking-wide mb-2">Rights</h1>
        <p className="text-sm text-warm-muted">
          著作権・商標権をお持ちの方へのご案内ページです。
        </p>
      </div>

      <div className="space-y-5">
        <div className="card p-6 bg-gradient-to-br from-lavender-100 to-cream-100">
          <h2 className="font-medium text-warm-text text-lg mb-3 tracking-wide">
            当サイトについて
          </h2>
          <div className="space-y-3 text-sm text-warm-text leading-relaxed">
            <p>
              当サイト（CHIIKAWA ARCHIVE）は、作品を応援することを目的とした
              <strong className="text-lavender-500">非営利のファンサイト</strong>
              です。
            </p>
            <p>
              著作権・商標権その他のすべての権利は権利者様に帰属します。
            </p>
            <p>
              当サイトは公式X（旧Twitter）の埋め込み機能を通じて情報を表示しており、
              漫画画像・動画・イラスト等をサイト内に保存・転載しておりません。
            </p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-medium text-warm-text mb-4 tracking-wide">当サイトの取り組み</h2>
          <ul className="space-y-3">
            {[
              "漫画画像・動画のサイト内保存・転載をしない",
              "公式X埋め込み機能のみでコンテンツを表示",
              "埋め込みで画像が見切れる場合も、画像を独自取得せずXの元投稿へのリンクのみ設置",
              "公式コンテンツへの直接リンクを明示",
              "AIによる漫画再生成・模倣をしない",
              "商業目的での利用をしない",
              "権利者様からのご連絡に迅速対応",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-warm-text">
                <span className="w-4 h-4 rounded-full border border-mint-400 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint-400" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="font-medium text-warm-text mb-4 tracking-wide">権利侵害・不適切掲載のご連絡</h2>
          <p className="text-sm text-warm-muted mb-4 leading-relaxed">
            権利侵害または不適切な掲載がございましたら、お問い合わせページよりご連絡ください。
            内容を確認後、速やかに修正・削除等の対応を実施いたします。
          </p>

          <div className="bg-cream-100 rounded-2xl p-4 mb-4">
            <div className="text-xs font-medium text-warm-text mb-2 tracking-wide">対応の流れ</div>
            <ol className="space-y-2">
              {[
                "お問い合わせページよりご連絡いただく",
                "内容を確認（原則24時間以内）",
                "速やかに該当コンテンツの修正・削除対応",
                "対応完了をご報告",
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-warm-muted">
                  <span className="w-5 h-5 bg-mint-200 text-mint-500 rounded-full flex items-center justify-center font-medium text-xs shrink-0">
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
        </div>

        <div className="bg-cream-100 border border-warm-border rounded-2xl p-4 text-xs text-warm-muted leading-relaxed">
          <p className="font-medium text-warm-text mb-1">免責事項</p>
          <p>
            当サイトはファンによる非公式サイトであり、公式とは一切関係ありません。
            サイト内に掲載されている情報・考察は管理人の独自判断によるものです。
            公式情報は必ず公式X（旧Twitter）等の公式チャンネルをご確認ください。
          </p>
        </div>
      </div>
    </div>
  );
}
