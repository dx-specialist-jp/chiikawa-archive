/**
 * ツイートを posts.json に手動追加するスクリプト
 *
 * 環境変数:
 *   TWEET_URL      - ツイートURL（必須）
 *   CATEGORY       - カテゴリ（manga/goods/anime/collab/event/other）
 *   PUBLISHED_DATE - 投稿日 YYYY-MM-DD（省略時は本日 JST）
 */

import { writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { detectCategory, extractCharacters, extractTagsFromHashtags } from "./lib/tagging.mjs";
import { fetchTweetDetails } from "./lib/syndication.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

const TWEET_URL = process.env.TWEET_URL ?? "";
const CATEGORY = process.env.CATEGORY ?? "";
const PUBLISHED_DATE = process.env.PUBLISHED_DATE ?? "";

function parseTweetId(url) {
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

function toJstDateStr(isoStr) {
  return new Date(isoStr).toLocaleDateString("sv", { timeZone: "Asia/Tokyo" });
}

function buildCalendarData(posts) {
  const map = {};
  for (const p of posts) {
    const date = toJstDateStr(p.publishedAt);
    if (!map[date]) map[date] = { date, count: 0, categories: [] };
    map[date].count++;
    if (!map[date].categories.includes(p.category)) {
      map[date].categories.push(p.category);
    }
  }
  return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
}

async function main() {
  if (!TWEET_URL) {
    console.error("❌ TWEET_URL が未設定です");
    process.exit(1);
  }

  const tweetId = parseTweetId(TWEET_URL);
  if (!tweetId) {
    console.error("❌ ツイートIDを取得できません:", TWEET_URL);
    process.exit(1);
  }

  // 投稿日時の組み立て
  let publishedAt;
  if (PUBLISHED_DATE && /^\d{4}-\d{2}-\d{2}$/.test(PUBLISHED_DATE)) {
    publishedAt = new Date(`${PUBLISHED_DATE}T12:00:00+09:00`).toISOString();
  } else {
    publishedAt = new Date().toISOString();
  }

  const postsPath = join(DATA_DIR, "posts.json");
  const raw = await readFile(postsPath, "utf-8");
  const existing = JSON.parse(raw);
  const existingPosts = existing.posts ?? [];

  if (existingPosts.some((p) => p.tweetId === tweetId)) {
    console.log(`⚠️ すでに登録済みです: ${tweetId}`);
    return;
  }

  const details = await fetchTweetDetails(tweetId);
  if (!details) {
    console.warn("⚠️ ツイート本文の取得に失敗しました。category/tags/characters は空のまま登録されます");
  }
  const text = details?.text ?? "";
  const category = CATEGORY || detectCategory(text, { mediaCount: details?.mediaCount ?? 0 });

  const newPost = {
    id: `post-${tweetId}`,
    tweetId,
    url: `https://x.com/ngnchiikawa/status/${tweetId}`,
    publishedAt,
    category,
    tags: details ? extractTagsFromHashtags(details.hashtags) : [],
    characters: details ? extractCharacters(text) : [],
    photoUrl: details?.photoUrl ?? null,
  };

  console.log(`➕ 追加: ${tweetId} (${category}) ${toJstDateStr(publishedAt)}`);

  const merged = [newPost, ...existingPosts];
  merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const updated = {
    lastUpdated: new Date().toISOString(),
    totalPosts: merged.length,
    posts: merged,
    calendarData: buildCalendarData(merged),
  };

  await writeFile(postsPath, JSON.stringify(updated, null, 2), "utf-8");
  console.log(`✅ 完了（合計 ${merged.length} 件）`);
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
