/**
 * ニュース処理の共通ライブラリのテスト
 *
 * ここで守りたいのは「どういう入力をどう扱うと決めたか」であって、
 * キーワードの網羅ではない。ルールを増やしただけで落ちるテストは書かない。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { detectCategory, extractTags } from "../scripts/lib/news-tagging.mjs";
import { stripTags, decodeHtmlEntities, cleanSummary } from "../scripts/lib/news-text.mjs";
import { applyRetention, archiveArticles } from "../scripts/lib/news-archive.mjs";

test("カテゴリ判定: × は「ちいかわ×○○」の形だけをコラボとみなす", () => {
  assert.equal(detectCategory("ちいかわ ×東京ばな奈 コラボ バッグ"), "collab");
  // 無関係な作品名の × でコラボにしない（以前は本文の HUNTER×HUNTER を拾っていた）
  assert.notEqual(detectCategory("『HUNTER×HUNTER』一番くじが登場"), "collab");
});

test("カテゴリ判定: 「映画」は作品名としても使われるので弱い手がかりに留める", () => {
  // 映画そのものの話題
  assert.equal(detectCategory("『映画 ちいかわ 』興収200億円突破"), "anime");
  // 作品名が枕詞になっているグッズ告知は goods
  assert.equal(detectCategory("「映画 ちいかわ 」のカプセルトイが発売"), "goods");
  // 他に手がかりが無ければアニメへ倒す
  assert.equal(detectCategory("映画 ちいかわ 人魚の島のひみつ レビュー"), "anime");
});

test("カテゴリ判定: 具体的な語が一般的な語より優先される", () => {
  assert.equal(detectCategory("漫画『 ちいかわ 』最新9巻は11月20日 発売"), "manga");
  assert.equal(detectCategory("ちいかわ ポップアップストアが開催"), "event");
  assert.equal(detectCategory("ちいかわ の新作ぬいぐるみが発売"), "goods");
});

test("カテゴリ判定: 手がかりが無ければ other", () => {
  assert.equal(detectCategory("平原綾香、 ちいかわ にドハマり"), "other");
});

test("タグ抽出: 全記事に付く「ちいかわ」はタグにしない", () => {
  const tags = extractTags("ちいかわ ×ユニクロの限定Tシャツが発売");
  assert.ok(!tags.includes("ちいかわ"));
  assert.deepEqual(new Set(tags), new Set(["ユニクロ", "Tシャツ", "限定"]));
});

test("テキスト整形: 実体参照はタグ除去の前後どちらでもデコードされる", () => {
  assert.equal(decodeHtmlEntities("a&amp;b"), "a&b");
  assert.equal(stripTags("<b>ちいかわ</b> &amp;amp; ハチワレ"), "ちいかわ & ハチワレ");
});

test("本文整形: ナビの断片を落とし、記事本文らしい部分を残す", () => {
  const cleaned = cleanSummary(
    "新商品 · クルマ · 写真ニュース ... の ちいかわコラボ 景品がフリマサイトに大量出品されていることを ..."
  );
  assert.ok(!cleaned.includes("クルマ"));
  assert.ok(cleaned.includes("ちいかわコラボ"));
});

test("本文整形: 著作権表記以降を落とす", () => {
  assert.equal(
    cleanSummary("ちいかわコラボ キャンペーン（出典：くら寿司）. Copyright © ITmedia, Inc."),
    "ちいかわコラボ キャンペーン（出典：くら寿司）."
  );
});

test("本文整形: 全部が短い断片でも空にはしない", () => {
  assert.notEqual(cleanSummary("イベント · 募集 · 検索"), "");
});

const article = (id, publishedAt) => ({ id, publishedAt, title: `記事${id}`, summary: "", tags: [] });

test("保持件数: 新しい順に上限まで残し、あふれたぶんを返す", () => {
  const articles = [
    article("a", "2026-09-03T00:00:00.000Z"),
    article("b", "2026-09-02T00:00:00.000Z"),
    article("c", "2026-09-01T00:00:00.000Z"),
  ];
  const { kept, dropped } = applyRetention(articles, 2);
  assert.deepEqual(kept.map((a) => a.id), ["a", "b"]);
  assert.deepEqual(dropped.map((a) => a.id), ["c"]);
});

test("保持件数: 上限が不正なら退避しない（設定ミスでデータを削らない）", () => {
  const articles = [article("a", "2026-09-03T00:00:00.000Z")];
  assert.equal(applyRetention(articles, 0).dropped.length, 0);
  assert.equal(applyRetention(articles, NaN).dropped.length, 0);
});

test("アーカイブ: 年別に分かれ、同じ記事を二度退避しても増えない", async () => {
  const dir = await mkdtemp(join(tmpdir(), "news-archive-"));
  const dropped = [
    article("x", "2026-01-05T00:00:00.000Z"),
    article("y", "2025-12-30T00:00:00.000Z"),
  ];

  const first = await archiveArticles(dir, dropped);
  assert.deepEqual(first.map((r) => [r.year, r.total]).sort(), [["2025", 1], ["2026", 1]]);

  await archiveArticles(dir, dropped);
  const saved = JSON.parse(await readFile(join(dir, "news-archive", "2026.json"), "utf-8"));
  assert.equal(saved.totalArticles, 1);
});
