/**
 * 公式Xポストのカテゴリ・タグ・キャラクター判定ロジック（共通化）
 *
 * カテゴリは上から順に判定し、最初に一致したものを採用する。
 * 汎用的すぎる語句（例: 「限定」「#ちいかわ」等）は誤判定の原因になるため使わない。
 */

// 絵文字・pictograph・記号などを除去して「実質的な本文」の有無を判定するための正規表現
const EMOJI_AND_SYMBOLS =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️‍]/gu;
const URL_PATTERN = /https?:\/\/\S+/g;

// カテゴリごとの判定キーワード（配列内は前方から評価されず、いずれか一致すればOK）
// 上から順に評価し、最初に一致したカテゴリを採用する
const CATEGORY_RULES = [
  {
    category: "collab",
    keywords: ["コラボ", "タイアップ", "×", "✕", "ユニクロ", "UNIQLO", "マクドナルド", "ハッピーセット"],
  },
  {
    category: "event",
    keywords: ["イベント", "展示", "ポップアップ", "フェア", "ちいかわらんど", "催事", "PARCO", "パルコ"],
  },
  {
    // 「映画ちいかわ」等はグッズ告知の枕詞としても頻出するため、
    // 商品固有の語句を先に判定してからアニメ本編・劇場版の話題に倒す
    category: "goods",
    keywords: [
      "グッズ", "商品", "発売", "販売", "予約", "再入荷", "一番くじ",
      "マーケット", "パッケージ", "ぬいぐるみ", "フィギュア", "Tシャツ",
    ],
  },
  {
    category: "anime",
    keywords: ["放送", "配信", "TVer", "YouTube", "アニメちいかわ", "映画ちいかわ", "劇場版", "アニメ", "映画"],
  },
  {
    category: "manga",
    keywords: ["漫画", "まんが", "コミック", "単行本", "モーニング", "描き下ろし"],
  },
];

// キャラクター判定キーワード
const CHARACTER_KEYWORDS = {
  ちいかわ: ["ちいかわ"],
  ハチワレ: ["ハチワレ"],
  うさぎ: ["うさぎ"],
  くりまんじゅう: ["くりまんじゅう"],
  モモンガ: ["モモンガ"],
  シーサー: ["シーサー"],
  もんじゃ: ["もんじゃ"],
  セイレーン: ["セイレーン"],
  古本屋: ["古本屋"],
  島二郎: ["島二郎"],
};

// タグとして採用しないノイズ・汎用すぎるハッシュタグ
const GENERIC_TAGS = new Set(["ちいかわ"]);

/**
 * 本文からURL・絵文字・空白を取り除いた「実質テキスト」を返す
 */
function stripToEssentialText(text) {
  return text
    .replace(URL_PATTERN, "")
    .replace(EMOJI_AND_SYMBOLS, "")
    .replace(/\s+/g, "")
    .trim();
}

/**
 * カテゴリ判定
 * 本文がほぼ空（絵文字と画像のみ）の投稿は、公式アカウントが日々投稿する
 * 漫画の1コマ切り抜きである可能性が高いため manga とする
 */
export function detectCategory(text, { mediaCount = 0 } = {}) {
  const essential = stripToEssentialText(text);
  if (essential.length === 0 && mediaCount > 0) {
    return "manga";
  }

  for (const { category, keywords } of CATEGORY_RULES) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return "other";
}

/**
 * キャラクター抽出
 */
export function extractCharacters(text) {
  return Object.entries(CHARACTER_KEYWORDS)
    .filter(([, keywords]) => keywords.some((kw) => text.includes(kw)))
    .map(([char]) => char);
}

/**
 * タグ抽出（ハッシュタグの完全一致リストから生成。正規表現による本文パースは
 * RSS由来の省略（…）でハッシュタグが途中で切れるバグを引き起こすため使わない）
 */
export function extractTagsFromHashtags(hashtags) {
  return [...new Set(hashtags)].filter((tag) => tag && !GENERIC_TAGS.has(tag));
}

/**
 * RSS等の本文からのフォールバック用ハッシュタグ抽出（syndication APIが使えない場合）
 */
export function extractHashtagsFromText(text) {
  return [...text.matchAll(/[#＃]([^\s#＃]+)/gu)].map((m) => m[1]);
}
