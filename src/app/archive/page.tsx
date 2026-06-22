import { promises as fs } from "fs";
import path from "path";
import type { SiteData } from "@/types";
import PostViewer from "@/components/PostViewer";

async function getData(): Promise<SiteData> {
  const filePath = path.join(process.cwd(), "public", "data", "posts.json");
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as SiteData;
}

export default async function ArchivePage() {
  const data = await getData();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-warm-text">📚 投稿アーカイブ</h1>
        <p className="text-sm text-warm-muted mt-1">
          カレンダーで日付を選ぶか、カテゴリで絞り込んで公式X投稿を確認できます
        </p>
      </div>

      <PostViewer posts={data.posts} calendarData={data.calendarData} />
    </div>
  );
}
