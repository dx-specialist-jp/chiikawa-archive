import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "CHIIKAWA ARCHIVE へのお問い合わせ。権利侵害の報告・ご意見は GitHub Issues よりお送りください。",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-serif text-warm-text tracking-wide mb-2">Contact</h1>
        <p className="text-sm text-warm-muted">
          ご意見・権利侵害のご報告は GitHub Issues よりお送りください。
        </p>
      </div>

      <div className="space-y-4">
        <div className="card p-6 bg-gradient-to-br from-lavender-100 to-cream-100">
          <h2 className="font-medium text-warm-text mb-3 tracking-wide">権利者様・緊急のご連絡</h2>
          <p className="text-sm text-warm-muted leading-relaxed mb-4">
            著作権・商標権等の権利侵害に関するご報告は GitHub Issues より
            ご連絡ください。内容確認後、速やかに対応いたします。
          </p>
          <a
            href="https://github.com/dx-specialist-jp/chiikawa-archive/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            GitHub Issues を開く ↗
          </a>
        </div>

        <div className="card p-6">
          <h2 className="font-medium text-warm-text mb-3 tracking-wide">お問い合わせの種類</h2>
          <ul className="space-y-3 text-sm text-warm-muted">
            {[
              "権利侵害のご報告",
              "掲載情報の誤りについて",
              "機能・コンテンツのご要望",
              "その他のご意見・ご質問",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-mint-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-warm-muted mt-4 leading-relaxed">
            いずれの内容も上記の GitHub Issues よりご連絡いただけます。
          </p>
        </div>

        <div className="bg-cream-100 border border-warm-border rounded-2xl p-4 text-xs text-warm-muted leading-relaxed">
          <p className="font-medium text-warm-text mb-1">このサイトについて</p>
          <p>
            当サイトはファンによる非公式サイトです。
            権利者様からのご連絡は原則24時間以内に対応いたします。
          </p>
          <p className="mt-1">
            詳しくは
            <Link href="/rights" className="text-mint-500 hover:underline mx-1">
              権利者様へ
            </Link>
            のページをご確認ください。
          </p>
        </div>
      </div>
    </div>
  );
}
