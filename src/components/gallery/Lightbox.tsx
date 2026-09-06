"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { GalleryImage } from "@/types";
import { GALLERY_CATEGORY_LABELS } from "@/types";
import { formatJst } from "@/lib/date";
import CommentThread from "./CommentThread";

interface LightboxProps {
  image: GalleryImage;
  onClose: () => void;
}

/**
 * 投稿画像の拡大表示。Esc / 背景クリック / 閉じるボタンで閉じる。
 *
 * body 直下に描画する。ギャラリーの一覧は `space-y-6` の中にあり、そこに置くと
 * position: fixed のオーバーレイにも margin-top: 24px が効いて画面上端24pxを
 * 覆えなくなる（そこにあるヘッダーが前面に残り、クリックも吸われる）。
 */
export default function Lightbox({ image, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // mounted になって初めて中身が描画されるので、フォーカス移動もそれを待つ
  useEffect(() => {
    if (!mounted) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    // 背後のページがスクロールしないようにする
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      // ダイアログ内でフォーカスを循環させる
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [onClose, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="投稿画像の詳細"
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-card animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-warm-border sticky top-0 bg-white rounded-t-3xl z-10">
          <span className="text-xs text-warm-muted tracking-widest uppercase">Gallery</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 text-warm-muted text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          <Image
            src={image.imageUrl}
            alt={image.caption ?? "ファンが投稿した写真"}
            width={800}
            height={800}
            className="w-full h-auto rounded-2xl border border-warm-border"
          />

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs bg-lavender-100 text-lavender-400 px-2.5 py-0.5 rounded-full">
              {GALLERY_CATEGORY_LABELS[image.category]}
            </span>
            <time dateTime={image.createdAt} className="text-xs text-warm-muted">
              {formatJst(image.createdAt, "shortDate")}
            </time>
          </div>

          {image.caption && (
            <p className="mt-2 text-sm text-warm-text leading-relaxed whitespace-pre-wrap break-words">
              {image.caption}
            </p>
          )}

          <CommentThread comments={image.comments} commentFormUrl={image.commentFormUrl} />
        </div>
      </div>
    </div>,
    document.body
  );
}
