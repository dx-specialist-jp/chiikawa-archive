import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import GrassBackground from "@/components/GrassBackground";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["ちいかわ", "chiikawa", "ナガノ", "非公式", "ファンサイト", "archive", "X", "Twitter"],
  alternates: { canonical: "/" },
  openGraph: {
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.shortDescription,
    url: SITE.url,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE.name,
    description: SITE.shortDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F5F2EC",
  colorScheme: "light",
};

/** 検索エンジンにサイトの性格（非公式ファンアーカイブ）を伝える構造化データ */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  alternateName: "ちいかわアーカイブ（非公式）",
  url: SITE.url,
  description: SITE.description,
  inLanguage: "ja",
  isAccessibleForFree: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* next/font/google の Noto Serif JP は japanese サブセットを提供していないため、
            全ページ共通で読み込む root layout 内でリンクタグを直接使用している */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="skip-link">
          本文へスキップ
        </a>
        <GrassBackground />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
