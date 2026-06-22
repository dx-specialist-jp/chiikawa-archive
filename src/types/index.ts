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

export interface Episode {
  id: string;
  number: number;
  title: string;
  tweetId: string;
  url: string;
  publishedAt: string;
  characters: string[];
  keywords: string[];
  relatedEpisodes: number[];
  tags: string[];
  summary: string;
}

export interface SiteData {
  lastUpdated: string;
  totalPosts: number;
  posts: Post[];
  calendarData: CalendarDay[];
  chiikawaIndex: ChiikawaIndex;
}

export interface CalendarDay {
  date: string;
  count: number;
  categories: PostCategory[];
}

export interface ChiikawaIndex {
  score: number;
  mood: "happy" | "sad" | "exciting" | "calm" | "mixed";
  label: string;
  description: string;
}

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  manga: "漫画",
  goods: "グッズ",
  anime: "アニメ",
  collab: "コラボ",
  event: "イベント",
  other: "その他",
};

export const CATEGORY_COLORS: Record<PostCategory, string> = {
  manga: "mint",
  goods: "peach",
  anime: "lavender",
  collab: "honey",
  event: "peach",
  other: "cream",
};
