/**
 * 投稿本文（Xポストのテキスト）の整形
 *
 * 本文は /search のキーワード検索に使う（投稿カードには出さない。X の埋め込みが
 * 同じ本文を表示するため）。取得元の text には画像への t.co リンクがそのまま
 * 入るため落とす。公式アカウントの投稿は漫画1コマ＋絵文字だけというものが
 * 3割ほどあり、検索の役に立たないので本文としては保存しない。
 */

/** 本文として保存する最大文字数 */
const MAX_LENGTH = 300;

/** 絵文字・空白を除いてこの文字数に満たなければ「本文なし」とみなす */
const MIN_MEANINGFUL_LENGTH = 4;

export function toSummary(text) {
  const body = (text ?? "")
    .replace(/https?:\/\/t\.co\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const meaningful = body.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\s]/gu, "");
  return meaningful.length >= MIN_MEANINGFUL_LENGTH ? body.slice(0, MAX_LENGTH) : "";
}
