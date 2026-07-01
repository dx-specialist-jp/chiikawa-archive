/**
 * Google アラート RSS(Atom) から ちいかわ関連ニュースを取得し news.json を更新する
 *
 * 環境変数:
 *   GOOGLE_ALERTS_RSS_URL - Google アラートのフィード URL
 */

import { writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

const ALERTS_RSS_URL = process.env.GOOGLE_ALERTS_RSS_URL ?? "";

const CATEGORY_KEYWORDS = {
  collab: ["コラボ", "ユニクロ", "UNIQLO", "マクドナルド", "ハッピーセット", "×"],
  event: ["イベント", "展示", "ポップアップ", "フェア", "横浜", "まつり", "ランド"],
  manga: ["漫画", "まんが", "コミック", "単行本"],
  anime: ["アニメ", "放送", "TVer", "テレビ", "劇場版", "映画"],
  goods: ["グッズ", "商品", "発売", "販売", "限定", "Tシャツ", "UT", "バウム", "パン", "フィギュア", "ぬいぐるみ", "ベーカリー"],
};

// タグルール: { タグ名: 検索キーワード配列 }
const TAG_RULES = {
  // キャラクター
  ちいかわ: ["ちいかわ"],
  ハチワレ: ["ハチワレ"],
  うさぎ: ["うさぎ"],
  くりまんじゅう: ["くりまんじゅう"],
  モモンガ: ["モモンガ"],
  シーサー: ["シーサー"],
  もんじゃ: ["もんじゃ"],
  セイレーン: ["セイレーン"],
  古本屋: ["古本屋"],
  // 企業コラボ
  ユニクロ: ["ユニクロ", "UNIQLO", "UT"],
  マクドナルド: ["マクドナルド", "ハッピーセット"],
  // 商品ジャンル
  Tシャツ: ["Tシャツ", "スウェット"],
  ぬいぐるみ: ["ぬいぐるみ", "マスコット"],
  フィギュア: ["フィギュア", "3D"],
  お菓子: ["バウム", "焼き", "スイーツ", "お菓子", "ケーキ"],
  パン: ["パン", "ベーカリー"],
  食品: ["食べ", "グルメ", "フード", "料理", "飲食"],
  // メディア
  映画: ["映画", "劇場版"],
  アニメ: ["アニメ", "放送", "TVer"],
  漫画: ["漫画", "まんが"],
  // 場所
  横浜: ["横浜"],
  // イベント・場所
  ポップアップ: ["ポップアップ", "期間限定", "フェア"],
  ちいかわらんど: ["ちいかわらんど"],
  // 映画タイトル
  人魚の島: ["人魚の島", "人魚"],
  // 限定
  限定: ["限定", "先行発売"],
};

function extractTags(text) {
  return Object.entries(TAG_RULES)
    .filter(([, keywords]) => keywords.some((kw) => text.includes(kw)))
    .map(([tag]) => tag);
}

function detectCategory(text) {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return "other";
}

function extractActualUrl(googleUrl) {
  try {
    const u = new URL(googleUrl);
    return u.searchParams.get("url") ?? googleUrl;
  } catch {
    return googleUrl;
  }
}

function extractSource(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&nbsp;/g, " ")
    .replace(/&#160;/g, " ")
    .replace(/&middot;/g, "·")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function stripTags(html) {
  const decoded = decodeHtmlEntities(html).replace(/<[^>]+>/g, " ");
  return decodeHtmlEntities(decoded).replace(/\s+/g, " ").trim();
}

function parseAtomEntries(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let m;

  while ((m = entryRegex.exec(xml)) !== null) {
    const block = m[1];

    // Google リダイレクト URL を含む link[rel=alternate] を取得
    const allLinks = [...block.matchAll(/<link([^>]*?)(?:\/>|><\/link>)/g)];
    let googleUrl = "";
    for (const lm of allLinks) {
      const attrs = lm[1];
      if (attrs.includes('rel="alternate"') || !attrs.includes("rel=")) {
        const hrefM = attrs.match(/href="([^"]+)"/);
        if (hrefM) {
          googleUrl = decodeHtmlEntities(hrefM[1]);
          break;
        }
      }
    }
    if (!googleUrl) continue;

    const actualUrl = extractActualUrl(googleUrl);

    // 更新日時
    const dateM = block.match(/<updated>([^<]+)<\/updated>/);
    if (!dateM) continue;
    const dateObj = new Date(dateM[1].trim());
    if (isNaN(dateObj.getTime())) continue;
    const publishedAt = dateObj.toISOString();

    // タイトル
    const titleM = block.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const title = titleM ? stripTags(titleM[1]) : "";

    // 本文（概要）
    const contentM = block.match(/<content[^>]*>([\s\S]*?)<\/content>/);
    const summary = contentM ? stripTags(contentM[1]).slice(0, 200) : "";

    // ソース名（サイト名）
    const sourceBlockM = block.match(/<source>([\s\S]*?)<\/source>/);
    let source = extractSource(actualUrl);
    if (sourceBlockM) {
      const stM = sourceBlockM[1].match(/<title[^>]*>([\s\S]*?)<\/title>/);
      if (stM) source = stripTags(stM[1]);
    }

    // ID（URL の MD5 ハッシュ先頭12文字）
    const id = `news-${createHash("md5").update(actualUrl).digest("hex").slice(0, 12)}`;

    const text = title + " " + summary;
    entries.push({
      id,
      title,
      url: actualUrl,
      source,
      publishedAt,
      summary,
      category: detectCategory(text),
      tags: extractTags(text),
    });
  }

  return entries;
}

async function main() {
  if (!ALERTS_RSS_URL) {
    console.log("⚠️ GOOGLE_ALERTS_RSS_URL が未設定のためスキップします");
    return;
  }

  const newsPath = join(DATA_DIR, "news.json");
  let existing = { lastUpdated: new Date().toISOString(), totalArticles: 0, articles: [] };
  try {
    const raw = await readFile(newsPath, "utf-8");
    existing = JSON.parse(raw);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    console.log("📄 news.json が存在しないため新規作成します");
  }

  const existingUrls = new Set((existing.articles ?? []).map((a) => a.url));

  console.log("📡 Google アラート RSS 取得中...");
  const res = await fetch(ALERTS_RSS_URL, {
    headers: { "User-Agent": "chiikawa-archive/1.0" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`RSS 応答エラー: ${res.status} ${res.statusText}`);

  const fetched = parseAtomEntries(await res.text());
  const relevant = fetched.filter((a) => (a.title + " " + a.summary).includes("ちいかわ"));
  console.log(`📋 フィードから ${fetched.length} 件取得（うちちいかわ関連: ${relevant.length} 件）`);

  const newArticles = relevant.filter((a) => !existingUrls.has(a.url));
  if (newArticles.length === 0) {
    console.log("✅ 新規記事なし");
    return;
  }

  const merged = [...newArticles, ...(existing.articles ?? [])];
  merged.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  await writeFile(
    newsPath,
    JSON.stringify(
      { lastUpdated: new Date().toISOString(), totalArticles: merged.length, articles: merged },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`✅ 更新完了（${newArticles.length} 件追加、合計 ${merged.length} 件）`);
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
