import type { Post } from "@/types";
import CategoryBadge from "./CategoryBadge";
import TwitterEmbed from "./TwitterEmbed";

interface PostCardProps {
  post: Post;
  showEmbed?: boolean;
}

export default function PostCard({ post, showEmbed = false }: PostCardProps) {
  const date = new Date(post.publishedAt).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="card-hover p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <CategoryBadge category={post.category} />
        <time className="text-xs text-warm-muted shrink-0">{date}</time>
      </div>

      {showEmbed ? (
        <TwitterEmbed tweetId={post.tweetId} url={post.url} className="mb-3" />
      ) : (
        <>
          {post.summary && (
            <p className="text-sm text-warm-text leading-relaxed mb-3">{post.summary}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {post.characters.map((char) => (
              <span
                key={char}
                className="text-xs bg-lavender-100 text-lavender-400 px-2 py-0.5 rounded-full"
              >
                {char}
              </span>
            ))}
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs text-warm-muted">
                #{tag}
              </span>
            ))}
          </div>
          <div className="pt-3 border-t border-warm-border">
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-mint-500 hover:underline flex items-center gap-1"
            >
              <span>🐦</span>
              公式Xで見る
            </a>
          </div>
        </>
      )}
    </article>
  );
}
