/** サイト全体で共有する定数。メタデータ・フッター・sitemap から参照する。 */

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const SITE = {
  name: "CHIIKAWA ARCHIVE",
  tagline: "UNOFFICIAL FAN ARCHIVE",
  url: "https://dx-specialist-jp.github.io/chiikawa-archive",
  description:
    "ちいかわ（ナガノ）の公式X（旧Twitter）情報を整理・検索しやすくする非公式ファンアーカイブです。漫画、グッズ、アニメ、コラボ情報をカテゴリ別に分類してお届けします。",
  shortDescription: "ちいかわの公式情報を整理・検索しやすくする非公式ファンアーカイブ",
  officialX: "https://x.com/ngnchiikawa",
  repository: "https://github.com/dx-specialist-jp/chiikawa-archive",
  issuesUrl: "https://github.com/dx-specialist-jp/chiikawa-archive/issues/new",
} as const;

/** `public/` 配下のアセットを basePath 込みの URL に解決する */
export function assetPath(path: string): string {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
