"use client";

import { useEffect, useRef } from "react";

interface TwitterEmbedProps {
  tweetId: string;
  url?: string;
  className?: string;
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

export default function TwitterEmbed({ tweetId, url, className }: TwitterEmbedProps) {
  const tweetUrl = url ?? `https://x.com/i/web/status/${tweetId}`;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const loadWidget = () => {
      if (window.twttr?.widgets) {
        window.twttr.widgets.load(container);
      }
    };

    if (window.twttr) {
      loadWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = loadWidget;
      document.head.appendChild(script);
    }
  }, [tweetId]);

  return (
    <div ref={containerRef} className={className}>
      <blockquote
        className="twitter-tweet"
        data-dnt="true"
        data-theme="light"
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
