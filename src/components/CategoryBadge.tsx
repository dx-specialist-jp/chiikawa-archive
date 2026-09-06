import type { PostCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

interface CategoryBadgeProps {
  category: PostCategory;
  size?: "sm" | "md";
}

const COLORS: Record<PostCategory, string> = {
  manga: "bg-mint-100 text-mint-500",
  goods: "bg-peach-100 text-peach-400",
  anime: "bg-lavender-100 text-lavender-500",
  collab: "bg-honey-100 text-honey-400",
  event: "bg-peach-200 text-peach-400",
  other: "bg-cream-200 text-warm-muted",
};

export default function CategoryBadge({ category, size = "sm" }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium shrink-0 ${COLORS[category]} ${
        size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"
      }`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
