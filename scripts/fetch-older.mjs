/**
 * @ngnchiikawa の過去ツイートを全件一括取得して posts.json に追加する（一回限りの実行用）
 *
 * 環境変数（GitHub Secrets に設定）:
 *   TWITTER_AUTH_TOKEN  - auth_token クッキー
 *   TWITTER_CSRF_TOKEN  - ct0 クッキー
 */

import { writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { detectCategory, extractCharacters, extractTagsFromHashtags } from "./lib/tagging.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

const AUTH_TOKEN = process.env.TWITTER_AUTH_TOKEN ?? "";
const CSRF_TOKEN = process.env.TWITTER_CSRF_TOKEN ?? "";
const USERNAME = "ngnchiikawa";

const BEARER =
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

const GQL_FEATURES_USER = {
  hidden_profile_likes_enabled: true,
  hidden_profile_subscriptions_enabled: true,
  responsive_web_graphql_exclude_directive_enabled: true,
  verified_phone_label_enabled: false,
  subscriptions_verification_info_is_identity_verified_enabled: true,
  subscriptions_verification_info_verified_since_enabled: true,
  highlights_tweets_tab_ui_enabled: true,
  creator_subscriptions_tweet_preview_api_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  responsive_web_graphql_timeline_navigation_enabled: true,
};

const GQL_FEATURES_TWEETS = {
  rweb_lists_timeline_redesign_enabled: true,
  responsive_web_graphql_exclude_directive_enabled: true,
  verified_phone_label_enabled: false,
  creator_subscriptions_tweet_preview_api_enabled: true,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  tweetypie_unmention_optimization_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  view_counts_everywhere_api_enabled: true,
  longform_notetweets_consumption_enabled: true,
  tweet_awards_web_tipping_enabled: false,
  freedom_of_speech_not_reach_fetch_enabled: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: false,
  longform_notetweets_rich_text_read_enabled: true,
  longform_notetweets_inline_media_enabled: false,
  responsive_web_enhance_cards_enabled: false,
};

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

function authHeaders() {
  return {
    Authorization: `Bearer ${BEARER}`,
    Cookie: `auth_token=${AUTH_TOKEN}; ct0=${CSRF_TOKEN}`,
    "x-csrf-token": CSRF_TOKEN,
    "x-twitter-active-user": "yes",
    "x-twitter-auth-type": "OAuth2Session",
    "x-twitter-client-language": "ja",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  };
}

async function gqlGet(url) {
  const resp = await fetch(url, { headers: authHeaders() });
  if (resp.status === 429) {
    const reset = resp.headers.get("x-rate-limit-reset");
    const waitSec = reset ? Math.max(5, parseInt(reset) - Math.floor(Date.now() / 1000) + 5) : 60;
    console.log(`⏳ レート制限。${waitSec}秒待機...`);
    await new Promise((r) => setTimeout(r, waitSec * 1000));
    return gqlGet(url);
  }
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${body}`);
  }
  return resp.json();
}

// Twitter の JS バンドルから最新のクエリ ID を動的に取得
async function discoverQueryIds() {
  console.log("🔍 クエリIDを Twitter の JS バンドルから取得中...");

  const pageResp = await fetch(`https://x.com/${USERNAME}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Cookie: `auth_token=${AUTH_TOKEN}; ct0=${CSRF_TOKEN}`,
      "Accept-Language": "ja,en;q=0.9",
    },
    redirect: "follow",
  });

  if (!pageResp.ok) throw new Error(`プロフィールページ取得失敗: HTTP ${pageResp.status}`);
  const html = await pageResp.text();

  // JS バンドルの URL を抽出
  const scriptUrls = [...html.matchAll(/src="(https:\/\/abs\.twimg\.com\/[^"]+\.js[^"]*)"/g)]
    .map((m) => m[1])
    .filter((u) => !u.includes("emoji") && !u.includes("moment"));

  if (scriptUrls.length === 0) {
    throw new Error("JSバンドルのURLが見つかりません。auth_token / ct0 が正しいか確認してください。");
  }

  console.log(`  ${scriptUrls.length}件のJSバンドルを検索中...`);

  const ids = {};
  const targets = ["UserByScreenName", "UserTweets"];

  for (const url of scriptUrls) {
    if (targets.every((t) => ids[t])) break;

    let js;
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
      if (!r.ok) continue;
      js = await r.text();
    } catch {
      continue;
    }

    for (const target of targets) {
      if (ids[target]) continue;
      // パターン1: queryId:"xxx",operationName:"UserTweets"
      let match = js.match(new RegExp(`queryId:"([^"]+)",operationName:"${target}"`));
      // パターン2: operationName:"UserTweets",queryId:"xxx"
      if (!match) match = js.match(new RegExp(`operationName:"${target}",queryId:"([^"]+)"`));
      if (match) {
        ids[target] = match[1];
        console.log(`  ✓ ${target}: ${match[1]}`);
      }
    }
  }

  const missing = targets.filter((t) => !ids[t]);
  if (missing.length > 0) {
    throw new Error(
      `クエリIDが見つかりませんでした: ${missing.join(", ")}\n` +
        "auth_token / ct0 の期限が切れているかもしれません。値を更新してください。"
    );
  }

  return ids;
}

async function getUserId(queryId, screenName) {
  const vars = encodeURIComponent(
    JSON.stringify({ screen_name: screenName, withSafetyModeUserFields: true })
  );
  const feats = encodeURIComponent(JSON.stringify(GQL_FEATURES_USER));
  const url = `https://api.twitter.com/graphql/${queryId}/UserByScreenName?variables=${vars}&features=${feats}`;
  const data = await gqlGet(url);
  const userId = data?.data?.user?.result?.rest_id;
  if (!userId) throw new Error(`ユーザーID取得失敗: ${JSON.stringify(data)}`);
  return userId;
}

async function fetchTweetPage(queryId, userId, cursor) {
  const variables = {
    userId,
    count: 40,
    includePromotedContent: true,
    withVoice: true,
    withV2Timeline: true,
  };
  if (cursor) variables.cursor = cursor;
  const vars = encodeURIComponent(JSON.stringify(variables));
  const feats = encodeURIComponent(JSON.stringify(GQL_FEATURES_TWEETS));
  const url = `https://api.twitter.com/graphql/${queryId}/UserTweets?variables=${vars}&features=${feats}`;
  return gqlGet(url);
}

function parsePage(data, debugFirst = false) {
  // timeline_v2 と timeline の両方を試みる
  const userResult = data?.data?.user?.result;
  const instructions =
    userResult?.timeline_v2?.timeline?.instructions ??
    userResult?.timeline?.timeline?.instructions ??
    [];

  if (debugFirst) {
    // 構造をデバッグ出力（値は省略しキー名のみ）
    const summarize = (obj, depth = 0) => {
      if (depth > 3 || obj === null || obj === undefined) return String(obj);
      if (Array.isArray(obj)) return `[Array(${obj.length})]`;
      if (typeof obj === "object") {
        const keys = Object.keys(obj);
        if (depth >= 2) return `{${keys.join(",")}}`;
        return `{${keys.map((k) => `${k}:${summarize(obj[k], depth + 1)}`).join(", ")}}`;
      }
      return typeof obj === "string" ? `"${obj.slice(0, 30)}"` : String(obj);
    };
    console.log("  [DEBUG] レスポンス構造:", summarize(data));
    console.log("  [DEBUG] instructions 件数:", instructions.length);
    if (instructions.length > 0) {
      instructions.forEach((instr, i) => {
        console.log(`  [DEBUG] instruction[${i}]: type=${instr.type}, entries=${instr.entries?.length ?? "n/a"}`);
      });
    }
  }

  const tweets = [];
  let nextCursor = null;

  for (const instr of instructions) {
    if (instr.type !== "TimelineAddEntries") continue;
    for (const entry of instr.entries ?? []) {
      const content = entry.content ?? {};

      // カーソル（Bottom）
      if (
        content.entryType === "TimelineTimelineCursor" &&
        content.cursorType === "Bottom"
      ) {
        nextCursor = content.value;
        continue;
      }
      // ツイート（TimelineTimelineItem または TimelineTimelineModule 内）
      const itemContent = content.itemContent ?? content;
      const tweetResult = itemContent?.tweet_results?.result;
      if (!tweetResult) continue;
      const legacy = (tweetResult.tweet ?? tweetResult).legacy;
      if (!legacy || legacy.retweeted_status_id_str) continue;
      tweets.push(legacy);
    }
  }
  return { tweets, nextCursor };
}

async function main() {
  if (!AUTH_TOKEN || !CSRF_TOKEN) {
    console.error("❌ TWITTER_AUTH_TOKEN と TWITTER_CSRF_TOKEN を GitHub Secrets に設定してください");
    process.exit(1);
  }

  const postsPath = join(DATA_DIR, "posts.json");
  const raw = await readFile(postsPath, "utf-8");
  const existing = JSON.parse(raw);
  const existingPosts = existing.posts ?? [];
  const allPosts = new Map(existingPosts.map((p) => [p.tweetId, p]));

  console.log(`📚 現在のアーカイブ: ${allPosts.size}件`);

  // クエリID を動的に取得
  const qids = await discoverQueryIds();

  // ユーザーID を取得
  console.log(`🔍 @${USERNAME} のユーザーIDを取得中...`);
  const userId = await getUserId(qids.UserByScreenName, USERNAME);
  console.log(`✅ userId: ${userId}`);

  let cursor = null;
  let pageCount = 0;
  let totalAdded = 0;

  while (true) {
    const data = await fetchTweetPage(qids.UserTweets, userId, cursor);
    const { tweets, nextCursor } = parsePage(data, pageCount === 0);
    pageCount++;

    let addedThisPage = 0;
    for (const legacy of tweets) {
      if (allPosts.has(legacy.id_str)) continue;
      const text = legacy.full_text ?? legacy.text ?? "";
      const hashtags = (legacy.entities?.hashtags ?? []).map((h) => h.text);
      const mediaCount = (legacy.extended_entities?.media ?? legacy.entities?.media ?? []).length;
      allPosts.set(legacy.id_str, {
        id: `post-${legacy.id_str}`,
        tweetId: legacy.id_str,
        url: `https://x.com/${USERNAME}/status/${legacy.id_str}`,
        publishedAt: new Date(legacy.created_at).toISOString(),
        category: detectCategory(text, { mediaCount }),
        tags: extractTagsFromHashtags(hashtags),
        characters: extractCharacters(text),
      });
      addedThisPage++;
      totalAdded++;
    }

    const oldestInPage = tweets.length
      ? tweets.reduce((a, b) =>
          new Date(a.created_at) < new Date(b.created_at) ? a : b
        )
      : null;
    const oldestDate = oldestInPage
      ? toJstDateStr(new Date(oldestInPage.created_at).toISOString())
      : "?";

    console.log(
      `  ページ ${pageCount}: ${addedThisPage}件追加 / 最古 ${oldestDate} / 累計 ${allPosts.size}件`
    );

    if (!nextCursor) {
      console.log("✅ 全件取得完了");
      break;
    }
    cursor = nextCursor;
    await new Promise((r) => setTimeout(r, 800));
  }

  const merged = [...allPosts.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const oldest = merged[merged.length - 1];

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

  console.log(`\n🎉 完了: 合計 ${merged.length}件（${totalAdded}件追加）`);
  console.log(`   最古: ${toJstDateStr(oldest.publishedAt)} (${oldest.tweetId})`);
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
