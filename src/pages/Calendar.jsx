import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Loader2, Clock, MapPin, CalendarDays } from "lucide-react";
import MonthGrid, { eventTint } from "@/components/calendar/MonthGrid";
import EventDialog from "@/components/calendar/EventDialog";

export default function Calendar() {
  const [month, setMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);

  const load = useCallback(async (m) => {
    setLoading(true);
    const from = startOfWeek(startOfMonth(m), { weekStartsOn: 1 });
    const to = endOfWeek(endOfMonth(m), { weekStartsOn: 1 });
    try {
      const res = await base44.entities.CalendarEvent.filter(
        { start: { $gte: from.toISOString(), $lte: to.toISOString() } },
        { sort: "start", limit: 300 }
      );
      setEvents(res?.items || res || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(month); }, [month, load]);

  const upcoming = events
    .filter((e) => e.start && new Date(e.start) >= new Date(Date.now() - 12 * 3600 * 1000))
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 6);

  return (
    <div className="px-4 py-5 pb-28">
      <header className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-300">Enterprise productivity</p>
          <h1 className="text-2xl sm:text-3xl font-black font-display flex items-center gap-2 mt-1">
            <CalendarDays className="w-6 h-6 text-cyan-300" /> Calendar
          </h1>
          <p className="text-sm text-neutral-400 mt-1">Your schedule, private to your account.</p>
        </div>
        <button
          onClick={() => setDialog({ defaultDate: new Date() })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-400 to-cyan-400 text-black text-sm font-bold shadow-lg shadow-fuchsia-500/20"
        >
          <Plus className="w-4 h-4" /> New event
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setMonth(subMonths(month, 1))} className="w-9 h-9 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold min-w-[160px] text-center">{format(month, "MMMM yyyy")}</h2>
            <button onClick={() => setMonth(addMonths(month, 1))} className="w-9 h-9 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setMonth(new Date())} className="ml-1 px-3 py-2 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5">
              Today
            </button>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-neutral-500 ml-auto" />}
          </div>

          <MonthGrid
            month={month}
            events={events}
            onDayClick={(day) => setDialog({ defaultDate: day })}
            onEventClick={(event) => setDialog({ event })}
          />
        </section>

        <aside className="rounded-2xl border border-white/10 bg-black/30 p-4 h-fit">
          <h3 className="text-sm font-bold mb-3">Up next</h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-neutral-500">Nothing scheduled — tap any day to add an event.</p>
          ) : (
            <div className="space-y-2.5">
              {upcoming.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setDialog({ event: e })}
                  className="w-full text-left rounded-xl border border-white/10 bg-white/[.03] p-3 hover:bg-white/[.07]"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${eventTint(e.color).split(" ")[0].replace("/25", "")}`} />
                    <p className="text-sm font-semibold truncate flex-1">{e.title}</p>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(e.start), "EEE d MMM")} · {e.all_day ? "All day" : format(new Date(e.start), "HH:mm")}
                  </p>
                  {e.location && (
                    <p className="text-[11px] text-neutral-500 mt-0.5 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {e.location}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>

      {dialog && (
        <EventDialog
          initial={dialog.event}
          defaultDate={dialog.defaultDate}
          onClose={() => setDialog(null)}
          onSaved={() => { setDialog(null); load(month); }}
        />
      )}
    </div>
  );
}