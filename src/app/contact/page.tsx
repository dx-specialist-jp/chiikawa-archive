import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "ちいかわ観測所へのお問い合わせページ。権利侵害の報告・ご意見はこちらから。",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-text flex items-center gap-2 mb-2">
          <span>✉️</span>
          お問い合わせ
        </h1>
        <p className="text-sm text-warm-muted">
          権利侵害のご報告・ご意見・ご質問はこちらからお送りください。
        </p>
      </div>

      <div className="card p-6 mb-5">
        <div className="bg-mint-100 border border-mint-200 rounded-2xl p-3 mb-5 text-xs text-mint-500 leading-relaxed">
          <p className="font-semibold mb-1">権利者様へ</p>
          <p>
            著作権・商標権等の権利侵害に関するご報告は優先的に対応いたします。
            具体的なURL・投稿IDをご記載いただくと迅速な対応が可能です。
          </p>
        </div>

        {/* 問い合わせ種別 */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-warm-text block mb-1.5">
              お問い合わせ種別 <span className="text-peach-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { value: "rights", label: "⚖️ 権利侵害のご報告", priority: true },
                { value: "error", label: "🔧 情報の誤りについて", priority: false },
                { value: "request", label: "💡 機能・コンテンツのご要望", priority: false },
                { value: "other", label: "📌 その他", priority: false },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors
                    ${item.priority
                      ? "border-lavender-300 bg-lavender-50 hover:bg-lavender-100"
                      : "border-warm-border bg-cream-50 hover:bg-cream-100"
                    }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={item.value}
                    className="accent-mint-400"
                    defaultChecked={item.value === "other"}
                  />
                  <span className="text-sm text-warm-text">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-warm-text block mb-1.5">
              お名前またはご連絡先
              <span className="text-xs font-normal text-warm-muted ml-2">（任意）</span>
            </label>
            <input
              type="text"
              placeholder="例：権利者名・メールアドレス等"
              className="w-full bg-cream-50 border border-warm-border rounded-xl px-3 py-2 text-sm
                         text-warm-text placeholder-warm-muted/50 outline-none
                         focus:border-mint-300 focus:ring-2 focus:ring-mint-100 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-warm-text block mb-1.5">
              対象URL・投稿ID
              <span className="text-xs font-normal text-warm-muted ml-2">（権利侵害報告の場合は必須）</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full bg-cream-50 border border-warm-border rounded-xl px-3 py-2 text-sm
                         text-warm-text placeholder-warm-muted/50 outline-none
                         focus:border-mint-300 focus:ring-2 focus:ring-mint-100 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-warm-text block mb-1.5">
              お問い合わせ内容 <span className="text-peach-400">*</span>
            </label>
            <textarea
              rows={6}
              placeholder="詳細をご記載ください..."
              className="w-full bg-cream-50 border border-warm-border rounded-xl px-3 py-2 text-sm
                         text-warm-text placeholder-warm-muted/50 outline-none resize-none
                         focus:border-mint-300 focus:ring-2 focus:ring-mint-100 transition-colors"
            />
          </div>

          <div className="bg-cream-100 rounded-xl p-3 text-xs text-warm-muted leading-relaxed">
            ※ 当フォームはデモ版です。実際の送信機能は準備中です。
            緊急のご連絡は GitHub Issues よりお願いいたします。
          </div>

          <button
            type="button"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            disabled
          >
            <span>✉️</span>
            送信する（準備中）
          </button>
        </div>
      </div>

      <p className="text-xs text-warm-muted text-center leading-relaxed">
        権利者様からのご連絡は内容確認後、原則24時間以内にご対応いたします。
      </p>
    </div>
  );
}
