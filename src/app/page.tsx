import { promises as fs } from "fs";
import path from "path";
import type { SiteData } from "@/types";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import ChiikawaIndex from "@/components/ChiikawaIndex";
import UpdateCalendar from "@/components/UpdateCalendar";
import PostCard from "@/components/PostCard";

async function getSiteData(): Promise<SiteData> {
  const filePath = path.join(process.cwd(), "public", "data", "posts.json");
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as SiteData;
}

function getTodayJst(): string {
  return new Date().toLocaleDateString("sv", { timeZone: "Asia/Tokyo" });
}

export default async function HomePage() {
  const data = await getSiteData();
  const todayStr = getTodayJst();
  const todayPosts = data.posts.filter((p) =>
    new Date(p.publishedAt).toLocaleDateString("sv", { timeZone: "Asia/Tokyo" }) === todayStr
  );
  const recentPosts = data.posts.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <HeroSection
        todayCount={todayPosts.length}
        totalPosts={data.totalPosts}
        lastUpdated={data.lastUpdated}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左カラム (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 今日の公式更新 */}
          <section>
            <div className="section-title mb-3">
              <span>📡</span>
              <span>今日の公式更新</span>
            </div>

            {todayPosts.length === 0 ? (
              <div className="card p-8 text-center text-warm-muted">
                <p className="text-2xl mb-2">🌙</p>
                <p className="text-sm">本日はまだ更新がありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayPosts.map((post) => (
                  <PostCard key={post.id} post={post} showEmbed />
                ))}
              </div>
            )}
          </section>

          {/* 最近の更新 */}
          <section>
            <div className="section-title mb-3">
              <span>🕐</span>
              <span>最近の更新</span>
            </div>
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        </div>

        {/* 右カラム (1/3) */}
        <div className="space-y-4">
          <CategoryGrid />
          <ChiikawaIndex data={data.chiikawaIndex} />
          <UpdateCalendar data={data.calendarData} />

          {/* 注意書き */}
          <div className="bg-cream-100 rounded-2xl border border-warm-border p-4 text-xs text-warm-muted leading-relaxed">
            <p className="font-semibold text-warm-text mb-1">⚠️ このサイトについて</p>
            <p>
              非公式のファンサイトです。公式X（旧Twitter）の埋め込み機能を通じて情報を表示しています。
              漫画画像・動画等はサイト内に保存していません。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
