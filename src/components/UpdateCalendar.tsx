import type { CalendarDay } from "@/types";
import { dayOfWeek, formatJstDateString, parseJstDate, toJstDateString, todayJst } from "@/lib/date";
import SectionTitle from "./ui/SectionTitle";

/** 表示する直近日数（週の区切りを揃えるため7の倍数にしている） */
const DAYS = 91;

const LEVELS = ["bg-cream-200", "bg-mint-200", "bg-mint-300", "bg-mint-400"];

function levelClass(count: number): string {
  return LEVELS[Math.min(count, LEVELS.length - 1)];
}

interface UpdateCalendarProps {
  data: CalendarDay[];
}

/** 直近の更新頻度をヒートマップで見せるカード */
export default function UpdateCalendar({ data }: UpdateCalendarProps) {
  const today = todayJst();
  const countByDate = new Map(data.map((day) => [day.date, day.count]));

  // 今日を末尾に、DAYS 日ぶんを古い順に並べる
  const end = parseJstDate(today);
  const days = Array.from({ length: DAYS }, (_, i) => {
    const date = toJstDateString(end.getTime() - (DAYS - 1 - i) * 86_400_000);
    return { date, count: countByDate.get(date) ?? 0 };
  });

  const leadingBlanks = dayOfWeek(days[0].date);
  const cells: (typeof days[number] | null)[] = [...Array(leadingBlanks).fill(null), ...days];
  const weeks = Array.from({ length: Math.ceil(cells.length / 7) }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7)
  );

  const total = days.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="card p-4">
      <SectionTitle className="mb-3" meta={`過去${DAYS}日 / ${total}件`}>
        Update Calendar
      </SectionTitle>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) =>
                day === null ? (
                  <div key={dayIndex} className="w-3 h-3" />
                ) : (
                  <div
                    key={day.date}
                    title={`${formatJstDateString(day.date)}：${day.count}件`}
                    className={`w-3 h-3 rounded-sm transition-transform hover:scale-125 ${levelClass(
                      day.count
                    )} ${day.date === today ? "ring-1 ring-mint-400 ring-offset-1" : ""}`}
                  />
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-xs text-warm-muted mr-0.5">少</span>
        {LEVELS.map((level) => (
          <div key={level} className={`w-3 h-3 rounded-sm ${level}`} />
        ))}
        <span className="text-xs text-warm-muted ml-0.5">多</span>
      </div>
    </div>
  );
}
