export type PostCategory =
  | "manga"
  | "goods"
  | "anime"
  | "collab"
  | "event"
  | "other";

export interface Post {
  id: string;
  tweetId: string;
  url: string;
  publishedAt: string;
  category: PostCategory;
  tags: string[];
  summary?: string;
  characters: string[];
  photoUrl?: string | null;
}

export interface SiteData {
  lastUpdated: string;
  totalPosts: number;
  posts: Post[];
  calendarData: CalendarDay[];
}

export interface CalendarDay {
  date: string;
  count: number;
  categories: PostCategory[];
}

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  manga: "漫画",
  goods: "グッズ",
  anime: "アニメ",
  collab: "コラボ",
  event: "イベント",
  other: "その他",
};

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  category: PostCategory;
  tags: string[];
}

export interface NewsData {
  lastUpdated: string;
  totalArticles: number;
  articles: NewsArticle[];
}

export type GalleryCategory = "goods" | "event" | "other";

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  goods: "グッズ",
  event: "イベント",
  other: "その他",
};

export interface GalleryComment {
  id: string;
  body: string;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  category: GalleryCategory;
  createdAt: string;
  commentFormUrl: string;
  comments: GalleryComment[];
}

export interface GalleryData {
  lastUpdated: string;
  totalImages: number;
  images: GalleryImage[];
}
