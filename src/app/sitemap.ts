import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { readSiteData } from "@/lib/server-data";

export const dynamic = "force-static";

/** 更新頻度の高い順に並べたサイト内のページ */
const ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/news", changeFrequency: "daily", priority: 0.9 },
  { path: "/archive", changeFrequency: "daily", priority: 0.9 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.7 },
  { path: "/search", changeFrequency: "monthly", priority: 0.6 },
  { path: "/stats", changeFrequency: "weekly", priority: 0.6 },
  { path: "/rights", changeFrequency: "yearly", priority: 0.4 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { lastUpdated } = await readSiteData();
  const lastModified = lastUpdated ? new Date(lastUpdated) : new Date();

  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    // next.config.ts の trailingSlash: true に合わせて末尾スラッシュを付ける
    url: `${SITE.url}${path.endsWith("/") ? path : `${path}/`}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
