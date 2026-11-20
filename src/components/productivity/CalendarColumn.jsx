import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Loader2, Clock, MapPin, CalendarDays } from "lucide-react";
import MonthGrid, { eventTint } from "@/components/calendar/MonthGrid";
import EventDialog from "@/components/calendar/EventDialog";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

export default function CalendarColumn() {
  const [month, setMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [view, setView] = useState("agenda");

  const load = useCallback(async (m) => {
    setLoading(true);
    const from = startOfWeek(startOfMonth(m), { weekStartsOn: 1 });
    const to = endOfWeek(endOfMonth(m), { weekStartsOn: 1 });
    try {
      const res = await base44.entities.CalendarEvent.filter(
        { start: { $gte: from.toISOString(), $lte: to.toISOString() } },
        { sort: "start", limit: 300 }
      );
      setEvents(asItems(res));
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(month); }, [month, load]);

  const upcoming = events
    .filter((e) => e.start && new Date(e.start) >= new Date(Date.now() - 12 * 3600 * 1000))
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  const today = new Date();
  const todayEvents = events.filter((e) => e.start && isSameDay(new Date(e.start), today));

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2.5">
        <button onClick={() => setMonth(subMonths(month, 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.06]"><ChevronLeft className="h-4 w-4" /></button>
        <h2 className="min-w-[150px] text-center text-[14px] font-bold">{format(month, "MMMM yyyy")}</h2>
        <button onClick={() => setMonth(addMonths(month, 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.06]"><ChevronRight className="h-4 w-4" /></button>
        <button onClick={() => setMonth(new Date())} className="rounded-full border border-white/12 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/[0.05]">Today</button>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] p-0.5">
          <button onClick={() => setView("agenda")} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${view === "agenda" ? "brand-grad text-black" : "text-white/50"}`}>Agenda</button>
          <button onClick={() => setView("month")} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${view === "month" ? "brand-grad text-black" : "text-white/50"}`}>Month</button>
        </div>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-white/40" />}
      </div>

      {view === "month" ? (
        <div className="p-3">
          <MonthGrid month={month} events={events} onDayClick={(day) => setDialog({ defaultDate: day })} onEventClick={(event) => setDialog({ event })} />
        </div>
      ) : (
        <div className="px-3 py-2">
          {upcoming.length === 0 ? (
            <button onClick={() => setDialog({ defaultDate: new Date() })} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-10 text-[13px] text-white/45 hover:bg-white/[0.03]">
              <Plus className="h-4 w-4" /> Nothing scheduled — add an event
            </button>
          ) : (
            <ul>
              {upcoming.map((e) => (
                <li key={e.id}>
                  <button onClick={() => setDialog({ event: e })} className="flex w-full items-start gap-3 border-b border-white/[0.05] px-1 py-3 text-left hover:bg-white/[0.03]">
                    <span className="w-[58px] shrink-0 rounded-lg border border-white/10 bg-white/[0.05] py-1.5 text-center">
                      <span className="block text-[10px] uppercase text-white/45">{format(new Date(e.start), "EEE")}</span>
                      <span className={`block text-[16px] font-bold leading-none ${isToday(new Date(e.start)) ? "text-[color:var(--brand)]" : "text-white/85"}`}>{format(new Date(e.start), "d")}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${eventTint(e.color).split(" ")[0].replace("/25", "/70")}`} />
                        <p className="truncate text-[14px] font-semibold">{e.title}</p>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/45">
                        <Clock className="h-3 w-3" /> {e.all_day ? "All day" : format(new Date(e.start), "MMM d · HH:mm")}
                      </p>
                      {e.location && <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-white/35"><MapPin className="h-3 w-3" /> {e.location}</p>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="px-4 py-3">
        <button onClick={() => setDialog({ defaultDate: new Date() })} className="flex w-full items-center justify-center gap-2 rounded-full brand-grad py-2.5 text-[13px] font-bold text-black">
          <Plus className="h-4 w-4" /> New event
        </button>
      </div>

      {dialog && (
        <EventDialog initial={dialog.event} defaultDate={dialog.defaultDate} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); load(month); }} />
      )}
    </div>
  );
}