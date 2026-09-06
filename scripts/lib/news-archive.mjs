/**
 * news.json の保持件数の管理
 *
 * ニュースは 1 日あたり約 40 件増える（2026年6〜9月の実測）。上限を設けないと
 * news.json は年に 10MB 前後まで育つ。/news はこのファイルをブラウザから
 * 丸ごと取得するため、放置すると閲覧者の通信量に直接効いてくる。
 *
 * そこで news.json には新しい順に NEWS_MAX_ARTICLES 件だけを残し、
 * あふれた記事は public/data/news-archive/<年>.json へ退避する。
 * サイトからは参照しないが、データとしては失わない。
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

/** news.json に残す最大件数（環境変数で上書き可能） */
export const MAX_ARTICLES = Number(process.env.NEWS_MAX_ARTICLES ?? 2000);

const ARCHIVE_DIR = "news-archive";

/** 新しい順に上限まで残し、あふれたぶんを返す */
export function applyRetention(articles, limit = MAX_ARTICLES) {
  if (!Number.isFinite(limit) || limit <= 0 || articles.length <= limit) {
    return { kept: articles, dropped: [] };
  }
  return { kept: articles.slice(0, limit), dropped: articles.slice(limit) };
}

/** あふれた記事を年別のアーカイブファイルへ追記する（id で重複排除） */
export async function archiveArticles(dataDir, dropped) {
  if (dropped.length === 0) return [];

  const byYear = new Map();
  for (const article of dropped) {
    const year = article.publishedAt.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push(article);
  }

  const archiveDir = join(dataDir, ARCHIVE_DIR);
  await mkdir(archiveDir, { recursive: true });

  const written = [];
  for (const [year, articles] of byYear) {
    const filePath = join(archiveDir, `${year}.json`);
    let existing = [];
    try {
      existing = JSON.parse(await readFile(filePath, "utf-8")).articles ?? [];
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }

    const byId = new Map(existing.map((a) => [a.id, a]));
    for (const article of articles) byId.set(article.id, article);
    const merged = [...byId.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    await writeFile(
      filePath,
      JSON.stringify({ year, totalArticles: merged.length, articles: merged }, null, 2),
      "utf-8"
    );
    written.push({ year, added: articles.length, total: merged.length });
  }

  return written;
}
