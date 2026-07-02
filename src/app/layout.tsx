import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import GrassBackground from "@/components/GrassBackground";

export const metadata: Metadata = {
  title: {
    default: "CHIIKAWA ARCHIVE",
    template: "%s | CHIIKAWA ARCHIVE",
  },
  description:
    "ちいかわ（nagano）の公式X（旧Twitter）情報を整理・検索しやすくする非公式ファンアーカイブです。漫画、グッズ、アニメ、コラボ情報をカテゴリ別に分類してお届けします。",
  keywords: ["ちいかわ", "chiikawa", "ナガノ", "非公式", "ファンサイト", "archive", "X", "Twitter"],
  openGraph: {
    title: "CHIIKAWA ARCHIVE",
    description: "ちいかわの公式情報を整理・検索しやすくする非公式ファンアーカイブ",
    locale: "ja_JP",
    type: "website",
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
        {/* next/font/google の Noto Serif JP は japanese サブセットを提供していないため、
            全ページ共通で読み込む root layout 内でリンクタグを直接使用している */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <GrassBackground />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
