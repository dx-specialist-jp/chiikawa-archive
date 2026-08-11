const SUBMISSION_URL = "https://tally.so/r/dWG9dA";

export default function UploadForm() {
  return (
    <div className="card p-6 text-center">
      <p className="text-sm text-warm-muted mb-4">
        アカウント登録は不要です。写真（10MBまで）とキャプションを添えて投稿してください。
      </p>
      <a
        href={SUBMISSION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex items-center gap-2"
      >
        投稿する ↗
      </a>
    </div>
  );
}
