/**
 * ちいかわ公式Xの投稿を取得してJSONを更新するスクリプト
 *
 * 必要な環境変数:
 *   X_BEARER_TOKEN - X API v2 のベアラートークン
 *
 * X APIの設定:
 *   1. https://developer.x.com でアプリを作成
 *   2. Free プランでも read-only アクセスが可能
 *   3. Bearer Token を GitHub Secrets の X_BEARER_TOKEN に設定
 */

import { writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

// 公式Xアカウント名
const OFFICIAL_X_USERNAME = "ngnchiikawa";

// カテゴリ判定キーワード
const CATEGORY_KEYWORDS = {
  manga: ["漫画", "まんが", "コミック", "#ちいかわ"],
  goods: ["グッズ", "商品", "発売", "販売", "限定", "コラボ商品", "ぬいぐるみ", "フィギュア"],
  anime: ["アニメ", "放送", "配信", "TVアニメ", "OVA"],
  collab: ["コラボ", "タイアップ", "×", "コラボレーション"],
  event: ["イベント", "展示", "ポップアップ", "フェア", "期間限定"],
};

function detectCategory(text) {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return category;
    }
  }
  return "other";
}

function extractCharacters(text) {
  const characters = [];
  const charKeywords = {
    ちいかわ: ["ちいかわ"],
    ハチワレ: ["ハチワレ"],
    うさぎ: ["うさぎ"],
    くりまんじゅう: ["くりまんじゅう"],
    もんじゃ: ["もんじゃ"],
    シーサー: ["シーサー"],
  };
  for (const [char, keywords] of Object.entries(charKeywords)) {
    if (keywords.some((kw) => text.includes(kw))) {
      characters.push(char);
    }
  }
  return characters;
}

async function fetchUserTimeline(userId, bearerToken, sinceId) {
  const params = new URLSearchParams({
    max_results: "10",
    "tweet.fields": "created_at,text,entities",
    exclude: "retweets,replies",
  });
  if (sinceId) {
    params.set("since_id", sinceId);
  }

  const res = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?${params}`,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`X API error ${res.status}: ${body}`);
  }

  return res.json();
}

async function fetchUserId(username, bearerToken) {
  const res = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}`,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
    }
  );
  if (!res.ok) throw new Error(`Failed to fetch user ID: ${res.status}`);
  const data = await res.json();
  return data.data.id;
}

async function main() {
  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) {
    console.warn(
      "⚠️  X_BEARER_TOKEN が未設定です。サンプルデータを維持します。"
    );
    console.warn(
      "   X API の Bearer Token を GitHub Secrets に設定してください。"
    );
    process.exit(0);
  }

  // 既存データを読み込む
  const existingRaw = await readFile(join(DATA_DIR, "posts.json"), "utf-8");
  const existing = JSON.parse(existingRaw);

  const latestId = existing.recentPosts?.[0]?.tweetId ?? null;

  console.log("📡 X API からデータを取得中...");

  const userId = await fetchUserId(OFFICIAL_X_USERNAME, bearerToken);
  console.log(`👤 ユーザーID: ${userId}`);

  const response = await fetchUserTimeline(userId, bearerToken, latestId);

  if (!response.data || response.data.length === 0) {
    console.log("✅ 新規投稿なし");
    return;
  }

  console.log(`📨 ${response.data.length} 件の新規投稿を取得`);

  const todayStr = new Date().toISOString().split("T")[0];
  const newPosts = response.data.map((tweet) => ({
    id: `post-${tweet.id}`,
    tweetId: tweet.id,
    url: `https://x.com/${OFFICIAL_X_USERNAME}/status/${tweet.id}`,
    publishedAt: tweet.created_at,
    category: detectCategory(tweet.text),
    tags: ["ちいかわ"],
    summary: tweet.text.slice(0, 100),
    characters: extractCharacters(tweet.text),
  }));

  const todayPosts = newPosts.filter(
    (p) => p.publishedAt.startsWith(todayStr)
  );

  const allPosts = [
    ...newPosts,
    ...(existing.recentPosts ?? []),
  ].slice(0, 50);

  // カレンダーデータの更新
  const calendarMap = {};
  for (const p of allPosts) {
    const date = p.publishedAt.split("T")[0];
    if (!calendarMap[date]) {
      calendarMap[date] = { date, count: 0, categories: [] };
    }
    calendarMap[date].count++;
    if (!calendarMap[date].categories.includes(p.category)) {
      calendarMap[date].categories.push(p.category);
    }
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const calendarData = Object.values(calendarMap)
    .filter((d) => new Date(d.date) >= cutoff)
    .sort((a, b) => b.date.localeCompare(a.date));

  const updated = {
    lastUpdated: new Date().toISOString(),
    totalPosts: (existing.totalPosts ?? 0) + newPosts.length,
    todayPosts,
    recentPosts: allPosts,
    calendarData,
    chiikawaIndex: existing.chiikawaIndex,
  };

  await writeFile(
    join(DATA_DIR, "posts.json"),
    JSON.stringify(updated, null, 2),
    "utf-8"
  );

  console.log(`✅ データを更新しました（${newPosts.length} 件追加）`);
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
