/**
 * fetch-posts.mjs の RSSHub 取得まわりをそのまま動かすテスト
 *
 * RSSHub は Render 無料プランで動いており、スリープ復帰やクラッシュで
 * 応答しない時間帯がある。1回の失敗で諦めると次の実行（4時間後）まで
 * 投稿が更新されないため、再試行して拾えることをここで担保する。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "child_process";
import { promisify } from "util";
import http from "http";
import { mkdtemp, readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const run = promisify(execFile);
const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "..", "scripts", "fetch-posts.mjs");

const KNOWN_TWEET_ID = "1111111111111111111";

// 既知のツイートだけを返すフィード。新規0件で終わるため、
// syndication API（外部ネットワーク）を叩かずに取得経路だけを検証できる
const FEED = `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel>
<item>
  <title><![CDATA[テスト投稿]]></title>
  <link>https://x.com/ngnchiikawa/status/${KNOWN_TWEET_ID}</link>
  <pubDate>Sat, 17 Oct 2026 12:00:00 GMT</pubDate>
</item>
</channel></rss>`;

/** responses で指定したステータスを順に返し、尽きたら最後の挙動を繰り返すサーバ */
async function withServer(responses, fn) {
  let calls = 0;
  const server = http.createServer((_, res) => {
    const status = responses[Math.min(calls, responses.length - 1)];
    calls++;
    if (status === 200) {
      res.writeHead(200, { "content-type": "application/rss+xml" });
      res.end(FEED);
    } else {
      res.writeHead(status).end("error");
    }
  });
  await new Promise((resolve) => server.listen(0, resolve));
  try {
    return await fn(`http://localhost:${server.address().port}/`, () => calls);
  } finally {
    server.close();
  }
}

async function withDataDir() {
  const dir = await mkdtemp(join(tmpdir(), "fetch-posts-"));
  await writeFile(
    join(dir, "posts.json"),
    JSON.stringify({
      lastUpdated: "2026-10-17T00:00:00.000Z",
      totalPosts: 1,
      posts: [{ id: `post-${KNOWN_TWEET_ID}`, tweetId: KNOWN_TWEET_ID, url: "https://x.com/ngnchiikawa/status/" + KNOWN_TWEET_ID, publishedAt: "2026-10-17T12:00:00.000Z", category: "other", tags: [], characters: [], photoUrl: null }],
      calendarData: [],
    }),
    "utf-8"
  );
  return dir;
}

function fetchPosts(url, dataDir) {
  return run(process.execPath, [SCRIPT], {
    env: { ...process.env, RSSHUB_URL: url, RSSHUB_ACCESS_KEY: "", POSTS_DATA_DIR: dataDir, RSSHUB_RETRY_BASE_MS: "10" },
  });
}

test("一時的に 5xx を返しても再試行して取得できる", async () => {
  await withServer([503, 503, 200], async (url, calls) => {
    const dir = await withDataDir();
    const { stdout } = await fetchPosts(url, dir);

    assert.equal(calls(), 3, "3回目で成功するまで再試行する");
    assert.match(stdout, /再試行します/);
    assert.match(stdout, /新規投稿なし/);
  });
});

test("3回とも失敗したら終了コード1で落ち、最後のエラーを出す", async () => {
  await withServer([503], async (url, calls) => {
    const dir = await withDataDir();
    const err = await fetchPosts(url, dir).then(
      () => assert.fail("失敗するはず"),
      (e) => e
    );

    assert.equal(err.code, 1);
    assert.equal(calls(), 3, "既定の再試行回数を超えて叩き続けない");
    assert.match(err.stderr, /3 回失敗しました/);
    assert.match(err.stderr, /503/);
  });
});

test("4xx は設定ミスなので再試行せず即座に失敗する", async () => {
  await withServer([401], async (url, calls) => {
    const dir = await withDataDir();
    const err = await fetchPosts(url, dir).then(
      () => assert.fail("失敗するはず"),
      (e) => e
    );

    assert.equal(err.code, 1);
    assert.equal(calls(), 1, "ACCESS_KEY 誤りなどは再試行しても直らない");
    assert.match(err.stderr, /401/);
    assert.doesNotMatch(err.stdout, /再試行します/);
  });
});

test("失敗しても posts.json は書き換えない", async () => {
  await withServer([503], async (url) => {
    const dir = await withDataDir();
    const before = await readFile(join(dir, "posts.json"), "utf-8");
    await fetchPosts(url, dir).catch(() => {});
    assert.equal(await readFile(join(dir, "posts.json"), "utf-8"), before);
  });
});
