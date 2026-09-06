import { promises as fs } from "fs";
import path from "path";
import type { GalleryData, NewsData, SiteData } from "@/types";

/**
 * ビルド時に `public/data/*.json` を読み込むヘルパー。
 * サーバーコンポーネント専用（静的エクスポート時に一度だけ実行される）。
 */
async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", fileName);
    return JSON.parse(await fs.readFile(filePath, "utf-8")) as T;
  } catch {
    // データ未取得の状態でもビルドを通し、ページ側で空状態を表示させる
    return fallback;
  }
}

export function readSiteData(): Promise<SiteData> {
  return readJson<SiteData>("posts.json", {
    lastUpdated: "",
    totalPosts: 0,
    posts: [],
    calendarData: [],
  });
}

export function readNewsData(): Promise<NewsData> {
  return readJson<NewsData>("news.json", {
    lastUpdated: "",
    totalArticles: 0,
    articles: [],
  });
}

export function readGalleryData(): Promise<GalleryData> {
  return readJson<GalleryData>("gallery.json", {
    lastUpdated: "",
    totalImages: 0,
    images: [],
  });
}
