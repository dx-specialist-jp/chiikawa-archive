const SUBMISSION_URL =
  "https://github.com/dx-specialist-jp/chiikawa-archive/issues/new?template=gallery-submission.yml";

export default function UploadForm() {
  return (
    <div className="card p-6 text-center">
      <p className="text-sm text-warm-muted mb-4">
        投稿にはGitHubアカウントが必要です。写真とキャプションを添えて投稿してください。
      </p>
      <a
        href={SUBMISSION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex items-center gap-2"
      >
        GitHubで投稿する ↗
      </a>
    </div>
  );
}
