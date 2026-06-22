import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Episode } from "@/types";
import TwitterEmbed from "@/components/TwitterEmbed";
import type { Metadata } from "next";

async function getEpisodes(): Promise<Episode[]> {
  const filePath = path.join(process.cwd(), "public", "data", "episodes.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(raw) as { episodes: Episode[] };
  return data.episodes;
}

export async function generateStaticParams() {
  const episodes = await getEpisodes();
  return episodes.map((ep) => ({ id: ep.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const episodes = await getEpisodes();
  const ep = episodes.find((e) => e.id === id);
  if (!ep) return { title: "Not Found" };
  return {
    title: `#${ep.number} ${ep.title}`,
    description: ep.summary,
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const episodes = await getEpisodes();
  const episode = episodes.find((ep) => ep.id === id);
  if (!episode) notFound();

  const relatedEpisodes = episodes.filter((ep) =>
    episode.relatedEpisodes.includes(ep.number)
  );

  const date = new Date(episode.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* パンくず */}
      <nav className="text-xs text-warm-muted mb-4 flex items-center gap-1">
        <Link href="/" className="hover:text-mint-500 transition-colors">観測所</Link>
        <span>/</span>
        <Link href="/episodes" className="hover:text-mint-500 transition-colors">図書館</Link>
        <span>/</span>
        <span className="text-warm-text">#{episode.number} {episode.title}</span>
      </nav>

      {/* エピソードヘッダー */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-mono bg-mint-100 text-mint-500 px-2.5 py-1 rounded-xl">
            #{episode.number}
          </span>
          <time className="text-xs text-warm-muted">{date}</time>
        </div>
        <h1 className="text-xl font-bold text-warm-text mb-3">{episode.title}</h1>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {episode.characters.map((char) => (
            <span
              key={char}
              className="text-xs bg-lavender-100 text-lavender-400 px-2.5 py-1 rounded-full font-medium"
            >
              👤 {char}
            </span>
          ))}
          {episode.keywords.map((kw) => (
            <span
              key={kw}
              className="text-xs bg-honey-100 text-yellow-600 px-2.5 py-1 rounded-full"
            >
              🔑 {kw}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          {episode.tags.map((tag) => (
            <span key={tag} className="text-xs text-warm-muted">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* 公式X埋め込み */}
      <section className="mb-6">
        <div className="section-title mb-3">
          <span>🐦</span>
          <span>公式X投稿</span>
        </div>
        <div className="card p-4">
          <div className="bg-cream-100 rounded-2xl p-4 mb-3 text-xs text-warm-muted">
            ⚠️ 以下は公式X（旧Twitter）の埋め込み表示です。
            表示されない場合は
            <a
              href={episode.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mint-500 hover:underline mx-1"
            >
              公式Xで直接確認
            </a>
            してください。
          </div>
          <TwitterEmbed tweetId={episode.tweetId} />
          <div className="mt-3 text-right">
            <a
              href={episode.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-mint-500 hover:underline"
            >
              公式Xで見る ↗
            </a>
          </div>
        </div>
      </section>

      {/* AI要約 */}
      <section className="card p-4 mb-6 bg-gradient-to-br from-mint-100/50 to-cream-100">
        <div className="section-title mb-2">
          <span>📝</span>
          <span>独自要約</span>
          <span className="text-xs font-normal text-warm-muted/70">（AI生成・非公式）</span>
        </div>
        <p className="text-sm text-warm-text leading-relaxed">{episode.summary}</p>
      </section>

      {/* 関連エピソード */}
      {relatedEpisodes.length > 0 && (
        <section className="mb-6">
          <div className="section-title mb-3">
            <span>🔗</span>
            <span>関連エピソード</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedEpisodes.map((ep) => (
              <Link
                key={ep.id}
                href={`/episodes/${ep.id}`}
                className="card-hover p-3 block"
              >
                <div className="text-xs font-mono text-mint-500 mb-1">#{ep.number}</div>
                <div className="font-semibold text-warm-text text-sm">{ep.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="text-center">
        <Link href="/episodes" className="btn-secondary text-sm">
          ← 図書館に戻る
        </Link>
      </div>
    </div>
  );
}
