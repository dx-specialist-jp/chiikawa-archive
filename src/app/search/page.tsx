import type { Metadata } from "next";
import SearchViewer from "@/components/SearchViewer";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Search",
  description: "CHIIKAWA ARCHIVE の投稿をキャラクター名・タグ・キーワードで検索できます。",
};

export default function SearchPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader
        title="Search"
        description="投稿本文のキーワード・キャラクター名・タグ・カテゴリで公式X投稿を絞り込めます"
      />
      <SearchViewer />
    </div>
  );
}
