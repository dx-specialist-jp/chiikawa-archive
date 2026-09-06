/**
 * 既存の posts.json のカテゴリを現在のルールで判定し直す
 *
 * カテゴリ判定は新着投稿にしか適用されないため、ルールを変えると既存投稿と
 * 新着で基準がズレる。ルールを更新したらこれを実行して揃える。
 *
 * 判定し直すのは本文（summary）を持つ投稿だけ。本文が無い投稿は「絵文字と画像
 * だけ＝漫画1コマ」という取得時にしか分からない条件で manga と判定されており、
 * 本文だけで判定し直すと other に落ちてしまう。
 *
 * タグとキャラクターは触らない。どちらも取得時の完全な本文とハッシュタグ一覧から
 * 作られており、切り詰めた summary で作り直すと情報が減るため。
 *
 * 使い方:
 *   node scripts/reclassify-posts.mjs            # 変更内容を表示するだけ（dry-run）
 *   node scripts/reclassify-posts.mjs --write    # posts.json を書き換える
 */

import { readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { detectCategory } from "./lib/tagging.mjs";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "data");
const write = process.argv.includes("--write");

function countByCategory(posts) {
  const counts = {};
  for (const post of posts) counts[post.category] = (counts[post.category] ?? 0) + 1;
  return counts;
}

function format(counts, total) {
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([category, count]) => `${category} ${count}（${Math.round((count / total) * 100)}%）`)
    .join(" / ");
}

async function main() {
  const postsPath = join(DATA_DIR, "posts.json");
  const data = JSON.parse(await readFile(postsPath, "utf-8"));
  const before = countByCategory(data.posts);

  const changes = [];
  for (const post of data.posts) {
    if (!post.summary) continue;
    const category = detectCategory(post.summary);
    if (category !== post.category) {
      changes.push({ from: post.category, to: category, summary: post.summary.slice(0, 50) });
      post.category = category;
    }
  }

  console.log(`対象 ${data.posts.filter((p) => p.summary).length} 件（本文を持つ投稿）`);
  console.log(`  変更前: ${format(before, data.posts.length)}`);
  console.log(`  変更後: ${format(countByCategory(data.posts), data.posts.length)}`);
  console.log(`  カテゴリが変わった投稿: ${changes.length} 件`);
  for (const change of changes) {
    console.log(`    ${change.from} → ${change.to} | ${change.summary.replace(/\s+/g, " ")}`);
  }

  if (!write) {
    console.log("\n（dry-run。書き換えるには --write を付けて実行してください）");
    return;
  }

  await writeFile(postsPath, JSON.stringify(data, null, 2), "utf-8");
  console.log("✅ posts.json を更新しました");
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
