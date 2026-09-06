/**
 * 投稿本文の整形のテスト
 *
 * 公式アカウントの投稿は「漫画1コマ＋絵文字」が4割ほどある。それを本文として
 * 保存するとカードに絵文字が1つ浮くだけになるので、保存しないと決めている。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { toSummary } from "../scripts/lib/post-text.mjs";

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
