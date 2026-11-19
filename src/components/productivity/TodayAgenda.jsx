import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CalendarDays, ChevronRight } from "lucide-react";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

export default function TodayAgenda() {
  const [events, setEvents] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    base44.entities.CalendarEvent
      .filter({ start: { $gte: start.toISOString(), $lt: end.toISOString() } }, { sort: "start", limit: 20 })
      .then((res) => {
        const items = asItems(res);
        setCount(items.length);
        const now = new Date();
        const upcoming = items.filter((e) => new Date(e.start) >= now);
        setEvents((upcoming.length ? upcoming : items).slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const timeOf = (iso) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/45">
          <CalendarDays className="h-3.5 w-3.5" /> Agenda
        </p>
        <span className="text-[11px] text-white/35">
          {new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </div>

      {events.length === 0 ? (
        <Link to="/calendar" className="mt-2 flex items-center justify-between rounded-lg bg-white/[0.04] px-2.5 py-2 text-[12px] text-white/50 hover:bg-white/[0.08] hover:text-white">
          Nothing scheduled <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <ul className="mt-2 space-y-px">
          {events.map((e) => (
            <li key={e.id}>
              <Link to="/calendar" className="group flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-white/[0.05]">
                <span className="w-[52px] shrink-0 rounded-md border border-white/10 bg-white/[0.06] py-0.5 text-center text-[10px] font-semibold tabular-nums text-white/65">
                  {timeOf(e.start)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-white/80 group-hover:text-white">{e.title}</span>
                <ChevronRight className="h-3 w-3 shrink-0 text-white/20 group-hover:text-white/60" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {count > events.length && (
        <Link to="/calendar" className="mt-1 block text-[10.5px] font-semibold text-white/40 hover:text-white">
          +{count - events.length} more today
        </Link>
      )}
    </div>
  );
}