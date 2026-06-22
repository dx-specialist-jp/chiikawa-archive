/**
 * ちいかわ公式Xの投稿を取得してJSONを更新するスクリプト
 *
 * 必要な環境変数:
 *   X_BEARER_TOKEN - X API v2 のベアラートークン
 *
 * 動作モード:
 *   - 通常実行 (既存データあり): 前回取得ID以降の新着投稿を追加
 *   - 初回実行 (既存データなし): 全履歴をページネーションで一括取得
 */

import { writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");
const OFFICIAL_X_USERNAME = "ngnchiikawa";

// カテゴリ判定キーワード（ルールベース）
const CATEGORY_KEYWORDS = {
  manga: ["漫画", "まんが", "コミック", "#ちいかわ"],
  goods: ["グッズ", "商品", "発売", "販売", "限定", "コラボ商品", "ぬいぐるみ", "フィギュア"],
  anime: ["アニメ", "放送", "配信", "TVアニメ", "OVA"],
  collab: ["コラボ", "タイアップ", "×", "コラボレーション"],
  event: ["イベント", "展示", "ポップアップ", "フェア", "期間限定"],
};

const CHARACTER_KEYWORDS = {
  ちいかわ: ["ちいかわ"],
  ハチワレ: ["ハチワレ"],
  うさぎ: ["うさぎ"],
  くりまんじゅう: ["くりまんじゅう"],
  もんじゃ: ["もんじゃ"],
  シーサー: ["シーサー"],
};

function detectCategory(text) {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return "other";
}

function extractCharacters(text) {
  return Object.entries(CHARACTER_KEYWORDS)
    .filter(([, keywords]) => keywords.some((kw) => text.includes(kw)))
    .map(([char]) => char);
}

function toJstDateStr(isoStr) {
  return new Date(isoStr).toLocaleDateString("sv", { timeZone: "Asia/Tokyo" });
}

async function fetchUserId(username, bearerToken) {
  const res = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}`,
    { headers: { Authorization: `Bearer ${bearerToken}` } }
  );
  if (!res.ok) throw new Error(`ユーザーID取得失敗: ${res.status}`);
  const data = await res.json();
  return data.data.id;
}

// 1ページ分のタイムラインを取得
async function fetchTimelinePage(userId, bearerToken, { sinceId, paginationToken } = {}) {
  const params = new URLSearchParams({
    max_results: "100",
    "tweet.fields": "created_at,text",
    exclude: "retweets,replies",
  });
  if (sinceId) params.set("since_id", sinceId);
  if (paginationToken) params.set("pagination_token", paginationToken);

  const res = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?${params}`,
    { headers: { Authorization: `Bearer ${bearerToken}` } }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`X API エラー ${res.status}: ${body}`);
  }
  return res.json();
}

// 全件取得（初回：ページネーションあり / 増分：sinceId指定）
async function fetchAllNewTweets(userId, bearerToken, sinceId) {
  const tweets = [];
  let paginationToken = null;
  const isInitial = !sinceId;

  do {
    const data = await fetchTimelinePage(userId, bearerToken, {
      sinceId,
      paginationToken,
    });

    if (!data.data || data.data.length === 0) break;
    tweets.push(...data.data);
    paginationToken = data.meta?.next_token ?? null;

    if (paginationToken) {
      const mode = isInitial ? "初回取得" : "増分取得";
      console.log(`  ${mode}: ${tweets.length}件 取得済み（続きあり）`);
      // レート制限を考慮して少し待機
      await new Promise((r) => setTimeout(r, 1500));
    }
  } while (paginationToken && isInitial); // 初回のみ全ページ取得

  return tweets;
}

function buildCalendarData(posts) {
  const calendarMap = {};
  for (const p of posts) {
    const date = toJstDateStr(p.publishedAt);
    if (!calendarMap[date]) calendarMap[date] = { date, count: 0, categories: [] };
    calendarMap[date].count++;
    if (!calendarMap[date].categories.includes(p.category)) {
      calendarMap[date].categories.push(p.category);
    }
  }
  return Object.values(calendarMap).sort((a, b) => b.date.localeCompare(a.date));
}

async function main() {
  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) {
    console.warn("⚠️  X_BEARER_TOKEN が未設定です。データを更新しません。");
    process.exit(0);
  }

  const existingRaw = await readFile(join(DATA_DIR, "posts.json"), "utf-8");
  const existing = JSON.parse(existingRaw);
  const existingPosts = existing.posts ?? [];
  const latestId = existingPosts[0]?.tweetId ?? null;
  const isInitial = existingPosts.length === 0;

  console.log(`📡 X API からデータを取得中... (${isInitial ? "初回一括" : "増分"})`);

  const userId = await fetchUserId(OFFICIAL_X_USERNAME, bearerToken);
  console.log(`👤 ユーザーID: ${userId}`);

  const rawTweets = await fetchAllNewTweets(userId, bearerToken, latestId);

  if (rawTweets.length === 0) {
    console.log("✅ 新規投稿なし");
    return;
  }

  console.log(`📨 ${rawTweets.length} 件の新規投稿を取得`);

  const newPosts = rawTweets.map((tweet) => ({
    id: `post-${tweet.id}`,
    tweetId: tweet.id,
    url: `https://x.com/${OFFICIAL_X_USERNAME}/status/${tweet.id}`,
    publishedAt: tweet.created_at,
    category: detectCategory(tweet.text),
    tags: ["ちいかわ"],
    summary: tweet.text.slice(0, 100),
    characters: extractCharacters(tweet.text),
  }));

  // 新着を先頭に追加（重複排除）
  const existingIds = new Set(existingPosts.map((p) => p.tweetId));
  const merged = [
    ...newPosts.filter((p) => !existingIds.has(p.tweetId)),
    ...existingPosts,
  ];

  const calendarData = buildCalendarData(merged);

  const updated = {
    lastUpdated: new Date().toISOString(),
    totalPosts: merged.length,
    posts: merged,
    calendarData,
    chiikawaIndex: existing.chiikawaIndex,
  };

  await writeFile(
    join(DATA_DIR, "posts.json"),
    JSON.stringify(updated, null, 2),
    "utf-8"
  );

  console.log(`✅ 更新完了（${newPosts.length} 件追加、合計 ${merged.length} 件）`);
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
