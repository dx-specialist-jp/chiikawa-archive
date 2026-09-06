/**
 * 日付ユーティリティ。
 *
 * このサイトが扱う日付はすべて JST（ちいかわ公式Xの投稿タイムゾーン）基準で、
 * ビルドサーバーや閲覧者の端末のタイムゾーンに結果が左右されてはいけない。
 * そのため日付の生成・整形は必ずここを経由する。
 */

export const JST = "Asia/Tokyo";

/** ISO文字列 / Date を JST の `YYYY-MM-DD` に変換する */
export function toJstDateString(value: string | number | Date = new Date()): string {
  return new Date(value).toLocaleDateString("sv", { timeZone: JST });
}

/** 今日（JST）の `YYYY-MM-DD` */
export function todayJst(): string {
  return toJstDateString();
}

/** `YYYY-MM-DD` を JST 午前0時の Date として解釈する（実行環境のTZに依存しない） */
export function parseJstDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+09:00`);
}

/** `YYYY-MM-DD` の曜日（0=日曜）。実行環境のTZに影響されないよう UTC として解釈する。 */
export function dayOfWeek(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

/** `YYYY-MM` に月を加減する */
export function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

const FORMATS = {
  /** 2026年9月5日 */
  longDate: { year: "numeric", month: "long", day: "numeric" },
  /** 2026年9月5日 10:24 */
  longDateTime: { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" },
  /** 2026年9月5日（短縮月） */
  shortDate: { year: "numeric", month: "short", day: "numeric" },
  /** 2026年9月5日 10:24（短縮月） */
  shortDateTime: { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
  /** 9月5日 10:24 */
  monthDayTime: { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
  /** 2026年9月 */
  yearMonth: { year: "numeric", month: "long" },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateFormat = keyof typeof FORMATS;

/** JST 基準で日本語ロケール整形する */
export function formatJst(value: string | number | Date, format: DateFormat): string {
  return new Date(value).toLocaleDateString("ja-JP", { ...FORMATS[format], timeZone: JST });
}

/** `YYYY-MM-DD`（JST日付）を整形する */
export function formatJstDateString(dateStr: string, format: DateFormat = "longDate"): string {
  return formatJst(parseJstDate(dateStr), format);
}
