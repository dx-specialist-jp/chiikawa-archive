import type { Post } from "@/types";
import { formatJst } from "@/lib/date";
import CategoryBadge from "./CategoryBadge";
import TwitterEmbed from "./TwitterEmbed";
import TagList from "./ui/TagList";

interface PostCardProps {
  post: Post;
}

/**
 * 公式X投稿1件のカード。トップ・アーカイブ・検索で共通に使う。
 *
 * 本文（`post.summary`）はここには出さない。X の埋め込みが同じ本文を
 * 表示するため、並べると同じ文章が2回出る。本文は /search の
 * キーワード検索にのみ使う。
 */
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

      <TagList characters={post.characters} tags={post.tags} divided />
    </article>
  );
}
