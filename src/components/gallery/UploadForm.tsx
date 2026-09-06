/**
 * 投稿フォームのURLが gallery.json に無い場合の控え。
 * 同期スクリプトが一度でも動けば gallery.json 側の値が使われる。
 */
const FALLBACK_SUBMISSION_URL = "https://tally.so/r/dWG9dA";

interface UploadFormProps {
  /** gallery.json が持つ投稿フォームURL（同期に使っているフォームIDから生成される） */
  submissionFormUrl?: string;
}

/** Tally のフォームで投稿を受け付ける（投稿者のアカウント登録は不要） */
export default function UploadForm({ submissionFormUrl }: UploadFormProps) {
  const submissionUrl = submissionFormUrl ?? FALLBACK_SUBMISSION_URL;

  return (
    <div className="card p-6 text-center">
      <p className="text-sm text-warm-muted mb-4 leading-relaxed">
        アカウント登録は不要です。写真（10MBまで）とキャプションを添えて投稿してください。
      </p>
      <a
        href={submissionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex items-center gap-2"
      >
        写真を投稿する ↗
      </a>
    </div>
  );
}
