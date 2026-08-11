/**
 * GitHub Issues（gallery-submission + approved ラベル）からギャラリー投稿とコメントを
 * 取得し gallery.json を更新する
 *
 * 環境変数:
 *   GITHUB_TOKEN      - GitHub API 呼び出し用トークン（必須。Actions では既定の GITHUB_TOKEN でよい）
 *   GITHUB_REPOSITORY - "owner/repo" 形式（Actions では既定で設定される）
 */

import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");
const GALLERY_JSON_PATH = join(DATA_DIR, "gallery.json");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY ?? "";

const CATEGORY_LABELS_JA_TO_EN = {
  グッズ: "goods",
  イベント: "event",
  その他: "other",
};

function apiHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "chiikawa-archive/1.0",
  };
}

async function githubGet(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: apiHeaders(),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    throw new Error(`GitHub API エラー: ${res.status} ${res.statusText} (${path})`);
  }
  return res.json();
}

/** ページネーションしながら承認済みギャラリー投稿issueを全件取得する */
async function fetchApprovedIssues(repo) {
  const issues = [];
  let page = 1;
  for (;;) {
    const batch = await githubGet(
      `/repos/${repo}/issues?labels=gallery-submission,approved&state=open&per_page=100&page=${page}`
    );
    issues.push(...batch.filter((issue) => !issue.pull_request));
    if (batch.length < 100) break;
    page += 1;
  }
  return issues;
}

async function fetchIssueComments(repo, issueNumber) {
  const comments = await githubGet(`/repos/${repo}/issues/${issueNumber}/comments?per_page=100`);
  return comments.map((c) => ({
    id: `comment-${c.id}`,
    body: c.body ?? "",
    createdAt: c.created_at,
  }));
}

// Issue Form は "### 見出し\n\n回答本文" の形でissue本文にレンダリングされる
function extractField(body, label) {
  const regex = new RegExp(`### ${label}\\s*\\n\\n([\\s\\S]*?)(?=\\n### |$)`);
  const match = body.match(regex);
  if (!match) return "";
  const value = match[1].trim();
  return value === "_No response_" ? "" : value;
}

function extractImageUrl(body) {
  const match = body.match(/!\[[^\]]*\]\(([^)\s]+)\)/);
  return match?.[1] ?? null;
}

function toCategory(label) {
  return CATEGORY_LABELS_JA_TO_EN[label] ?? "other";
}

async function main() {
  if (!GITHUB_TOKEN) {
    console.error("❌ GITHUB_TOKEN が未設定です");
    process.exit(1);
  }
  if (!GITHUB_REPOSITORY) {
    console.error("❌ GITHUB_REPOSITORY が未設定です");
    process.exit(1);
  }

  console.log(`📡 承認済みギャラリー投稿を取得中: ${GITHUB_REPOSITORY}`);
  const issues = await fetchApprovedIssues(GITHUB_REPOSITORY);
  console.log(`📋 ${issues.length} 件の承認済み投稿を検出`);

  const images = [];
  for (const issue of issues) {
    const imageUrl = extractImageUrl(issue.body ?? "");
    if (!imageUrl) {
      console.warn(`⚠️ 画像が見つからないためスキップ: issue #${issue.number}`);
      continue;
    }

    const comments = await fetchIssueComments(GITHUB_REPOSITORY, issue.number);

    images.push({
      id: `gallery-${issue.number}`,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      imageUrl,
      caption: extractField(issue.body ?? "", "コメント（任意・140字まで）") || null,
      category: toCategory(extractField(issue.body ?? "", "カテゴリ")),
      createdAt: issue.created_at,
      comments,
    });
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
