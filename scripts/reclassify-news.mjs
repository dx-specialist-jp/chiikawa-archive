/**
 * 既存の news.json を現在のルールで作り直す
 *
 * カテゴリ・タグの判定も本文の整形も新着記事にしか適用されないため、ルールを
 * 変えると既存記事と新着で基準がズレる。ルールを更新したらこのスクリプトを
 * 実行して全件を同じ基準に揃える。あわせて保持件数の上限も適用する。
 *
 * 使い方:
 *   node scripts/reclassify-news.mjs            # 変更内容を表示するだけ（dry-run）
 *   node scripts/reclassify-news.mjs --write    # news.json を書き換える
 */

import { readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { detectCategory, extractTags } from "./lib/news-tagging.mjs";
import { cleanSummary } from "./lib/news-text.mjs";
import { applyRetention, archiveArticles, MAX_ARTICLES } from "./lib/news-archive.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

const write = process.argv.includes("--write");

function countByCategory(articles) {
  const counts = {};
  for (const article of articles) counts[article.category] = (counts[article.category] ?? 0) + 1;
  return counts;
}

function format(counts, total) {
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([category, count]) => `${category} ${count}（${Math.round((count / total) * 100)}%）`)
    .join(" / ");
}

async function main() {
  const newsPath = join(DATA_DIR, "news.json");
  const data = JSON.parse(await readFile(newsPath, "utf-8"));
  const articles = data.articles ?? [];

  if (articles.length === 0) {
    console.log("⚠️ news.json に記事がありません");
    return;
  }

  const before = countByCategory(articles);
  let changed = 0;
  let cleaned = 0;

  const reclassified = articles.map((article) => {
    const category = detectCategory(article.title);
    const tags = extractTags(article.title);
    const summary = cleanSummary(article.summary ?? "");
    if (category !== article.category) changed++;
    if (summary !== article.summary) cleaned++;
    return { ...article, summary, category, tags };
  });

  reclassified.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const { kept, dropped } = applyRetention(reclassified);

  console.log(`対象 ${articles.length} 件`);
  console.log(`  変更前: ${format(before, articles.length)}`);
  console.log(`  変更後: ${format(countByCategory(reclassified), reclassified.length)}`);
  console.log(`  カテゴリが変わった記事: ${changed} 件`);
  console.log(`  本文が整形された記事: ${cleaned} 件`);
  console.log(`  保持上限 ${MAX_ARTICLES} 件 → 掲載 ${kept.length} 件 / 退避 ${dropped.length} 件`);

  if (!write) {
    console.log("\n（dry-run。書き換えるには --write を付けて実行してください）");
    return;
  }

  for (const { year, added, total } of await archiveArticles(DATA_DIR, dropped)) {
    console.log(`🗃️  ${year} 年のアーカイブへ ${added} 件退避（アーカイブ計 ${total} 件）`);
  }

  await writeFile(
    newsPath,
    JSON.stringify(
      { lastUpdated: data.lastUpdated, totalArticles: kept.length, articles: kept },
      null,
      2
    ),
    "utf-8"
  );
  console.log("✅ news.json を更新しました");
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
