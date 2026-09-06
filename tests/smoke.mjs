/**
 * ビルド成果物（out/）に対するスモークテスト
 *
 * GitHub Pages と同じように out/ を静的配信し、実際のブラウザで全ページを開いて
 * 見出しが出ているか・JSエラーが無いかを確認する。存在しないURLも1つ踏んで、
 * 404 が日本語ページになっていることまで見る（以前ここを踏んでおらず、
 * Next.js 標準の英語ページが本番に出ていた）。
 *
 * 本番ビルドは basePath 付きで出力されるため、NEXT_PUBLIC_BASE_PATH が
 * 設定されていればその配下で配信・巡回する。
 *
 * 使い方: npm run build && npm run test:smoke
 */

import { chromium } from "playwright";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

if (!fs.existsSync(path.join(ROOT, "index.html"))) {
  console.error("out/ が見当たりません。先に npm run build を実行してください。");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (BASE_PATH && urlPath.startsWith(BASE_PATH)) urlPath = urlPath.slice(BASE_PATH.length) || "/";
  let file = path.join(ROOT, urlPath);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file)) {
    // GitHub Pages と同じく未検出パスには 404.html を返す
    const notFound = path.join(ROOT, "404.html");
    res.writeHead(404, { "content-type": "text/html" });
    return res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : "404.html がありません");
  }
  res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

await new Promise((resolve) => server.listen(0, resolve));
const origin = `http://localhost:${server.address().port}${BASE_PATH}`;
const browser = await chromium.launch();

const failures = [];
function check(label, ok, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
}

/** 例外で途中終了せず、失敗として記録して次の項目へ進む */
async function step(label, fn) {
  try {
    await fn();
  } catch (err) {
    check(label, false, err.message.split("\n")[0]);
  }
}

/** X（Twitter）ウィジェット由来のノイズは自サイトの問題ではないので除外する */
const isOurError = (message) => !/twitter|x\.com|platform\.twitter|ERR_|net::/i.test(message);

async function openPage() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));
  return { context, page, errors };
}

const PAGES = [
  ["/", "ちいかわの今を、ここで。"],
  ["/news/", "Latest News"],
  ["/archive/", "Post Archive"],
  ["/search/", "Search"],
  ["/stats/", "Stats"],
  ["/gallery/", "Gallery"],
  ["/rights/", "Rights"],
  ["/contact/", "Contact"],
];

for (const [route, expectedHeading] of PAGES) {
  await step(`${route.padEnd(11)} 見出し・JSエラー`, async () => {
  const { context, page, errors } = await openPage();
  const response = await page.goto(origin + route, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);

  const heading = await page.locator("h1").first().textContent().catch(() => null);
  const ours = errors.filter(isOurError);
  check(
    `${route.padEnd(11)} 見出し・JSエラー`,
    response?.status() === 200 && heading?.includes(expectedHeading) && ours.length === 0,
    ours.length ? ours.join(" / ") : `h1=${JSON.stringify(heading)}`
  );
  await context.close();
  });
}

// 未検出パスは日本語の404ページを返す
await step("404 が日本語ページで導線を持つ", async () => {
  const { context, page } = await openPage();
  const response = await page.goto(`${origin}/no-such-page/`, { waitUntil: "domcontentloaded" });
  const heading = await page.locator("h1").first().textContent().catch(() => null);
  const links = await page.locator("nav[aria-label='主なページ'] a").count();
  check("404 が日本語ページで導線を持つ", response?.status() === 404 && links > 0, `h1=${JSON.stringify(heading)}`);
  await context.close();
});

// /news は初期表示で JSON を取りに行かず、絞り込みで初めて取得する
await step("ニュースの操作", async () => {
  const { context, page, errors } = await openPage();
  const requested = [];
  page.on("request", (r) => r.url().includes("/data/") && requested.push(r.url()));

  await page.goto(`${origin}/news/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  const initialCards = await page.locator("main a.card-hover").count();
  check("ニュース: 初期表示は埋め込みぶんだけで完結する", initialCards > 0 && requested.length === 0,
    `カード${initialCards}件 / 取得${requested.length}件`);

  await page.getByRole("button", { name: /コラボ/ }).click();
  await page.waitForTimeout(1500);
  const filtered = await page.locator("main a.card-hover").count();
  check("ニュース: 絞り込みで news.json を取得して再描画する",
    requested.some((u) => u.endsWith("news.json")) && filtered > 0, `カード${filtered}件`);

  // 読み込みに失敗していると埋め込みぶんだけで絞り込まれ、件数が伸びない
  const failedToLoad = await page.getByText("記事の読み込みに失敗しました").count();
  check("ニュース: news.json の読み込みに失敗していない", failedToLoad === 0);

  await page.getByRole("button", { name: "もっと見る" }).click({ timeout: 5000 });
  await page.waitForTimeout(400);
  const more = await page.locator("main a.card-hover").count();
  check("ニュース: 「もっと見る」で埋め込みぶんを超えて表示できる",
    more > filtered && more > initialCards, `${filtered} → ${more}`);
  check("ニュース: JSエラーなし", errors.filter(isOurError).length === 0);
  await context.close();
});

// 掲載ぶんを見終えたあと、年別アーカイブの過去記事を読み込めるか
await step("ニュース: 過去記事の読み込み", async () => {
  const { context, page, errors } = await openPage();
  await page.goto(`${origin}/news/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);

  // 件数の少ないカテゴリで絞り込むと、掲載ぶんを見終えた状態にすぐ辿り着ける
  await page.getByRole("button", { name: /漫画/ }).click();
  await page.waitForTimeout(1500);
  const before = await page.locator("main a.card-hover").count();

  const olderButton = page.getByRole("button", { name: /年の記事を読み込む/ });
  if ((await olderButton.count()) === 0) {
    // 退避がまだ発生していないビルドでは出ないボタンなので、失敗にはしない
    console.log("- ニュース: 過去記事の読み込み — アーカイブがないため省略");
    await context.close();
    return;
  }

  await olderButton.first().click();
  await page.waitForTimeout(2000);
  const after = await page.locator("main a.card-hover").count();
  check("ニュース: 過去記事を読み込むと件数が増える", after > before, `${before} → ${after}`);
  check("ニュース: 過去記事の読み込みでJSエラーなし", errors.filter(isOurError).length === 0);
  await context.close();
});

// 本文キーワードでの検索（タグ・キャラクター名では当たらない語で確かめる）
await step("検索: 本文のキーワードで投稿が見つかる", async () => {
  const { context, page, errors } = await openPage();
  await page.goto(`${origin}/search/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);

  await page.locator("main input").first().fill("上映");
  await page.waitForTimeout(1200);
  const hits = await page.locator("main article.card").count();
  check("検索: 本文のキーワードで投稿が見つかる", hits > 0, `「上映」で${hits}件`);
  check("検索: JSエラーなし", errors.filter(isOurError).length === 0);
  await context.close();
});

// ギャラリーのライトボックス（開く・閉じる・背面スクロール固定）
await step("ギャラリー: ライトボックスの開閉", async () => {
  const { context, page, errors } = await openPage();
  await page.goto(`${origin}/gallery/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  const tiles = page.locator("main .grid button");
  if ((await tiles.count()) === 0) {
    // 投稿がまだ無いビルドでは開くものが無いので失敗にはしない
    console.log("- ギャラリー: ライトボックスの開閉 — 投稿がないため省略");
    await context.close();
    return;
  }

  await tiles.first().click();
  await page.waitForTimeout(600);
  const dialog = page.locator("[role='dialog']");
  check("ギャラリー: タイルを押すとダイアログが開く", (await dialog.count()) === 1);

  // 一覧は space-y-6 の中にあり、その中に置くと fixed のオーバーレイにも
  // margin-top が効いて画面上端を覆えなくなる（ヘッダーがクリックを吸う）
  const covers = await page.evaluate(() => {
    const overlay = document.querySelector("[role='dialog']")?.parentElement;
    if (!overlay) return false;
    const rect = overlay.getBoundingClientRect();
    return rect.top === 0 && rect.left === 0 && rect.height === window.innerHeight;
  });
  check("ギャラリー: 暗幕が画面全体を覆う", covers);
  check(
    "ギャラリー: 開いている間は背面がスクロールしない",
    (await page.evaluate(() => document.body.style.overflow)) === "hidden"
  );
  check(
    "ギャラリー: 閉じるボタンにフォーカスが移る",
    (await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))) === "閉じる"
  );

  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  check("ギャラリー: Esc で閉じる", (await dialog.count()) === 0);
  check(
    "ギャラリー: 閉じたら背面のスクロールが戻る",
    (await page.evaluate(() => document.body.style.overflow)) !== "hidden"
  );

  // 背景クリックでも閉じる
  await tiles.first().click();
  await page.waitForTimeout(600);
  await page.mouse.click(8, 8);
  await page.waitForTimeout(600);
  check("ギャラリー: 背景クリックで閉じる", (await dialog.count()) === 0);
  check("ギャラリー: JSエラーなし", errors.filter(isOurError).length === 0);
  await context.close();
});

await browser.close();
server.close();

console.log(failures.length ? `\n✗ ${failures.length} 件失敗` : "\n✓ すべて成功");
process.exit(failures.length ? 1 : 0);
