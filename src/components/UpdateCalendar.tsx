import type { CalendarDay } from "@/types";

interface UpdateCalendarProps {
  data: CalendarDay[];
}

function getIntensity(count: number): string {
  if (count === 0) return "bg-cream-200";
  if (count === 1) return "bg-mint-200";
  if (count === 2) return "bg-mint-300";
  return "bg-mint-400";
}

export default function UpdateCalendar({ data }: UpdateCalendarProps) {
  const today = new Date().toLocaleDateString("sv", { timeZone: "Asia/Tokyo" });

  const weeks: (CalendarDay | null)[][] = [];
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const dataMap = Object.fromEntries(sortedData.map((d) => [d.date, d]));

  const endDate = new Date(`${today}T00:00:00Z`);
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 90);

  const days: CalendarDay[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    days.push(dataMap[dateStr] ?? { date: dateStr, count: 0, categories: [] });
  }

  const firstDayOfWeek = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const paddedDays: (CalendarDay | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...days,
  ];

  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  return (
    <div className="card p-4">
      <div className="section-title mb-3">
        <span>Update Calendar</span>
        <span className="font-normal normal-case text-warm-muted">過去90日</span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => {
                if (!day) {
                  return <div key={di} className="w-3 h-3" />;
                }
                const isToday = day.date === today;
                return (
                  <div
                    key={di}
                    title={`${day.date}: ${day.count}件`}
                    className={`w-3 h-3 rounded-sm transition-transform hover:scale-125 cursor-default
                      ${getIntensity(day.count)}
                      ${isToday ? "ring-1 ring-mint-400 ring-offset-1" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-warm-muted">少</span>
        {["bg-cream-200", "bg-mint-200", "bg-mint-300", "bg-mint-400"].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-xs text-warm-muted">多</span>
      </div>
    </div>
  );
}
