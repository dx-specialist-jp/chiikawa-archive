"use client";

import { useEffect, useRef } from "react";

interface TwitterEmbedProps {
  tweetId: string;
  url?: string;
  className?: string;
  hasSinglePhoto?: boolean;
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

export default function TwitterEmbed({ tweetId, url, className, hasSinglePhoto }: TwitterEmbedProps) {
  const tweetUrl = url ?? `https://x.com/i/web/status/${tweetId}`;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, [tweetId]);

  return (
    <div className={className}>
      {hasSinglePhoto && (
        // X公式の埋め込みウィジェットは縦長画像の上下をトリミングして表示することがあるため、
        // 画像を自前で表示するのではなく、X上の元画像ページへのリンクを埋め込みの上に明示する
        <a
          href={`${tweetUrl}/photo/1`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium bg-mint-100 text-mint-500 px-2.5 py-1 rounded-full hover:bg-mint-200"
        >
          画像が見切れている場合はXで元画像を見る ↗
        </a>
      )}
      <div ref={containerRef}>
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
    </div>
  );
}
