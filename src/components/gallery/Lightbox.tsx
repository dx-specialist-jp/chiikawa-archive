"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/types";
import { GALLERY_CATEGORY_LABELS } from "@/types";
import CommentThread from "./CommentThread";

interface LightboxProps {
  image: GalleryImage;
  onClose: () => void;
}

export default function Lightbox({ image, onClose }: LightboxProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-warm-border sticky top-0 bg-white rounded-t-3xl">
          <span className="text-xs text-warm-muted tracking-widest uppercase">Gallery</span>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 text-warm-muted"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          <Image
            src={image.imageUrl}
            alt={image.caption ?? "投稿画像"}
            width={800}
            height={800}
            className="w-full h-auto rounded-2xl border border-warm-border"
          />
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs bg-lavender-100 text-lavender-400 px-2.5 py-0.5 rounded-full">
              {GALLERY_CATEGORY_LABELS[image.category]}
            </span>
            <time className="text-xs text-warm-muted">
              {new Date(image.createdAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: "Asia/Tokyo",
              })}
            </time>
          </div>
          {image.caption && (
            <p className="mt-2 text-sm text-warm-text leading-relaxed">{image.caption}</p>
          )}

          <CommentThread comments={image.comments} issueUrl={image.issueUrl} />
        </div>
      </div>
    </div>
  );
}
