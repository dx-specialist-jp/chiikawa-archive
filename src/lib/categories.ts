import type { CategoryFilter, PostCategory } from "@/types";
import { ALL_CATEGORIES } from "@/types";

/**
 * カテゴリ別の件数を数える。
 * 0件のカテゴリもキーを持たせることで、絞り込みUIが「0」と表示して選択不可にできる。
 */
export function countByCategory(
  items: readonly { category: PostCategory }[]
): Record<CategoryFilter, number> {
  const counts = Object.fromEntries(
    ALL_CATEGORIES.map((category) => [category, 0])
  ) as Record<CategoryFilter, number>;

  counts.all = items.length;
  for (const item of items) counts[item.category]++;
  return counts;
}
