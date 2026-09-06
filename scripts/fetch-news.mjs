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
import { detectCategory, extractTags } from "./lib/news-tagging.mjs";
import { decodeHtmlEntities, stripTags, cleanSummary } from "./lib/news-text.mjs";
import { applyRetention, archiveArticles, MAX_ARTICLES } from "./lib/news-archive.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
// テストから差し替えられるようにしている（既定は public/data）
const DATA_DIR = process.env.NEWS_DATA_DIR ?? join(__dirname, "..", "public", "data");

const ALERTS_RSS_URL = process.env.GOOGLE_ALERTS_RSS_URL ?? "";

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
    // 元ページのナビや著作権表記を落としてから長さを切り詰める
    const summary = contentM ? cleanSummary(stripTags(contentM[1])).slice(0, 200) : "";

    // ソース名（サイト名）
    const sourceBlockM = block.match(/<source>([\s\S]*?)<\/source>/);
    let source = extractSource(actualUrl);
    if (sourceBlockM) {
      const stM = sourceBlockM[1].match(/<title[^>]*>([\s\S]*?)<\/title>/);
      if (stM) source = stripTags(stM[1]);
    }

    // ID（URL の MD5 ハッシュ先頭12文字）
    const id = `news-${createHash("md5").update(actualUrl).digest("hex").slice(0, 12)}`;

    entries.push({
      id,
      title,
      url: actualUrl,
      source,
      publishedAt,
      summary,
      // 判定に本文を使わない理由は lib/news-tagging.mjs を参照
      category: detectCategory(title),
      tags: extractTags(title),
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
  const relevant = fetched.filter((a) => a.title.includes("ちいかわ"));
  console.log(`📋 フィードから ${fetched.length} 件取得（うちちいかわ関連: ${relevant.length} 件）`);

  const newArticles = relevant.filter((a) => !existingUrls.has(a.url));

  const merged = [...newArticles, ...(existing.articles ?? [])];
  merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // 上限を超えたぶんは年別アーカイブへ退避する（詳細は lib/news-archive.mjs）
  const { kept, dropped } = applyRetention(merged);

  // 退避済みの記事がフィードに再登場すると「新規」として拾ってしまう（重複判定は
  // 掲載中のURLしか見ていないため）。掲載内容が変わらないときは書き込まないことで、
  // lastUpdated だけが動いて無意味なコミットとデプロイが走るのを防ぐ。
  const keptIds = kept.map((a) => a.id).join(",");
  const unchanged = keptIds === (existing.articles ?? []).map((a) => a.id).join(",");

  if (unchanged && dropped.length === 0) {
    console.log("✅ 新規記事なし");
    return;
  }

  for (const { year, added, total } of await archiveArticles(DATA_DIR, dropped)) {
    console.log(`🗃️  ${year} 年のアーカイブへ ${added} 件退避（アーカイブ計 ${total} 件）`);
  }

  if (unchanged) {
    console.log("✅ 掲載記事に変更なし（保持上限を超えた記事のみ退避）");
    return;
  }

  await writeFile(
    newsPath,
    JSON.stringify(
      { lastUpdated: new Date().toISOString(), totalArticles: kept.length, articles: kept },
      null,
      2
    ),
    "utf-8"
  );

  console.log(
    `✅ 更新完了（${newArticles.length} 件追加 / ${dropped.length} 件退避、掲載 ${kept.length} 件・上限 ${MAX_ARTICLES} 件）`
  );
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
