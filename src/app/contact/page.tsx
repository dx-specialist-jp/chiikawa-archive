import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import PageHeader from "@/components/ui/PageHeader";
import InfoCard from "@/components/ui/InfoCard";
import BulletList from "@/components/ui/BulletList";
import NoteBox from "@/components/ui/NoteBox";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "CHIIKAWA ARCHIVE へのお問い合わせ。権利侵害の報告・ご意見は GitHub Issues よりお送りください。",
};

const TOPICS = [
  "権利侵害のご報告",
  "掲載情報の誤りについて",
  "機能・コンテンツのご要望",
  "その他のご意見・ご質問",
];

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PageHeader
        title="Contact"
        description="ご意見・権利侵害のご報告は GitHub Issues よりお送りください。"
      />

      <div className="space-y-4">
        <InfoCard title="権利者様・緊急のご連絡" highlight>
          <p className="text-sm text-warm-muted leading-relaxed mb-4">
            著作権・商標権等の権利侵害に関するご報告は GitHub Issues よりご連絡ください。
            内容確認後、速やかに対応いたします。
          </p>
          <a
            href={SITE.issuesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            GitHub Issues を開く ↗
          </a>
        </InfoCard>

        <InfoCard title="お問い合わせの種類">
          <BulletList items={TOPICS} />
          <p className="text-xs text-warm-muted mt-4 leading-relaxed">
            いずれの内容も上記の GitHub Issues よりご連絡いただけます。
          </p>
        </InfoCard>

        <NoteBox title="このサイトについて">
          <p>
            当サイトはファンによる非公式サイトです。
            権利者様からのご連絡は原則24時間以内に対応いたします。
          </p>
          <p className="mt-1">
            詳しくは
            <Link href="/rights" className="text-mint-500 hover:underline mx-1">
              Rights
            </Link>
            のページをご確認ください。
          </p>
        </NoteBox>
      </div>
    </div>
  );
}
