import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "ちいかわ観測所",
    template: "%s | ちいかわ観測所",
  },
  description:
    "ちいかわ（nagano）の公式X（旧Twitter）情報を整理・検索しやすくする非公式ナレッジサイトです。漫画、グッズ、アニメ、コラボ情報をカテゴリ別に分類してお届けします。",
  keywords: ["ちいかわ", "chiikawa", "ナガノ", "非公式", "ファンサイト", "X", "Twitter"],
  openGraph: {
    title: "ちいかわ観測所",
    description: "ちいかわの公式情報を整理・検索しやすくする非公式ナレッジサイト",
    locale: "ja_JP",
    type: "website",
  },
  other: {
    "google-site-verification": "",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-warm-bg">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
