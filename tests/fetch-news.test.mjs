/**
 * fetch-news.mjs をそのまま動かすテスト
 *
 * 取得〜判定〜保持上限〜書き込みまでを実際に通す。ここを通していなかったために、
 * 「構文チェックは通るが実行すると未定義参照で落ちる」「新規記事が無いのに
 * news.json が毎回書き換わる」といった不具合を取りこぼしていた。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "child_process";
import { promisify } from "util";
import http from "http";
import { mkdtemp, readFile } from "fs/promises";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const run = promisify(execFile);
const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "..", "scripts", "fetch-news.mjs");

function entry(title, url, updated) {
  return `<entry>
    <title type="html">${title}</title>
    <link href="https://www.google.com/url?url=${encodeURIComponent(url)}" rel="alternate"/>
    <updated>${updated}</updated>
    <content type="html">&lt;b&gt;${title}&lt;/b&gt; · 関連記事 · イベント · 募集</content>
    <source><title>テストメディア</title></source>
  </entry>`;
}

const FEED = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom">
${entry("ちいかわ ×東京ばな奈 コラボ バッグが全国通販決定", "https://example.com/new", "2026-09-06T12:00:00Z")}
${entry("漫画『 ちいかわ 』最新9巻が発売", "https://example.com/manga", "2026-09-05T12:00:00Z")}
${entry("ちいかわ 旧記事", "https://example.com/old", "2026-06-01T12:00:00Z")}
${entry("無関係なニュース HUNTER×HUNTER 最新話", "https://example.com/other", "2026-09-06T11:00:00Z")}
</feed>`;

async function withFeed(fn) {
  const server = http.createServer((_, res) => {
    res.writeHead(200, { "content-type": "application/atom+xml" });
    res.end(FEED);
  });
  await new Promise((resolve) => server.listen(0, resolve));
  try {
    return await fn(`http://localhost:${server.address().port}/`);
  } finally {
    server.close();
  }
}

async function fetchNews(url, dataDir, max) {
  const { stdout } = await run(process.execPath, [SCRIPT], {
    env: { ...process.env, GOOGLE_ALERTS_RSS_URL: url, NEWS_DATA_DIR: dataDir, NEWS_MAX_ARTICLES: String(max) },
  });
  return stdout;
}

test("フィードを取り込み、ちいかわ以外を除外して判定・整形する", async () => {
  await withFeed(async (url) => {
    const dir = await mkdtemp(join(tmpdir(), "fetch-news-"));
    await fetchNews(url, dir, 10);

    const data = JSON.parse(await readFile(join(dir, "news.json"), "utf-8"));
    assert.equal(data.totalArticles, 3, "タイトルに「ちいかわ」を含む3件だけが残る");
    assert.ok(!data.articles.some((a) => a.url === "https://example.com/other"));

    const [newest] = data.articles;
    assert.equal(newest.url, "https://example.com/new", "新しい順に並ぶ");
    assert.equal(newest.category, "collab");
    assert.equal(data.articles.find((a) => a.url === "https://example.com/manga").category, "manga");
    assert.ok(!newest.summary.includes("募集"), "本文からナビの断片が落ちている");
  });
});

test("保持上限を超えたぶんは年別アーカイブへ退避する", async () => {
  await withFeed(async (url) => {
    const dir = await mkdtemp(join(tmpdir(), "fetch-news-"));
    await fetchNews(url, dir, 2);

    const data = JSON.parse(await readFile(join(dir, "news.json"), "utf-8"));
    assert.equal(data.totalArticles, 2);
    assert.ok(!data.articles.some((a) => a.url === "https://example.com/old"));

    const archive = JSON.parse(await readFile(join(dir, "news-archive", "2026.json"), "utf-8"));
    assert.deepEqual(archive.articles.map((a) => a.url), ["https://example.com/old"]);
  });
});

test("同じフィードを取り込み直しても news.json は1バイトも変わらない", async () => {
  await withFeed(async (url) => {
    // 退避済みの記事は掲載中のURL一覧に無いため、素直に書くと毎回「新規」として
    // 拾われて lastUpdated だけが動き、無意味なコミットとデプロイが走る
    const dir = await mkdtemp(join(tmpdir(), "fetch-news-"));
    await fetchNews(url, dir, 2);
    const first = await readFile(join(dir, "news.json"), "utf-8");

    const stdout = await fetchNews(url, dir, 2);
    const second = await readFile(join(dir, "news.json"), "utf-8");

    assert.equal(second, first);
    assert.match(stdout, /変更なし/);
  });
});

test("フィードURLが未設定なら何も書かずに終了する", async () => {
  const dir = await mkdtemp(join(tmpdir(), "fetch-news-"));
  const { stdout } = await run(process.execPath, [SCRIPT], {
    env: { ...process.env, GOOGLE_ALERTS_RSS_URL: "", NEWS_DATA_DIR: dir },
  });
  assert.match(stdout, /スキップ/);
  await assert.rejects(readFile(join(dir, "news.json"), "utf-8"));
});
