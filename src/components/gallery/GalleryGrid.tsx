"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type { GalleryData } from "@/types";
import Lightbox from "./Lightbox";

const PAGE_SIZE = 24;

export default function GalleryGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const [data, setData] = useState<GalleryData | null>(null);
  const [errored, setErrored] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

    fetch(`${base}/data/gallery.json`)
      .then((r) => r.json())
      .then((json: GalleryData) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setErrored(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function openImage(id: string) {
    router.push(`?id=${id}`, { scroll: false });
  }

  function closeImage() {
    router.push("?", { scroll: false });
  }

  if (errored) {
    return (
      <div className="card p-10 text-center text-warm-muted text-sm">
        ギャラリーを読み込めませんでした。時間をおいて再度お試しください。
      </div>
    );
  }

  if (!data) {
    return <div className="card p-10 text-center text-warm-muted text-sm">読み込み中…</div>;
  }

  if (data.images.length === 0) {
    return (
      <div className="card p-10 text-center text-warm-muted text-sm">
        まだ承認済みの投稿がありません。最初の投稿をお待ちしています。
      </div>
    );
  }

  const visibleImages = data.images.slice(0, visibleCount);
  const selectedImage = selectedId ? (data.images.find((img) => img.id === selectedId) ?? null) : null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visibleImages.map((item) => (
          <button
            key={item.id}
            onClick={() => openImage(item.id)}
            className="card-hover aspect-square rounded-2xl overflow-hidden relative group"
          >
            <Image
              src={item.imageUrl}
              alt={item.caption ?? "投稿画像"}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
            />
            {item.comments.length > 0 && (
              <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                💬 {item.comments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {visibleCount < data.images.length && (
        <div className="text-center mt-5">
          <button
            onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
            className="px-5 py-2 rounded-xl text-xs font-light tracking-wide bg-white border border-warm-border text-warm-muted hover:bg-cream-100"
          >
            もっと見る
          </button>
        </div>
      )}

      {selectedImage && <Lightbox image={selectedImage} onClose={closeImage} />}
    </>
  );
}
