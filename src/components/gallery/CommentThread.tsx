import type { GalleryComment } from "@/types";

interface CommentThreadProps {
  comments: GalleryComment[];
  issueUrl: string;
}

export default function CommentThread({ comments, issueUrl }: CommentThreadProps) {
  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-xs font-medium text-warm-text tracking-wide">
        コメント {comments.length > 0 && `(${comments.length})`}
      </h3>

      {comments.length === 0 ? (
        <p className="text-xs text-warm-muted">まだコメントはありません</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="bg-cream-100 rounded-2xl px-4 py-2.5 text-sm text-warm-text">
              <p className="whitespace-pre-wrap break-words">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <a
        href={issueUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium bg-mint-100 text-mint-500 px-3 py-1.5 rounded-full hover:bg-mint-200"
      >
        GitHubでコメントする ↗
      </a>
    </div>
  );
}
