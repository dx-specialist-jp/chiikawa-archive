/**
 * gallery.json の書き込み内容を落ち着かせるためのヘルパー
 *
 * Tally の File Upload は取得のたびに新しい accessToken 付きの URL を返す。
 * そのまま保存すると投稿が1件も増えていなくても gallery.json が毎回変わり、
 * 4時間ごとに実体のないコミットとデプロイが走る（実際、gallery.json を変更した
 * 128コミットのうち123件がトークンだけの差分だった）。
 *
 * トークンには有効期限が無く、22日前に発行したものでも画像を取得できることを
 * 確認済みなので、すでに保存してある URL はそのまま使い続ける。
 */

/** accessToken を除いた、ファイルを指す部分だけを取り出す */
export function stableImageUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("accessToken");
    parsed.searchParams.delete("signature");
    return `${parsed.origin}${parsed.pathname}?${parsed.searchParams.toString()}`;
  } catch {
    return url;
  }
}

/**
 * 同じ画像を指しているなら、保存済みの URL（＝古いトークン）を使い続ける。
 * 差し替えなどでファイル自体が変わっていれば新しい URL を採用する。
 */
export function preserveImageUrls(images, existingImages = []) {
  const existingById = new Map(existingImages.map((image) => [image.id, image]));

  return images.map((image) => {
    const existing = existingById.get(image.id);
    if (!existing?.imageUrl) return image;
    if (stableImageUrl(existing.imageUrl) !== stableImageUrl(image.imageUrl)) return image;
    return { ...image, imageUrl: existing.imageUrl };
  });
}

/** lastUpdated 以外に差分があるか */
export function hasChanges(next, existing) {
  if (!existing) return true;
  const strip = ({ lastUpdated, ...rest }) => JSON.stringify(rest);
  return strip(next) !== strip(existing);
}
