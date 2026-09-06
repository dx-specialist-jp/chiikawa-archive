/**
 * 既存の posts.json に本文（summary）を埋める
 *
 * 2026年6月に本文の取得元を失った際に summary が省略可能になり、以降の投稿には
 * 本文が入っていない。取得自体は syndication API で今もできる（現在も分類には
 * 使っている）ため、既存投稿にも遡って入れて /search のキーワード検索を効かせる。
 *
 * 一度流せば済む種類のスクリプト。新着は fetch-posts.mjs 側で本文を持つ。
 *
 * 使い方:
 *   node scripts/backfill-post-summaries.mjs           # 先頭20件だけ試す（dry-run）
 *   node scripts/backfill-post-summaries.mjs --write   # 全件に適用して書き込む
 */

import { writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { fetchTweetDetails } from "./lib/syndication.mjs";
import { toSummary } from "./lib/post-text.mjs";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "data");
const write = process.argv.includes("--write");
const DRY_RUN_LIMIT = 20;
const REQUEST_INTERVAL_MS = 350;

async function main() {
  const postsPath = join(DATA_DIR, "posts.json");
  const data = JSON.parse(await readFile(postsPath, "utf-8"));

  const targets = data.posts.filter((post) => post.summary === undefined);
  const queue = write ? targets : targets.slice(0, DRY_RUN_LIMIT);
  console.log(`本文が未取得の投稿: ${targets.length} 件 / 今回処理: ${queue.length} 件`);

  let filled = 0;
  let emptyText = 0;
  let failed = 0;

  for (const [index, post] of queue.entries()) {
    const details = await fetchTweetDetails(post.tweetId);
    if (!details) {
      failed++;
    } else {
      const summary = toSummary(details.text);
      if (summary) {
        post.summary = summary;
        filled++;
      } else {
        // 漫画1コマなど、絵文字と画像リンクだけの投稿
        emptyText++;
      }
    }

    if ((index + 1) % 100 === 0) console.log(`  ${index + 1}/${queue.length} 件...`);
    await new Promise((resolve) => setTimeout(resolve, REQUEST_INTERVAL_MS));
  }

  console.log(`本文あり ${filled} 件 / 絵文字・画像のみ ${emptyText} 件 / 取得失敗 ${failed} 件`);

  if (!write) {
    console.log("\n（dry-run。全件に適用して書き込むには --write を付けてください）");
    return;
  }

  await writeFile(postsPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`✅ posts.json を更新しました（本文を持つ投稿 ${data.posts.filter((p) => p.summary).length} 件）`);
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
