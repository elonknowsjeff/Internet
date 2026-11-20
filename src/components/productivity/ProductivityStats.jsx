import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ListChecks, CheckCircle2, StickyNote, CalendarDays, Loader2 } from "lucide-react";

const todayRange = () => {
  const s = new Date(); s.setHours(0, 0, 0, 0);
  const e = new Date(s); e.setDate(e.getDate() + 1);
  return { $gte: s.toISOString(), $lt: e.toISOString() };
};

export default function ProductivityStats({ onJump }) {
  const [open, setOpen] = useState(null);
  const [done, setDone] = useState(null);
  const [notes, setNotes] = useState(null);
  const [events, setEvents] = useState(null);

  useEffect(() => {
    const range = todayRange();
    Promise.all([
      base44.entities.TodoTask.count({ done: false }).catch(() => 0),
      base44.entities.TodoTask.count({ done: true }).catch(() => 0),
      base44.entities.Note.count({}).catch(() => 0),
      base44.entities.CalendarEvent.count({ start: range }).catch(() => 0),
    ]).then(([o, d, n, e]) => {
      setOpen(o); setDone(d); setNotes(n); setEvents(e);
    });
  }, []);

  const tiles = [
    { key: "tasks", icon: ListChecks, label: "Open tasks", value: open, tint: "var(--brand)", to: "tasks" },
    { key: "done", icon: CheckCircle2, label: "Completed", value: done, tint: "#34d399", to: "tasks" },
    { key: "notes", icon: StickyNote, label: "Notes", value: notes, tint: "#fbbf24", to: "notes" },
    { key: "events", icon: CalendarDays, label: "Today", value: events, tint: "#a78bfa", to: "calendar" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {tiles.map((t) => {
        const Icon = t.icon;
        const loading = t.value === null;
        return (
          <button
            key={t.key}
            onClick={() => onJump?.(t.to)}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 30px -24px rgba(0,0,0,0.9)" }}
          >
            <span className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-[0.12] blur-xl transition-opacity group-hover:opacity-25" style={{ background: t.tint }} />
            <span className="relative flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" style={{ color: t.tint }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">{t.label}</span>
            </span>
            <p className="relative mt-1.5 font-display text-[26px] font-extrabold leading-none tabular-nums">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-white/40" /> : t.value}
            </p>
          </button>
        );
      })}
    </div>
  );
}