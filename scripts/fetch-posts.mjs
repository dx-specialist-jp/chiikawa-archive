/**
 * RSSHub 経由で ngnchiikawa の公式X投稿を取得し posts.json を更新する
 *
 * 環境変数:
 *   RSSHUB_URL        - RSSHub のベース URL（省略時: https://rsshub.app）
 *   RSSHUB_ACCESS_KEY - RSSHub の ACCESS_KEY（省略可）
 */

import { writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");
const OFFICIAL_X_USERNAME = "ngnchiikawa";

const RSSHUB_URL = process.env.RSSHUB_URL;
const RSSHUB_BASE = (RSSHUB_URL ?? "https://rsshub.app").replace(/\/$/, "");
const RSSHUB_ACCESS_KEY = process.env.RSSHUB_ACCESS_KEY ?? "";

const CATEGORY_KEYWORDS = {
  manga: ["漫画", "まんが", "コミック", "#ちいかわ", "更新"],
  goods: ["グッズ", "商品", "発売", "販売", "限定", "コラボ商品", "ぬいぐるみ", "フィギュア"],
  anime: ["アニメ", "放送", "配信", "映画", "劇場"],
  collab: ["コラボ", "×", "✕"],
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

// CDATA・HTML エンティティ・タグを除去してテキストを抽出
function extractXmlText(xml, tag) {
  const regex = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))<\\/${tag}>`,
    "s"
  );
  const match = xml.match(regex);
  if (!match) return "";
  return (match[1] ?? match[2] ?? "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function buildFeedUrl(username) {
  const path = `${RSSHUB_BASE}/twitter/user/${username}`;
  return (RSSHUB_ACCESS_KEY && RSSHUB_URL) ? `${path}?key=${RSSHUB_ACCESS_KEY}` : path;
}

async function fetchRssFeed(username) {
  const url = buildFeedUrl(username);
  console.log(`📡 RSS 取得中: ${RSSHUB_BASE}/twitter/user/${username}`);

  const res = await fetch(url, {
    headers: { "User-Agent": "chiikawa-archive/1.0" },
    signal: AbortSignal.timeout(90000),
  });

  if (!res.ok) {
    throw new Error(`RSSHub 応答エラー: ${res.status} ${res.statusText}`);
  }

  return parseRssItems(await res.text());
}

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const linkMatch =
      itemXml.match(/<link><!\[CDATA\[([^\]]+)\]\]><\/link>/) ??
      itemXml.match(/<link>([^<]+)<\/link>/);
    const link = linkMatch?.[1]?.trim() ?? "";

    const tweetIdMatch = link.match(/\/status\/(\d+)/);
    if (!tweetIdMatch) continue;

    const pubDateStr = extractXmlText(itemXml, "pubDate");
    const title = extractXmlText(itemXml, "title");
    const description = extractXmlText(itemXml, "description");
    const text = title || description;

    const d = new Date(pubDateStr);
    if (isNaN(d.getTime())) continue;
    const publishedAt = d.toISOString();

    items.push({ tweetId: tweetIdMatch[1], link, text, publishedAt });
  }

  return items;
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
  let existing = { lastUpdated: new Date().toISOString(), totalPosts: 0, posts: [], calendarData: [], chiikawaIndex: null };
  try {
    const existingRaw = await readFile(join(DATA_DIR, "posts.json"), "utf-8");
    existing = JSON.parse(existingRaw);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    console.log("📄 posts.json が存在しないため新規作成します");
  }
  const existingPosts = existing.posts ?? [];
  const existingIds = new Set(existingPosts.map((p) => p.tweetId));

  const rssItems = await fetchRssFeed(OFFICIAL_X_USERNAME);
  console.log(`📋 RSS から ${rssItems.length} 件取得`);

  const newPosts = rssItems
    .filter((item) => !existingIds.has(item.tweetId))
    .map((item) => ({
      id: `post-${item.tweetId}`,
      tweetId: item.tweetId,
      url: item.link,
      publishedAt: item.publishedAt,
      category: detectCategory(item.text),
      tags: [...item.text.matchAll(/[#＃]([\p{L}\p{N}_]+)/gu)].map((m) => m[1]),
      characters: extractCharacters(item.text),
    }));

  if (newPosts.length === 0) {
    console.log("✅ 新規投稿なし");
    return;
  }

  console.log(`✨ ${newPosts.length} 件の新着を追加`);

  const merged = [...newPosts, ...existingPosts];

  const updated = {
    lastUpdated: new Date().toISOString(),
    totalPosts: merged.length,
    posts: merged,
    calendarData: buildCalendarData(merged),
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
