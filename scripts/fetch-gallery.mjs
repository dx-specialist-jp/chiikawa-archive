/**
 * Tally（写真投稿フォーム・コメント投稿フォーム）から承認済みの投稿を取得し gallery.json を更新する
 *
 * 環境変数:
 *   TALLY_API_KEY         - Tally Personal Access Token（必須）
 *   TALLY_IMAGE_FORM_ID   - 写真投稿フォームのID（必須）
 *   TALLY_COMMENT_FORM_ID - コメント投稿フォームのID（必須）
 *
 * 承認は public/ 配下ではない moderation/gallery-approved.json （管理者が手動編集）で行う。
 * このファイルに載っていない回答IDはギャラリーに一切反映されない。
 */

import { writeFile, readFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { fetchAllSubmissions, findAnswer } from "./lib/tally.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");
const GALLERY_JSON_PATH = join(DATA_DIR, "gallery.json");
const APPROVED_LIST_PATH = join(__dirname, "..", "moderation", "gallery-approved.json");

const TALLY_API_KEY = process.env.TALLY_API_KEY ?? "";
const TALLY_IMAGE_FORM_ID = process.env.TALLY_IMAGE_FORM_ID ?? "";
const TALLY_COMMENT_FORM_ID = process.env.TALLY_COMMENT_FORM_ID ?? "";

const CATEGORY_LABELS_JA_TO_EN = {
  グッズ: "goods",
  イベント: "event",
  その他: "other",
};

/**
 * File Uploadフィールドの回答からURLを取り出す。
 * Tallyの正確なレスポンス形式が未確認のため、想定しうる複数の形（文字列 / {url} / [{url}] / URL文字列配列）
 * を順に試す。どれにも一致しない場合は ⚠️ を出して null を返す（実データ確認後に確定させる）。
 */
function extractImageUrl(answer) {
  if (!answer) return null;
  if (typeof answer === "string") return answer;
  if (Array.isArray(answer)) {
    const first = answer[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && typeof first.url === "string") return first.url;
  }
  if (typeof answer === "object" && typeof answer.url === "string") return answer.url;

  console.warn("⚠️ 写真の回答形式を認識できませんでした:", JSON.stringify(answer));
  return null;
}

/**
 * Dropdownフィールドの回答からカテゴリラベルを取り出す。
 * ラベル文字列そのまま、または選択肢オブジェクト([{label}] 等)の可能性を考慮する。
 */
function extractCategoryLabel(answer) {
  if (!answer) return null;
  if (typeof answer === "string") return answer;
  if (Array.isArray(answer)) {
    const first = answer[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") return first.label ?? first.text ?? null;
  }
  if (typeof answer === "object") return answer.label ?? answer.text ?? null;
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

async function readApprovedList() {
  try {
    const raw = await readFile(APPROVED_LIST_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      approvedImageResponseIds: parsed.approvedImageResponseIds ?? [],
      approvedCommentResponseIds: parsed.approvedCommentResponseIds ?? [],
    };
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    console.warn("⚠️ moderation/gallery-approved.json が見つからないため、承認済み投稿はありません");
    return { approvedImageResponseIds: [], approvedCommentResponseIds: [] };
  }
}

function warnUnmatchedIds(approvedIds, submissions, label) {
  const submissionIds = new Set(submissions.map((s) => s.id));
  for (const id of approvedIds) {
    if (!submissionIds.has(id)) {
      console.warn(`⚠️ 承認リストのID「${id}」に一致する${label}が見つかりません（誤入力の可能性）`);
    }
  }
}

async function main() {
  if (!TALLY_API_KEY || !TALLY_IMAGE_FORM_ID || !TALLY_COMMENT_FORM_ID) {
    console.error("❌ TALLY_API_KEY / TALLY_IMAGE_FORM_ID / TALLY_COMMENT_FORM_ID が未設定です");
    process.exit(1);
  }

  const approved = await readApprovedList();

  console.log("📡 写真投稿フォームの回答を取得中");
  const { questions: imageQuestions, submissions: imageSubmissions } = await fetchAllSubmissions(
    TALLY_API_KEY,
    TALLY_IMAGE_FORM_ID
  );
  console.log(`📋 ${imageSubmissions.length} 件の回答を検出`);
  warnUnmatchedIds(approved.approvedImageResponseIds, imageSubmissions, "写真投稿");

  const images = imageSubmissions
    .filter((s) => s.isCompleted && approved.approvedImageResponseIds.includes(s.id))
    .map((s) => {
      const imageUrl = extractImageUrl(findAnswer(s, imageQuestions, "写真"));
      const categoryLabel = extractCategoryLabel(findAnswer(s, imageQuestions, "カテゴリ"));
      const caption = findAnswer(s, imageQuestions, "コメント（任意・140字まで）");
      const id = `gallery-${s.id}`;

      return {
        id,
        imageUrl,
        caption: caption || null,
        category: toCategory(categoryLabel),
        createdAt: s.submittedAt,
        commentFormUrl: `https://tally.so/r/${TALLY_COMMENT_FORM_ID}?image_id=${encodeURIComponent(id)}`,
        comments: [],
      };
    })
    .filter((img) => {
      if (!img.imageUrl) {
        console.warn(`⚠️ 画像URLを取得できなかったためスキップ: ${img.id}`);
        return false;
      }
      return true;
    });

  console.log(`✨ 承認済み画像 ${images.length} 件`);

  console.log("📡 コメント投稿フォームの回答を取得中");
  const { questions: commentQuestions, submissions: commentSubmissions } = await fetchAllSubmissions(
    TALLY_API_KEY,
    TALLY_COMMENT_FORM_ID
  );
  console.log(`📋 ${commentSubmissions.length} 件の回答を検出`);
  warnUnmatchedIds(approved.approvedCommentResponseIds, commentSubmissions, "コメント");

  const imagesById = new Map(images.map((img) => [img.id, img]));

  for (const s of commentSubmissions) {
    if (!s.isCompleted || !approved.approvedCommentResponseIds.includes(s.id)) continue;

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

  console.log(`✅ 更新完了（承認済み ${images.length} 件）`);
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  process.exit(1);
});
