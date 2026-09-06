/**
 * fetch-gallery.mjs をそのまま動かすテスト
 *
 * Tally API をローカルのスタブに差し替えて、取得〜整形〜書き込みまでを通す。
 * このスクリプトはワークフローで continue-on-error のまま走り、失敗しても
 * 他のステップは進むため、壊れていても気づきにくい。
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
const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "..", "scripts", "fetch-gallery.mjs");

const IMAGE_FORM = "imgform";
const COMMENT_FORM = "cmtform";

const imageUrl = (token) =>
  `https://storage.tally.so/private/IMG_1.jpeg?id=FILE1&accessToken=${token}&signature=sig`;

/** token を変えるたびに新しい URL を返す Tally の挙動を再現する */
function tallyStub(token) {
  return http.createServer((req, res) => {
    const body = req.url.includes(IMAGE_FORM)
      ? {
          questions: [
            { id: "q1", title: "写真" },
            { id: "q2", title: "カテゴリ" },
            { id: "q3", title: "コメント（任意・140字まで）" },
          ],
          submissions: [
            {
              id: "SUB1",
              isCompleted: true,
              submittedAt: "2026-09-05T08:33:56.000Z",
              responses: [
                { questionId: "q1", answer: [{ url: imageUrl(token), mimeType: "image/jpeg" }] },
                { questionId: "q2", answer: ["グッズ"] },
                { questionId: "q3", answer: "映画の入場者特典です" },
              ],
            },
            {
              // 画像以外のファイルは公開しない
              id: "SUB2",
              isCompleted: true,
              submittedAt: "2026-09-04T00:00:00.000Z",
              responses: [
                { questionId: "q1", answer: [{ url: "https://x/a.pdf", mimeType: "application/pdf" }] },
                { questionId: "q2", answer: ["その他"] },
              ],
            },
          ],
          hasMore: false,
        }
      : {
          questions: [{ id: "c1", title: "image_id", fields: [{ title: "image_id" }] }, { id: "c2", title: "コメント" }],
          submissions: [
            {
              id: "CMT1",
              isCompleted: true,
              submittedAt: "2026-09-05T09:00:00.000Z",
              responses: [
                { questionId: "c1", answer: { image_id: "gallery-SUB1" } },
                { questionId: "c2", answer: "かわいい！" },
              ],
            },
          ],
          hasMore: false,
        };
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  });
}

async function withStub(token, fn) {
  const server = tallyStub(token);
  await new Promise((resolve) => server.listen(0, resolve));
  try {
    return await fn(`http://localhost:${server.address().port}`);
  } finally {
    server.close();
  }
}

function fetchGallery(base, dataDir) {
  return run(process.execPath, [SCRIPT], {
    env: {
      ...process.env,
      TALLY_API_BASE: base,
      GALLERY_DATA_DIR: dataDir,
      TALLY_API_KEY: "test",
      TALLY_IMAGE_FORM_ID: IMAGE_FORM,
      TALLY_COMMENT_FORM_ID: COMMENT_FORM,
    },
  });
}

test("投稿を取り込み、画像以外を除外してコメントを紐づける", async () => {
  const dir = await mkdtemp(join(tmpdir(), "gallery-"));
  await withStub("token1", (base) => fetchGallery(base, dir));

  const data = JSON.parse(await readFile(join(dir, "gallery.json"), "utf-8"));
  assert.equal(data.totalImages, 1, "PDFの投稿は公開しない");

  const [image] = data.images;
  assert.equal(image.id, "gallery-SUB1");
  assert.equal(image.category, "goods");
  assert.equal(image.caption, "映画の入場者特典です");
  assert.deepEqual(image.comments.map((c) => c.body), ["かわいい！"]);
  assert.match(image.commentFormUrl, /image_id=gallery-SUB1/);
});

test("画像URLのトークンだけが変わったときは書き込まない", async () => {
  // Tally は取得のたびに新しいトークンを返す。素直に保存すると投稿が増えて
  // いなくても差分になり、4時間ごとにコミットとデプロイが走ってしまう
  const dir = await mkdtemp(join(tmpdir(), "gallery-"));
  await withStub("token1", (base) => fetchGallery(base, dir));
  const first = await readFile(join(dir, "gallery.json"), "utf-8");

  const { stdout } = await withStub("token2", (base) => fetchGallery(base, dir));
  const second = await readFile(join(dir, "gallery.json"), "utf-8");

  assert.equal(second, first);
  assert.match(stdout, /変更なし/);
});

test("設定が足りなければ何も書かずに終了する", async () => {
  const dir = await mkdtemp(join(tmpdir(), "gallery-"));
  await assert.rejects(
    run(process.execPath, [SCRIPT], { env: { ...process.env, GALLERY_DATA_DIR: dir, TALLY_API_KEY: "" } })
  );
  await assert.rejects(readFile(join(dir, "gallery.json"), "utf-8"));
});
