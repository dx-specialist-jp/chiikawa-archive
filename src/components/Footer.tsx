import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-warm-border bg-cream-100">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl" role="img" aria-label="望遠鏡">🔭</span>
              <span className="font-bold text-warm-text">ちいかわ観測所</span>
            </div>
            <p className="text-xs text-warm-muted leading-relaxed">
              ちいかわの公式情報を整理・検索しやすくする非公式ナレッジサイトです。
            </p>
          </div>

          <div>
            <div className="font-semibold text-warm-text text-sm mb-3">コンテンツ</div>
            <ul className="space-y-1.5 text-xs text-warm-muted">
              <li><Link href="/" className="hover:text-mint-500 transition-colors">観測所トップ</Link></li>
              <li><Link href="/news" className="hover:text-mint-500 transition-colors">最新ニュース</Link></li>
              <li><Link href="/archive" className="hover:text-mint-500 transition-colors">投稿アーカイブ</Link></li>
              <li><Link href="/episodes" className="hover:text-mint-500 transition-colors">エピソード図書館</Link></li>
              <li><Link href="/contact" className="hover:text-mint-500 transition-colors">お問い合わせ</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-warm-text text-sm mb-3">法的情報</div>
            <ul className="space-y-1.5 text-xs text-warm-muted">
              <li><Link href="/rights" className="hover:text-mint-500 transition-colors">権利者様へ</Link></li>
              <li>
                <a
                  href="https://x.com/ngnchiikawa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-mint-500 transition-colors"
                >
                  公式X（旧Twitter）↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-warm-border pt-6 space-y-3">
          <p className="text-xs text-warm-muted leading-relaxed">
            当サイトはファンによる非公式ナレッジサイトです。掲載される著作物・商標・画像・動画等の権利は各権利者に帰属します。
            当サイトでは公式X（旧Twitter）の埋め込み機能を利用して情報を表示しています。
          </p>
          <p className="text-xs text-warm-muted leading-relaxed">
            権利者様からのご連絡があった場合は内容を確認のうえ迅速に対応し、必要に応じて該当ページ・記事を削除または修正いたします。
          </p>
          <p className="text-xs text-warm-muted">
            © 2026 ちいかわ観測所（非公式）｜ちいかわ / ナガノ先生 に関する著作権・商標権はすべて権利者に帰属します。
          </p>
        </div>
      </div>
    </footer>
  );
}
