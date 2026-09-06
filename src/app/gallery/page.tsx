import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import GuidelineNotice from "@/components/gallery/GuidelineNotice";
import UploadForm from "@/components/gallery/UploadForm";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { readGalleryData } from "@/lib/server-data";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "ちいかわグッズ・イベント写真のファン投稿ギャラリー。アカウント登録なしで投稿できます。",
};

export default async function GalleryPage() {
  const { submissionFormUrl } = await readGalleryData();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title="Gallery"
        description="みんなが投稿したグッズ・イベントの記念写真です。写真をタップすると拡大表示とコメントが見られます。"
      />

      <div className="space-y-6">
        <UploadForm submissionFormUrl={submissionFormUrl} />
        <Suspense fallback={<EmptyState title="読み込んでいます…" />}>
          <GalleryGrid />
        </Suspense>
        <GuidelineNotice />
      </div>
    </div>
  );
}
