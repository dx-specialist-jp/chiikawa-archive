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

  return summary.replace(/\s+/g, " ").trim();
}
