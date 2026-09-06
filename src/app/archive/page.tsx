import type { Metadata } from "next";
import { readSiteData } from "@/lib/server-data";
import PostViewer from "@/components/PostViewer";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Post Archive",
  description:
    "ちいかわ公式Xの投稿をカレンダーとカテゴリから辿れるアーカイブ。日付を選ぶとその日の投稿が読めます。",
};

export default async function ArchivePage() {
  const { calendarData } = await readSiteData();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <PageHeader
        title="Post Archive"
        description="カレンダーで日付を選ぶか、カテゴリで絞り込んで公式X投稿を確認できます"
      />

      <PostViewer calendarData={calendarData} />
    </div>
  );
}
