"use client";

import { useEffect, useState } from "react";
import { assetPath } from "./site";

export type LoadState<T> =
  | { status: "loading"; data: null }
  | { status: "ready"; data: T }
  | { status: "error"; data: null };

/** `public/data/*.json` を取得する（basePath 解決込み） */
export function fetchSiteJson<T>(fileName: string): Promise<T> {
  return fetch(assetPath(`/data/${fileName}`)).then((res) => {
    if (!res.ok) throw new Error(`${fileName} の取得に失敗しました (${res.status})`);
    return res.json() as Promise<T>;
  });
}

/**
 * データ JSON をクライアント側で一度だけ取得する。
 * 大きな JSON を HTML に埋め込まずブラウザキャッシュに任せることで、
 * ページ本体の転送量を小さく保つ。
 */
export function useSiteJson<T>(fileName: string): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: "loading", data: null });

  useEffect(() => {
    let cancelled = false;
    fetchSiteJson<T>(fileName)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [fileName]);

  return state;
}
