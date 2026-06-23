/**
 * @ngnchiikawa の過去ツイートを全件一括取得して posts.json に追加する（一回限りの実行用）
 *
 * 環境変数（GitHub Secrets に設定）:
 *   TWITTER_AUTH_TOKEN  - auth_token クッキー
 *   TWITTER_CSRF_TOKEN  - ct0 クッキー
 *     取得方法: x.com を開き DevTools > Application > Cookies > ct0 の値
 */

import { writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

const AUTH_TOKEN = process.env.TWITTER_AUTH_TOKEN ?? "";
const CSRF_TOKEN = process.env.TWITTER_CSRF_TOKEN ?? "";
const USERNAME = "ngnchiikawa";

const BEARER =
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

// Twitter の GraphQL クエリID（変更される場合は DevTools > Network > UserTweets で確認）
const QID_USER = "qW5u-DAuXpMEG0za1nNbgA";
const QID_TWEETS = "E3opETHurmVJflFsUBVuUQ";

const FEATURES_USER = {
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

const FEATURES_TWEETS = {
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

const HEADERS = {
  Authorization: `Bearer ${BEARER}`,
  Cookie: `auth_token=${AUTH_TOKEN}; ct0=${CSRF_TOKEN}`,
  "x-csrf-token": CSRF_TOKEN,
  "x-twitter-active-user": "yes",
  "x-twitter-auth-type": "OAuth2Session",
  "x-twitter-client-language": "ja",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

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

async function gqlGet(url) {
  const resp = await fetch(url, { headers: HEADERS });
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

async function getUserId(screenName) {
  const vars = encodeURIComponent(
    JSON.stringify({ screen_name: screenName, withSafetyModeUserFields: true })
  );
  const feats = encodeURIComponent(JSON.stringify(FEATURES_USER));
  const url = `https://api.twitter.com/graphql/${QID_USER}/UserByScreenName?variables=${vars}&features=${feats}`;
  const data = await gqlGet(url);
  const userId = data?.data?.user?.result?.rest_id;
  if (!userId) throw new Error(`ユーザーID取得失敗。QID_USER の更新が必要かもしれません。\n${JSON.stringify(data)}`);
  return userId;
}

async function fetchTweetPage(userId, cursor) {
  const variables = { userId, count: 40, includePromotedContent: true, withVoice: true, withV2Timeline: true };
  if (cursor) variables.cursor = cursor;
  const vars = encodeURIComponent(JSON.stringify(variables));
  const feats = encodeURIComponent(JSON.stringify(FEATURES_TWEETS));
  const url = `https://api.twitter.com/graphql/${QID_TWEETS}/UserTweets?variables=${vars}&features=${feats}`;
  return gqlGet(url);
}

function parsePage(data) {
  const instructions =
    data?.data?.user?.result?.timeline_v2?.timeline?.instructions ?? [];
  const tweets = [];
  let nextCursor = null;

  for (const instr of instructions) {
    if (instr.type !== "TimelineAddEntries") continue;
    for (const entry of instr.entries ?? []) {
      const content = entry.content ?? {};
      // カーソル
      if (content.entryType === "TimelineTimelineCursor" && content.cursorType === "Bottom") {
        nextCursor = content.value;
        continue;
      }
      // ツイート
      const tweetResult = content.itemContent?.tweet_results?.result;
      if (!tweetResult) continue;
      const legacy = (tweetResult.tweet ?? tweetResult).legacy;
      if (!legacy) continue;
      if (legacy.retweeted_status_id_str) continue; // RTを除外
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
  console.log(`🔍 @${USERNAME} のユーザーID を取得中...`);

  const userId = await getUserId(USERNAME);
  console.log(`✅ userId: ${userId}`);

  let cursor = null;
  let pageCount = 0;
  let totalAdded = 0;

  while (true) {
    const data = await fetchTweetPage(userId, cursor);
    const { tweets, nextCursor } = parsePage(data);
    pageCount++;

    let addedThisPage = 0;
    for (const legacy of tweets) {
      if (allPosts.has(legacy.id_str)) continue;
      const text = legacy.full_text ?? legacy.text ?? "";
      allPosts.set(legacy.id_str, {
        id: `post-${legacy.id_str}`,
        tweetId: legacy.id_str,
        url: `https://x.com/${USERNAME}/status/${legacy.id_str}`,
        publishedAt: new Date(legacy.created_at).toISOString(),
        category: detectCategory(text),
        tags: [],
        characters: extractCharacters(text),
      });
      addedThisPage++;
      totalAdded++;
    }

    const oldestInPage = tweets.reduce(
      (a, b) => (new Date(a.created_at) < new Date(b.created_at) ? a : b),
      tweets[0]
    );
    const oldestDate = oldestInPage ? toJstDateStr(new Date(oldestInPage.created_at).toISOString()) : "?";
    console.log(`  ページ ${pageCount}: ${addedThisPage}件追加 / 最古 ${oldestDate} / 累計 ${allPosts.size}件`);

    if (!nextCursor || tweets.length === 0) {
      console.log("✅ 全件取得完了");
      break;
    }
    cursor = nextCursor;

    await new Promise((r) => setTimeout(r, 800));
  }

  const merged = [...allPosts.values()].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
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
