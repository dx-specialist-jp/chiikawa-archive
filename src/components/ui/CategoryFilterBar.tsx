"use client";

import { ALL_CATEGORIES, CATEGORY_LABELS } from "@/types";
import type { CategoryFilter } from "@/types";

interface CategoryFilterBarProps {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
  /** カテゴリごとの件数（渡すとラベル横に表示し、0件は選択不可にする） */
  counts?: Partial<Record<CategoryFilter, number>>;
  className?: string;
}

/**
 * アーカイブ・検索・ニュースで共通のカテゴリ絞り込み。
 * 選択中のカテゴリをもう一度押すと「すべて」に戻る。
 */
export default function CategoryFilterBar({
  value,
  onChange,
  counts,
  className = "",
}: CategoryFilterBarProps) {
  const options: CategoryFilter[] = ["all", ...ALL_CATEGORIES];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="group" aria-label="カテゴリで絞り込む">
      {options.map((option) => {
        const selected = value === option;
        const count = counts?.[option];
        const disabled = count === 0 && !selected;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onChange(selected && option !== "all" ? "all" : option)}
            className={`px-3 py-1.5 rounded-xl text-xs tracking-wide transition-colors ${
              selected
                ? "bg-mint-400 text-white font-medium"
                : "bg-white border border-warm-border text-warm-muted hover:bg-cream-100 hover:text-warm-text"
            } ${disabled ? "opacity-40 cursor-not-allowed hover:bg-white" : ""}`}
          >
            {option === "all" ? "すべて" : CATEGORY_LABELS[option]}
            {count != null && <span className="ml-1.5 tabular-nums opacity-70">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
