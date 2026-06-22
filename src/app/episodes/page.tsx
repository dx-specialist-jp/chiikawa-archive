"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Episode } from "@/types";

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    fetch(`${basePath}/data/episodes.json`)
      .then((r) => r.json())
      .then((data: { episodes: Episode[] }) => {
        setEpisodes(data.episodes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = episodes.filter((ep) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      ep.title.toLowerCase().includes(q) ||
      ep.summary.toLowerCase().includes(q) ||
      ep.characters.some((c) => c.includes(q)) ||
      ep.keywords.some((k) => k.includes(q)) ||
      ep.tags.some((t) => t.includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-text flex items-center gap-2 mb-1">
          <span>📚</span>
          エピソード図書館
        </h1>
        <p className="text-sm text-warm-muted">
          ちいかわの漫画エピソードを整理・検索できます。公式X埋め込みで閲覧。
        </p>
      </div>

      <div className="bg-mint-100 border border-mint-200 rounded-2xl p-3 mb-6 text-xs text-mint-500 flex items-start gap-2">
        <span>ℹ️</span>
        <span>
          各エピソードは公式X（旧Twitter）の埋め込みで表示されます。漫画画像はサイト内に保存していません。
        </span>
      </div>

      {/* 検索フォーム */}
      <div className="card p-4 mb-6">
        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キャラクター名・キーワードで検索..."
            className="flex-1 bg-cream-100 border border-warm-border rounded-xl px-3 py-2 text-sm
                       text-warm-text placeholder-warm-muted/60 outline-none
                       focus:border-mint-300 focus:ring-2 focus:ring-mint-100 transition-colors"
          />
          {query && (
            <button onClick={() => setQuery("")} className="btn-secondary text-sm">
              クリア
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-warm-muted">
          <p className="text-3xl mb-3 animate-pulse">📖</p>
          <p className="text-sm">読み込み中...</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-warm-muted mb-4">
            {filtered.length} 件のエピソード
            {query && <span> — 「{query}」の検索結果</span>}
          </div>

          {filtered.length === 0 ? (
            <div className="card p-12 text-center text-warm-muted">
              <p className="text-3xl mb-3">🔍</p>
              <p className="font-semibold mb-1">エピソードが見つかりませんでした</p>
              <p className="text-sm">別のキーワードで検索してみてください</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((ep) => (
                <EpisodeCard key={ep.id} episode={ep} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EpisodeCard({ episode }: { episode: Episode }) {
  const date = new Date(episode.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/episodes/${episode.id}`} className="card-hover p-4 block">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-mono bg-mint-100 text-mint-500 px-2 py-0.5 rounded-lg">
          #{episode.number}
        </span>
        <time className="text-xs text-warm-muted shrink-0">{date}</time>
      </div>
      <h2 className="font-bold text-warm-text mb-2">{episode.title}</h2>
      <p className="text-sm text-warm-muted leading-relaxed mb-3 line-clamp-2">
        {episode.summary}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {episode.characters.map((char) => (
          <span
            key={char}
            className="text-xs bg-lavender-100 text-lavender-400 px-2 py-0.5 rounded-full"
          >
            {char}
          </span>
        ))}
        {episode.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-xs text-warm-muted">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
