/**
 * @ngnchiikawa の過去ツイートを全件一括取得して posts.json に追加する（一回限りの実行用）
 *
 * 環境変数:
 *   TWITTER_AUTH_TOKEN  - auth_token クッキー（GitHub Secrets 設定済み）
 *   TWITTER_CSRF_TOKEN  - ct0 クッキー（必要な場合のみ）
 *
 * ct0 が不要な場合: アプリ認証（Bearer トークン）で試みる
 * 403/401 が返った場合: TWITTER_CSRF_TOKEN を設定して再実行
 *
 * ct0 の取得方法:
 *   1. ブラウザで x.com にログイン
 *   2. DevTools > Application > Cookies > https://x.com
 *   3. "ct0" の値をコピー → GitHub Secrets に TWITTER_CSRF_TOKEN として追加
 */

import { writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

const AUTH_TOKEN = process.env.TWITTER_AUTH_TOKEN ?? "";
const CSRF_TOKEN = process.env.TWITTER_CSRF_TOKEN ?? "";
const BATCH_SIZE = 100; // 1リクエストあたりの最大取得件数
const USERNAME = "ngnchiikawa";

// Twitter ウェブアプリ組み込みの Bearer トークン
const BEARER =
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

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
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((kw) => text.includes(kw))) return cat;
  }
  return "other";
}

function extractCharacters(text) {
  return Object.entries(CHARACTER_KEYWORDS)
    .filter(([, kws]) => kws.some((kw) => text.includes(kw)))
    .map(([c]) => c);
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
    if (!map[date].categories.includes(p.category)) map[date].categories.push(p.category);
  }
  return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
}

function buildHeaders(useUserAuth) {
  const base = { Authorization: `Bearer ${BEARER}` };
  if (!useUserAuth) return base;
  return {
    ...base,
    Cookie: `auth_token=${AUTH_TOKEN}; ct0=${CSRF_TOKEN}`,
    "x-csrf-token": CSRF_TOKEN,
    "x-twitter-active-user": "yes",
    "x-twitter-auth-type": "OAuth2Session",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  };
}

async function fetchBatch(maxId, useUserAuth) {
  const params = new URLSearchParams({
    screen_name: USERNAME,
    count: String(BATCH_SIZE),
    include_rts: "false",
    tweet_mode: "extended",
  });
  if (maxId) params.set("max_id", maxId);

  const url = `https://api.twitter.com/1.1/statuses/user_timeline.json?${params}`;
  const resp = await fetch(url, { headers: buildHeaders(useUserAuth) });

  if (resp.status === 429) {
    const reset = resp.headers.get("x-rate-limit-reset");
    const waitSec = reset ? Math.max(5, parseInt(reset) - Math.floor(Date.now() / 1000) + 5) : 60;
    console.log(`⏳ レート制限。${waitSec}秒待機...`);
    await new Promise((r) => setTimeout(r, waitSec * 1000));
    return fetchBatch(maxId, useUserAuth);
  }

  return resp;
}

async function main() {
  const postsPath = join(DATA_DIR, "posts.json");
  const raw = await readFile(postsPath, "utf-8");
  const existing = JSON.parse(raw);
  const existingPosts = existing.posts ?? [];
  const allPosts = new Map(existingPosts.map((p) => [p.tweetId, p]));

  console.log(`📚 現在のアーカイブ: ${allPosts.size}件`);

  // 認証方法を確定（アプリ認証で試し、失敗したらユーザー認証）
  let useUserAuth = false;
  {
    const testResp = await fetchBatch(null, false);
    if (testResp.status === 401 || testResp.status === 403) {
      if (!AUTH_TOKEN || !CSRF_TOKEN) {
        console.error(`❌ アプリ認証失敗 (HTTP ${testResp.status})`);
        console.error("   TWITTER_CSRF_TOKEN を GitHub Secrets に追加してください");
        console.error("   取得: x.com を開き DevTools > Application > Cookies > ct0 の値");
        process.exit(1);
      }
      console.log("ℹ️  ユーザー認証を使用します");
      useUserAuth = true;
    } else if (!testResp.ok) {
      const body = await testResp.text();
      throw new Error(`初回リクエスト失敗: HTTP ${testResp.status}: ${body}`);
    } else {
      const firstBatch = await testResp.json();
      console.log(`✅ アプリ認証OK（${Array.isArray(firstBatch) ? firstBatch.length : 0}件取得）`);
      // 最初のバッチを処理
      if (Array.isArray(firstBatch)) {
        for (const t of firstBatch) {
          if (!allPosts.has(t.id_str)) {
            const text = t.full_text ?? t.text ?? "";
            allPosts.set(t.id_str, {
              id: `post-${t.id_str}`,
              tweetId: t.id_str,
              url: `https://x.com/${USERNAME}/status/${t.id_str}`,
              publishedAt: new Date(t.created_at).toISOString(),
              category: detectCategory(text),
              tags: [],
              characters: extractCharacters(text),
            });
          }
        }
      }
    }
  }

  // 最古 ID から遡って全件取得
  let pageCount = 1;
  while (true) {
    const minId = [...allPosts.keys()].reduce((a, b) => (BigInt(a) < BigInt(b) ? a : b));
    const maxId = (BigInt(minId) - 1n).toString();

    const resp = await fetchBatch(maxId, useUserAuth);
    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${body}`);
    }

    const batch = await resp.json();
    if (!Array.isArray(batch) || batch.length === 0) {
      console.log("✅ 全件取得完了（これ以上古いツイートはありません）");
      break;
    }

    let added = 0;
    for (const t of batch) {
      if (!allPosts.has(t.id_str)) {
        const text = t.full_text ?? t.text ?? "";
        allPosts.set(t.id_str, {
          id: `post-${t.id_str}`,
          tweetId: t.id_str,
          url: `https://x.com/${USERNAME}/status/${t.id_str}`,
          publishedAt: new Date(t.created_at).toISOString(),
          category: detectCategory(text),
          tags: [],
          characters: extractCharacters(text),
        });
        added++;
      }
    }

    const oldestInBatch = batch.reduce((a, b) =>
      new Date(a.created_at) < new Date(b.created_at) ? a : b
    );
    console.log(
      `  バッチ ${pageCount}: ${added}件追加 / 最古 ${toJstDateStr(new Date(oldestInBatch.created_at).toISOString())} / 累計 ${allPosts.size}件`
    );

    if (added === 0) {
      console.log("✅ 全件取得完了（重複なし = 末尾に到達）");
      break;
    }

    pageCount++;
    // Twitter API の緩やかなレート制限対策
    await new Promise((r) => setTimeout(r, 1000));
  }

  const merged = [...allPosts.values()].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );

  await writeFile(
    postsPath,
    JSON.stringify(
      {
        lastUpdated: new Date().toISOString(),
        totalPosts: merged.length,
        posts: merged,
        calendarData: buildCalendarData(merged),
      },
      null,
      2
    ),
    "utf-8"
  );

  const oldest = merged[merged.length - 1];
  console.log(`\n🎉 完了: ${merged.length}件`);
  console.log(`   最古投稿: ${toJstDateStr(oldest.publishedAt)} (${oldest.tweetId})`);
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
