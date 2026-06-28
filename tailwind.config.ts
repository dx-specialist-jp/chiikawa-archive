import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 背景・カード用の温かな紙トーン
        cream: {
          50:  "#FDFBF7",
          100: "#F8F4ED",
          200: "#EEE6D9",
          300: "#E2D6C4",
          400: "#D4C4AE",
        },
        // プライマリアクセント → ウォームゴールド（ブランドカラー）
        mint: {
          100: "#F5EDD6",
          200: "#E8D5A4",
          300: "#D0B872",
          400: "#B8956A",   // メインゴールド
          500: "#8E6E46",   // ダークゴールド
        },
        // セカンダリ → ディープスレート（シャコール）
        lavender: {
          100: "#E8EAEC",
          200: "#C4CAD0",
          300: "#8E98A4",
          400: "#546070",
          500: "#344050",
        },
        // アクセント補助
        peach: {
          100: "#F2EBE4",
          200: "#E2D3C5",
          300: "#C8B4A0",
          400: "#B09080",
        },
        // サブアクセント（ストリークバッジ等）
        honey: {
          100: "#F5EDD6",
          200: "#E8D5A4",
          300: "#CEB878",
          400: "#B09050",
        },
        // テキスト・ボーダー基調色
        warm: {
          text:   "#1A1714",
          muted:  "#5C544A",
          border: "#DDD4C4",
          bg:     "#F5F2EC",
        },
      },
      fontFamily: {
        sans: [
          "Noto Sans JP",
          "Hiragino Kaku Gothic ProN",
          "sans-serif",
        ],
        serif: [
          "Noto Serif JP",
          "Hiragino Mincho ProN",
          "serif",
        ],
      },
      boxShadow: {
        soft:        "0 1px 6px rgba(26, 23, 20, 0.05)",
        card:        "0 2px 14px rgba(26, 23, 20, 0.06)",
        "card-hover":"0 4px 24px rgba(26, 23, 20, 0.10)",
      },
      borderRadius: {
        "2xl": "0.625rem",
        "3xl": "1rem",
        "4xl": "1.375rem",
      },
      letterSpacing: {
        widest: "0.14em",
      },
    },
  },
  plugins: [],
};

export default config;
