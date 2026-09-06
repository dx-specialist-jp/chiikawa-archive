/**
 * Google アラート由来のテキストの整形
 *
 * フィードの content は元ページの HTML をそのまま持ってくるため、記事本文だけで
 * なくグローバルナビ・関連記事欄・著作権表記まで混ざっている。そのまま
 * ニュースカードに出すと「新商品 · クルマ · 写真ニュース ...」のような
 * サイトの部品が本文として表示される（2000件中228件が該当していた）。
 */

/** HTML 実体参照をデコードする */
export function decodeHtmlEntities(str) {
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

/** HTML からテキストだけを取り出す（実体参照はタグ除去の前後2回デコードする） */
export function stripTags(html) {
  const decoded = decodeHtmlEntities(html).replace(/<[^>]+>/g, " ");
  return decodeHtmlEntities(decoded).replace(/\s+/g, " ").trim();
}

/**
 * ここから後ろは記事本文ではなく、関連記事欄やランキングなどページの部品。
 * 「ランキング」単体は「週末ランキング1位」のように本文にも出るため使わない。
 */
const BOILERPLATE_MARKERS = [
  "関連記事",
  "あわせて読みたい",
  "おすすめタグ",
  "編集部おすすめ記事",
  "写真の記事を読む",
  "提供元の記事",
  "新着記事",
  "LATEST ARTICLE",
  "アクセスランキング",
  "ニュースランキング",
  "ランキングをもっと見る",
  "もっと見る",
  "毎日 発売 される単行本",
  "この記事に関する別の画像",
];

/** 見出しの手前に本文として意味のある長さが残っているときだけ切り詰める */
const MIN_KEPT_LENGTH = 20;

const OPENING_BRACKETS = ["【", "「", "『", "（", "(", "["];
const CLOSING_BRACKETS = /[】」』）)\]]/;

/** 閉じられていない括弧が末尾に残ったら、その括弧から後ろを捨てる */
function dropUnclosedBracket(text) {
  const lastOpen = Math.max(...OPENING_BRACKETS.map((bracket) => text.lastIndexOf(bracket)));
  if (lastOpen < 0 || CLOSING_BRACKETS.test(text.slice(lastOpen))) return text;
  return text.slice(0, lastOpen);
}

function cutAtBoilerplate(summary) {
  let cut = summary.length;
  for (const marker of BOILERPLATE_MARKERS) {
    const index = summary.indexOf(marker);
    if (index >= 0 && index < cut) cut = index;
  }
  if (cut === summary.length) return summary;

  // 見出しが「【ちいかわ関連記事】」のように括弧の中にあると開き括弧側が残る
  const kept = dropUnclosedBracket(summary.slice(0, cut))
    // 区切り由来の記号だけを落とす（文末の「。」「！」は本文の一部なので残す）
    .replace(/[\s.,、・･:：\-—]+$/u, "")
    .trim();
  return kept.length >= MIN_KEPT_LENGTH ? kept : summary;
}

/**
 * 概要文からナビゲーションの断片を落とす。
 *
 * 中黒などで区切られた短い断片はメニュー項目とみなして捨て、記事本文らしい
 * 断片（「ちいかわ」を含む、または20文字以上）だけを残す。判断がつかず全部
 * 捨てることになる場合は元の並びをそのまま使う（空にはしない）。
 */
export function cleanSummary(text) {
  let summary = text
    .replace(/Copyright[\s\S]*$/i, "")
    .replace(/©[\s\S]*$/, "")
    .replace(/>>\S+/g, " ")
    .replace(/^[\s.…]+/, "");

  const parts = summary.split(/\s*[·・|｜>]\s*/);
  if (parts.length > 1) {
    const kept = parts.filter(
      (part) => part.includes("ちいかわ") || part.replace(/\s/g, "").length >= 20
    );
    if (kept.length > 0) summary = kept.join(" ");
  }

  return cutAtBoilerplate(summary.replace(/\s+/g, " ").trim());
}
