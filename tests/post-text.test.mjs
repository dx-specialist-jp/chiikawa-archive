/**
 * 投稿本文の整形とカテゴリ判定のテスト
 *
 * 公式アカウントの投稿は「漫画1コマ＋絵文字」が4割ほどある。それを本文として
 * 保存するとカードに絵文字が1つ浮くだけになるので、保存しないと決めている。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { toSummary } from "../scripts/lib/post-text.mjs";
import { detectCategory } from "../scripts/lib/tagging.mjs";

test("画像の t.co リンクを落として本文だけを残す", () => {
  assert.equal(
    toSummary("映画ちいかわ🏝️メインビジュアル解禁！\n7月24日(金)公開です🎬 https://t.co/abcd1234"),
    "映画ちいかわ🏝️メインビジュアル解禁！ 7月24日(金)公開です🎬"
  );
});

test("絵文字と画像リンクだけの投稿は本文として保存しない", () => {
  assert.equal(toSummary("🎥 https://t.co/uIGdaGMnze"), "");
  assert.equal(toSummary("https://t.co/PodR4Twsj0"), "");
  assert.equal(toSummary(""), "");
  assert.equal(toSummary(undefined), "");
});

test("長い本文は打ち切る", () => {
  assert.equal(toSummary("あ".repeat(400)).length, 300);
});

test("単行本・掲載誌の告知はグッズではなく漫画に分類される", () => {
  // 「発売」を含むため、goods を先に評価するとすべてグッズに倒れていた
  assert.equal(detectCategory("『#ちいかわ 』9巻、11月20日(金)発売決定です"), "manga");
  assert.equal(detectCategory("コミックス⑧巻発売前日の #モーニング 51号"), "manga");
  assert.equal(detectCategory("単行本の発売が決定しました"), "manga");
});

test("「描き下ろしデザイン」のグッズは漫画に倒さない", () => {
  assert.equal(detectCategory("特別描き下ろしデザイン「ちいかわ飲茶コレクション」の発売が決定"), "goods");
});

test("本文が絵文字だけで画像がある投稿は漫画とみなす", () => {
  assert.equal(detectCategory("🎥", { mediaCount: 1 }), "manga");
  assert.equal(detectCategory("🎥", { mediaCount: 0 }), "other");
});
