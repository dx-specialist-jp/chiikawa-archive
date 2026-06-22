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
        cream: {
          50: "#FEFDF9",
          100: "#FDF8F0",
          200: "#FAF0DC",
          300: "#F5E4C0",
          400: "#EDD8A4",
        },
        mint: {
          100: "#DFF5EF",
          200: "#B8E8DC",
          300: "#8DD5C5",
          400: "#5FBFAC",
          500: "#3DA896",
        },
        lavender: {
          100: "#EDE8F8",
          200: "#D4CAF0",
          300: "#B6A8E6",
          400: "#9986DB",
          500: "#7C64D0",
        },
        peach: {
          100: "#FDF0EB",
          200: "#F9D6C8",
          300: "#F4B8A4",
          400: "#EF9A82",
        },
        honey: {
          100: "#FEF7E0",
          200: "#FCEDB8",
          300: "#F9E090",
          400: "#F5D168",
        },
        warm: {
          text: "#3A3530",
          muted: "#7A7068",
          border: "#E8DDD0",
          bg: "#FEFCF7",
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
        soft: "0 2px 12px rgba(100, 80, 60, 0.08)",
        card: "0 4px 20px rgba(100, 80, 60, 0.10)",
        "card-hover": "0 6px 28px rgba(100, 80, 60, 0.15)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
