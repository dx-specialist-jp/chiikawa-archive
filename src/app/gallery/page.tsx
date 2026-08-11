import type { Metadata } from "next";
import { Suspense } from "react";
import GuidelineNotice from "@/components/gallery/GuidelineNotice";
import UploadForm from "@/components/gallery/UploadForm";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description: "ちいかわグッズ・イベント写真のファン投稿ギャラリー。承認された投稿のみが公開されます。",
};

export default function GalleryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-serif text-warm-text tracking-wide mb-2">Gallery</h1>
        <p className="text-sm text-warm-muted">
          みんなが投稿したグッズ・イベントの記念写真です。投稿は管理者確認後に公開されます。
        </p>
      </div>

      <div className="space-y-6">
        <GuidelineNotice />
        <UploadForm />
        <Suspense fallback={<div className="card p-10 text-center text-warm-muted text-sm">読み込み中…</div>}>
          <GalleryGrid />
        </Suspense>
      </div>
    </div>
  );
}
