"use client";

import { useEffect, useRef } from "react";

interface TwitterEmbedProps {
  tweetId: string;
  url?: string;
  className?: string;
  photoUrl?: string | null;
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

// 複数の TwitterEmbed が同時にマウントされても widgets.js の <script> タグが
// 重複挿入されないよう、読み込みの Promise をモジュールスコープで共有する
let widgetsScriptPromise: Promise<void> | null = null;

function loadWidgetsScript(): Promise<void> {
  if (window.twttr?.widgets) return Promise.resolve();
  if (!widgetsScriptPromise) {
    widgetsScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("widgets.js の読み込みに失敗しました"));
      document.head.appendChild(script);
    }).catch((err: unknown) => {
      // 失敗を永続キャッシュしない。次回マウント時に再試行できるようリセットする
      widgetsScriptPromise = null;
      throw err;
    });
  }
  return widgetsScriptPromise;
}

export default function TwitterEmbed({ tweetId, url, className, photoUrl }: TwitterEmbedProps) {
  const tweetUrl = url ?? `https://x.com/i/web/status/${tweetId}`;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (photoUrl) return; // 画像を直接表示する場合は widgets.js 不要
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    loadWidgetsScript()
      .then(() => {
        if (!cancelled && window.twttr?.widgets) {
          window.twttr.widgets.load(container);
        }
      })
      .catch(() => {
        // 読み込み失敗時はフォールバックのリンク（blockquote内の <a>）がそのまま表示される
      });

    return () => {
      cancelled = true;
    };
  }, [tweetId, photoUrl]);

  // 画像1枚のみの投稿は、X埋め込みウィジェットが縦長画像の上下をトリミングして
  // 表示することがあるため、元画像を直接 <img> で表示し常に全体が見えるようにする
  if (photoUrl) {
    return (
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block rounded-2xl overflow-hidden border border-warm-border ${className ?? ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt="" className="w-full h-auto block" loading="lazy" />
      </a>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <blockquote
        className="twitter-tweet"
        data-dnt="true"
        data-theme="light"
        data-width="550"
      >
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Xで投稿を見る
        </a>
      </blockquote>
    </div>
  );
}
