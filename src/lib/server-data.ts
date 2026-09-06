import { promises as fs } from "fs";
import path from "path";
import type { GalleryData, NewsArchiveData, NewsArchiveYear, NewsData, SiteData } from "@/types";

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

/**
 * 年別アーカイブの一覧を作る。件数だけをビルド時に数えておき、
 * 記事本体はブラウザが必要になった時点で取得する。
 */
export async function readNewsArchiveYears(): Promise<NewsArchiveYear[]> {
  const dir = path.join(process.cwd(), "public", "data", "news-archive");
  let fileNames: string[];
  try {
    fileNames = (await fs.readdir(dir)).filter((name) => name.endsWith(".json"));
  } catch {
    return []; // 退避がまだ発生していない状態
  }

  const years = await Promise.all(
    fileNames.map(async (fileName) => {
      const data = JSON.parse(await fs.readFile(path.join(dir, fileName), "utf-8")) as NewsArchiveData;
      return { year: data.year, totalArticles: data.articles.length };
    })
  );
  return years.sort((a, b) => b.year.localeCompare(a.year));
}

export function readGalleryData(): Promise<GalleryData> {
  return readJson<GalleryData>("gallery.json", {
    lastUpdated: "",
    totalImages: 0,
    images: [],
  });
}
