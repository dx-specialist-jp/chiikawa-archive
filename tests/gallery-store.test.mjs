/**
 * gallery.json の書き込み内容を落ち着かせるヘルパーのテスト
 *
 * Tally は取得のたびに新しい accessToken 付き URL を返すため、素直に保存すると
 * 投稿が増えていなくても毎回コミットとデプロイが走る（実際に123回起きていた）。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { stableImageUrl, preserveImageUrls, hasChanges } from "../scripts/lib/gallery-store.mjs";

const url = (token) =>
  `https://storage.tally.so/private/IMG_1.jpeg?id=WX6v9v&accessToken=${token}&signature=abc`;

test("同じ画像なら保存済みのURL（古いトークン）を使い続ける", () => {
  const merged = preserveImageUrls(
    [{ id: "gallery-1", imageUrl: url("new") }],
    [{ id: "gallery-1", imageUrl: url("old") }]
  );
  assert.equal(merged[0].imageUrl, url("old"));
});

test("ファイル自体が変わっていれば新しいURLを採用する", () => {
  const replaced = "https://storage.tally.so/private/IMG_2.jpeg?id=OTHER&accessToken=new";
  const merged = preserveImageUrls(
    [{ id: "gallery-1", imageUrl: replaced }],
    [{ id: "gallery-1", imageUrl: url("old") }]
  );
  assert.equal(merged[0].imageUrl, replaced);
});

test("新しい画像はそのまま通す", () => {
  const merged = preserveImageUrls([{ id: "gallery-2", imageUrl: url("new") }], [
    { id: "gallery-1", imageUrl: url("old") },
  ]);
  assert.equal(merged[0].imageUrl, url("new"));
});

test("トークンを除いた部分が同じかどうかで比べる", () => {
  assert.equal(stableImageUrl(url("a")), stableImageUrl(url("b")));
});

test("lastUpdated しか違わないなら変更なしとみなす", () => {
  const images = [{ id: "gallery-1", imageUrl: url("old") }];
  assert.equal(
    hasChanges({ lastUpdated: "2026-09-06T00:00:00Z", totalImages: 1, images },
               { lastUpdated: "2026-09-05T00:00:00Z", totalImages: 1, images }),
    false
  );
  assert.equal(
    hasChanges({ lastUpdated: "2026-09-06T00:00:00Z", totalImages: 2, images },
               { lastUpdated: "2026-09-05T00:00:00Z", totalImages: 1, images }),
    true
  );
  assert.equal(hasChanges({ lastUpdated: "x", totalImages: 0, images: [] }, null), true);
});
