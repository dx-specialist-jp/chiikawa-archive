import type { Post } from "@/types";
import { formatJst } from "@/lib/date";
import CategoryBadge from "./CategoryBadge";
import TwitterEmbed from "./TwitterEmbed";
import TagList from "./ui/TagList";

interface PostCardProps {
  post: Post;
}

/** 公式X投稿1件のカード。トップ・アーカイブ・検索で共通に使う。 */
export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="card p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <CategoryBadge category={post.category} />
        <time dateTime={post.publishedAt} className="text-xs text-warm-muted shrink-0 tabular-nums">
          {formatJst(post.publishedAt, "shortDateTime")}
        </time>
      </div>

      <TwitterEmbed
        tweetId={post.tweetId}
        url={post.url}
        hasSinglePhoto={Boolean(post.photoUrl)}
      />

      {post.summary && (
        <p className="mt-3 text-sm text-warm-text leading-relaxed">{post.summary}</p>
      )}

      <TagList characters={post.characters} tags={post.tags} divided />
    </article>
  );
}
