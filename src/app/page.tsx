import Link from "next/link";
import { readNewsData, readSiteData } from "@/lib/server-data";
import { toJstDateString, todayJst } from "@/lib/date";
import HeroSection from "@/components/HeroSection";
import UpdateCalendar from "@/components/UpdateCalendar";
import PostCard from "@/components/PostCard";
import CategoryBadge from "@/components/CategoryBadge";
import SectionTitle from "@/components/ui/SectionTitle";
import EmptyState from "@/components/ui/EmptyState";

/** トップに並べる「最近の更新」の件数 */
const RECENT_POSTS = 5;
const LATEST_NEWS = 6;

export default async function HomePage() {
  const [data, newsData] = await Promise.all([readSiteData(), readNewsData()]);

  const today = todayJst();
  const todayPosts = data.posts.filter((post) => toJstDateString(post.publishedAt) === today);
  const todayIds = new Set(todayPosts.map((post) => post.id));
  const recentPosts = data.posts.filter((post) => !todayIds.has(post.id)).slice(0, RECENT_POSTS);
  const latestNews = newsData.articles.slice(0, LATEST_NEWS);

  // posts.json の lastUpdated は「スクリプトの実行時刻」なので投稿日時としては使えない。
  // 並び順にも依存しないよう、最新の publishedAt を明示的に求める。
  const latestPostAt = data.posts.reduce(
    (latest, post) => (post.publishedAt > latest ? post.publishedAt : latest),
    ""
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <HeroSection
        todayCount={todayPosts.length}
        totalPosts={data.totalPosts}
        latestPostAt={latestPostAt}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左カラム：公式X投稿 */}
        <div className="lg:col-span-2 space-y-8">
          <section aria-labelledby="today-heading">
            <SectionTitle
              floating
              className="mb-3"
              meta={todayPosts.length > 0 ? `${todayPosts.length}件` : undefined}
            >
              <span id="today-heading">Today&apos;s Update</span>
            </SectionTitle>

            {todayPosts.length === 0 ? (
              <EmptyState
                title="本日はまだ更新がありません"
                hint="公式Xの新着を1日数回チェックしています"
              />
            ) : (
              <div className="space-y-4">
                {todayPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="recent-heading">
            <SectionTitle floating className="mb-3">
              <span id="recent-heading">Recent Posts</span>
            </SectionTitle>

            <div className="space-y-4">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <Link
                href="/archive"
                className="on-photo px-3.5 py-2 text-xs text-mint-500 hover:text-mint-400 font-medium transition-colors"
              >
                アーカイブをすべて見る →
              </Link>
            </div>
          </section>
        </div>

        {/* 右カラム：ニュース・カレンダー */}
        <div className="space-y-6">
          {latestNews.length > 0 && (
            <section aria-labelledby="news-heading">
              <SectionTitle floating className="mb-3">
                <span id="news-heading">Latest News</span>
              </SectionTitle>

              <div className="card divide-y divide-warm-border overflow-hidden">
                {latestNews.map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 hover:bg-cream-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <CategoryBadge category={article.category} />
                      <span className="text-xs text-warm-muted truncate">{article.source}</span>
                    </div>
                    <p className="text-xs text-warm-text leading-snug line-clamp-2 font-medium">
                      {article.title}
                    </p>
                  </a>
                ))}
              </div>

              <div className="mt-2 flex justify-end">
                <Link
                  href="/news"
                  className="on-photo px-3.5 py-2 text-xs text-mint-500 hover:text-mint-400 font-medium transition-colors"
                >
                  ニュース一覧 →
                </Link>
              </div>
            </section>
          )}

          <UpdateCalendar data={data.calendarData} />

          <aside className="on-photo p-4 text-xs text-warm-muted leading-relaxed">
            <p className="font-medium text-warm-text mb-1 tracking-wide">このサイトについて</p>
            <p>
              非公式のファンサイトです。公式X（旧Twitter）の埋め込み機能を通じて情報を表示しています。
              漫画画像・動画等はサイト内に保存していません。
            </p>
            <Link href="/rights" className="text-mint-500 hover:underline mt-1.5 inline-block">
              権利について →
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
