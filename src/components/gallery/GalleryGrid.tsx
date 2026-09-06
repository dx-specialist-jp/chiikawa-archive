"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type { GalleryData } from "@/types";
import { useSiteJson } from "@/lib/client-data";
import EmptyState from "@/components/ui/EmptyState";
import Lightbox from "./Lightbox";

const PAGE_SIZE = 24;

export default function GalleryGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const gallery = useSiteJson<GalleryData>("gallery.json");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (gallery.status === "loading") {
    return <EmptyState title="読み込んでいます…" />;
  }

  if (gallery.status === "error") {
    return (
      <EmptyState
        title="ギャラリーを読み込めませんでした"
        hint="時間をおいて再度お試しください"
      />
    );
  }

  const { images } = gallery.data;

  if (images.length === 0) {
    return (
      <EmptyState
        title="まだ投稿がありません"
        hint="最初の1枚をお待ちしています"
      />
    );
  }

  const visible = images.slice(0, visibleCount);
  const selectedImage = images.find((image) => image.id === selectedId) ?? null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visible.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => router.push(`?id=${image.id}`, { scroll: false })}
            aria-label={image.caption ?? "投稿画像を拡大表示"}
            className="card-hover aspect-square rounded-2xl overflow-hidden relative"
          >
            <Image
              src={image.imageUrl}
              alt={image.caption ?? "ファンが投稿した写真"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="object-cover"
            />
            {image.comments.length > 0 && (
              <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full tabular-nums">
                💬 {image.comments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length < images.length && (
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="btn-secondary"
          >
            もっと見る
          </button>
        </div>
      )}

      {selectedImage && (
        <Lightbox image={selectedImage} onClose={() => router.push("?", { scroll: false })} />
      )}
    </>
  );
}
