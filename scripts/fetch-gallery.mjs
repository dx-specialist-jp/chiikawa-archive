/**
 * Tally（写真投稿フォーム・コメント投稿フォーム）から投稿を取得し gallery.json を更新する
 *
 * 環境変数:
 *   TALLY_API_KEY         - Tally Personal Access Token（必須）
 *   TALLY_IMAGE_FORM_ID   - 写真投稿フォームのID（必須）
 *   TALLY_COMMENT_FORM_ID - コメント投稿フォームのID（必須）
 *
 * 投稿は事前承認なしで自動的に公開される。不適切な投稿を見つけた場合はTally側で
 * 該当の回答を削除すれば、次回同期時にギャラリーからも自動的に消える。
 */

import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { fetchAllSubmissions, findAnswer } from "./lib/tally.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");
const GALLERY_JSON_PATH = join(DATA_DIR, "gallery.json");

const TALLY_API_KEY = process.env.TALLY_API_KEY ?? "";
const TALLY_IMAGE_FORM_ID = process.env.TALLY_IMAGE_FORM_ID ?? "";
const TALLY_COMMENT_FORM_ID = process.env.TALLY_COMMENT_FORM_ID ?? "";

const CATEGORY_LABELS_JA_TO_EN = {
  グッズ: "goods",
  イベント: "event",
  その他: "other",
};

/**
 * File Uploadフィールドの回答からファイル情報を取り出す。
 * 実データ確認済みの形式: [{ id, name, url, mimeType, size }]
 */
function extractFile(answer) {
  if (!answer) return null;
  if (Array.isArray(answer)) {
    const first = answer[0];
    if (first && typeof first === "object" && typeof first.url === "string") return first;
  }
  console.warn("⚠️ 写真の回答形式を認識できませんでした:", JSON.stringify(answer));
  return null;
}

/**
 * Dropdownフィールドの回答からカテゴリラベルを取り出す。
 * 実データ確認済みの形式: ["グッズ"]（ラベル文字列を含む配列）
 */
function extractCategoryLabel(answer) {
  if (!answer) return null;
  if (Array.isArray(answer)) {
    const first = answer[0];
    if (typeof first === "string") return first;
  }
  return null;
}

function toCategory(label) {
  return CATEGORY_LABELS_JA_TO_EN[label] ?? "other";
}

/**
 * Hidden Fieldの回答は `{ <フィールドキー>: <値> }` というオブジェクト形式で返る
 * （他の質問タイプの文字列/配列とは異なる）。
 */
function extractHiddenFieldValue(answer, key) {
  if (!answer) return null;
  if (typeof answer === "string") return answer;
  if (typeof answer === "object" && !Array.isArray(answer)) {
    return answer[key] ?? Object.values(answer)[0] ?? null;
  }
  return null;
}

async function main() {
  if (!TALLY_API_KEY || !TALLY_IMAGE_FORM_ID || !TALLY_COMMENT_FORM_ID) {
    console.error("❌ TALLY_API_KEY / TALLY_IMAGE_FORM_ID / TALLY_COMMENT_FORM_ID が未設定です");
    process.exit(1);
  }

  console.log("📡 写真投稿フォームの回答を取得中");
  const { questions: imageQuestions, submissions: imageSubmissions } = await fetchAllSubmissions(
    TALLY_API_KEY,
    TALLY_IMAGE_FORM_ID
  );
  console.log(`📋 ${imageSubmissions.length} 件の回答を検出`);

  const images = imageSubmissions
    .filter((s) => s.isCompleted)
    .map((s) => {
      const file = extractFile(findAnswer(s, imageQuestions, "写真"));
      const categoryLabel = extractCategoryLabel(findAnswer(s, imageQuestions, "カテゴリ"));
      const caption = findAnswer(s, imageQuestions, "コメント（任意・140字まで）");
      const id = `gallery-${s.id}`;

      return {
        id,
        submissionId: s.id,
        file,
        caption: caption || null,
        category: toCategory(categoryLabel),
        createdAt: s.submittedAt,
        commentFormUrl: `https://tally.so/r/${TALLY_COMMENT_FORM_ID}?image_id=${encodeURIComponent(id)}`,
        comments: [],
      };
    })
    .filter((img) => {
      if (!img.file) {
        console.warn(`⚠️ 画像URLを取得できなかったためスキップ: ${img.id}`);
        return false;
      }
      if (!img.file.mimeType?.startsWith("image/")) {
        console.warn(`⚠️ 画像以外のファイル形式(${img.file.mimeType})のためスキップ: ${img.id}`);
        return false;
      }
      return true;
    })
    .map(({ file, submissionId, ...img }) => ({ ...img, imageUrl: file.url }));

  console.log(`✨ 公開画像 ${images.length} 件`);

  console.log("📡 コメント投稿フォームの回答を取得中");
  const { questions: commentQuestions, submissions: commentSubmissions } = await fetchAllSubmissions(
    TALLY_API_KEY,
    TALLY_COMMENT_FORM_ID
  );
  console.log(`📋 ${commentSubmissions.length} 件の回答を検出`);

  const imagesById = new Map(images.map((img) => [img.id, img]));

  for (const s of commentSubmissions) {
    if (!s.isCompleted) continue;

    const imageId = extractHiddenFieldValue(findAnswer(s, commentQuestions, "image_id"), "image_id");
    const body = findAnswer(s, commentQuestions, "コメント");
    const image = imageId ? imagesById.get(imageId) : undefined;

    if (!image) {
      console.warn(`⚠️ コメント ${s.id} の対象画像(${imageId})が見つからないためスキップ`);
      continue;
    }
    if (!body) {
      console.warn(`⚠️ コメント ${s.id} の本文が空のためスキップ`);
      continue;
    }

    image.comments.push({ id: `comment-${s.id}`, body, createdAt: s.submittedAt });
  }

  for (const img of images) {
    img.comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const updated = {
    lastUpdated: new Date().toISOString(),
    totalImages: images.length,
    images,
  };

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(GALLERY_JSON_PATH, JSON.stringify(updated, null, 2), "utf-8");

  console.log(`✅ 更新完了（${images.length} 件を公開）`);
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
