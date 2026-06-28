import type { Metadata } from "next";
import SearchViewer from "@/components/SearchViewer";

export const metadata: Metadata = {
  title: "Search",
  description: "CHIIKAWA ARCHIVE の投稿をキャラクター名・タグ・キーワードで全文検索できます。",
};

export default function SearchPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-xl font-serif text-warm-text tracking-wide mb-1">Search</h1>
        <p className="text-sm text-warm-muted">キャラクター名・タグ・カテゴリで投稿を検索</p>
      </div>
      <SearchViewer />
    </div>
  );
}
