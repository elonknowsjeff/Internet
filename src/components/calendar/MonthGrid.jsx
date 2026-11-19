import React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const tint = {
  violet: "bg-violet-500/25 border-violet-400/60 text-violet-100",
  sky: "bg-sky-500/25 border-sky-400/60 text-sky-100",
  emerald: "bg-emerald-500/25 border-emerald-400/60 text-emerald-100",
  amber: "bg-amber-500/25 border-amber-400/60 text-amber-100",
  rose: "bg-rose-500/25 border-rose-400/60 text-rose-100",
};

export const eventTint = (color) => tint[color] || tint.violet;

export default function MonthGrid({ month, events, onDayClick, onEventClick }) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const eventsOn = (day) =>
    events
      .filter((e) => e.start && isSameDay(new Date(e.start), day))
      .sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/30">
      <div className="grid grid-cols-7 border-b border-white/10 bg-white/[.03]">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = eventsOn(day);
          const outside = !isSameMonth(day, month);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`text-left min-h-[92px] sm:min-h-[112px] border-b border-r border-white/[.07] p-1.5 transition hover:bg-white/[.05] ${outside ? "opacity-40" : ""}`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                  isToday(day) ? "bg-gradient-to-br from-fuchsia-400 to-cyan-400 text-black" : "text-neutral-300"
                }`}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map((e) => (
                  <span
                    key={e.id}
                    role="button"
                    tabIndex={0}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEventClick(e);
                    }}
                    className={`block truncate rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${eventTint(e.color)}`}
                  >
                    {e.all_day ? "" : `${format(new Date(e.start), "HH:mm")} `}
                    {e.title}
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="block px-1.5 text-[10px] text-neutral-400">+{dayEvents.length - 2} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}