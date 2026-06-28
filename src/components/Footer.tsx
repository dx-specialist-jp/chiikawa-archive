import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-warm-border bg-cream-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="mb-4">
              <div className="font-serif text-sm tracking-[0.16em] text-warm-text">CHIIKAWA ARCHIVE</div>
              <div className="text-[10px] tracking-widest text-warm-muted mt-0.5 font-light">UNOFFICIAL FAN ARCHIVE</div>
            </div>
            <p className="text-xs text-warm-muted leading-relaxed font-light">
              ちいかわの公式情報を整理・検索しやすくする非公式ナレッジサイトです。
            </p>
          </div>

          <div>
            <div className="text-[10px] tracking-widest text-warm-muted mb-4 font-light">CONTENTS</div>
            <ul className="space-y-2 text-xs text-warm-muted font-light">
              <li><Link href="/" className="hover:text-mint-400 transition-colors">Archive Top</Link></li>
              <li><Link href="/news" className="hover:text-mint-400 transition-colors">Latest News</Link></li>
              <li><Link href="/archive" className="hover:text-mint-400 transition-colors">Post Archive</Link></li>
              <li><Link href="/search" className="hover:text-mint-400 transition-colors">Search</Link></li>
              <li><Link href="/stats" className="hover:text-mint-400 transition-colors">Stats</Link></li>
              <li><Link href="/contact" className="hover:text-mint-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] tracking-widest text-warm-muted mb-4 font-light">LEGAL</div>
            <ul className="space-y-2 text-xs text-warm-muted font-light">
              <li><Link href="/rights" className="hover:text-mint-400 transition-colors">Rights &amp; Credits</Link></li>
              <li>
                <a href="https://x.com/ngnchiikawa" target="_blank" rel="noopener noreferrer"
                   className="hover:text-mint-400 transition-colors">
                  Official X ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-warm-border pt-6 space-y-2">
          <p className="text-xs text-warm-muted leading-relaxed font-light">
            当サイトはファンによる非公式サイトです。掲載される著作物・商標・画像・動画等の権利は各権利者に帰属します。
            公式X（旧Twitter）の埋め込み機能を利用して情報を表示しています。
          </p>
          <p className="text-xs text-warm-muted font-light">
            © 2026 CHIIKAWA ARCHIVE（非公式）｜ちいかわ / ナガノ先生 に関する著作権・商標権はすべて権利者に帰属します。
          </p>
          <p className="text-[10px] text-warm-muted font-light opacity-60">
            Background photo by{" "}
            <a href="https://unsplash.com/photos/1475656106224-d72c2ab53e8d" target="_blank" rel="noopener noreferrer" className="hover:text-mint-400 transition-colors">Unsplash</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
