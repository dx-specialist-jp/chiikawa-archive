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
