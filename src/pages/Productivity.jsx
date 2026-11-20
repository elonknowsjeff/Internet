import React, { useState } from "react";
import { CheckCircle2, StickyNote, CalendarDays, ListChecks, Clock, Bell, Sparkles } from "lucide-react";
import TasksColumn from "@/components/productivity/TasksColumn";
import NotesColumn from "@/components/productivity/NotesColumn";
import CalendarColumn from "@/components/productivity/CalendarColumn";
import FocusTimer from "@/components/productivity/FocusTimer";
import RemindersCard from "@/components/productivity/RemindersCard";
import TodayAgenda from "@/components/productivity/TodayAgenda";
import QuickCapture from "@/components/productivity/QuickCapture";
import ProductivityStats from "@/components/productivity/ProductivityStats";

const TABS = [
  { key: "tasks", label: "Tasks", icon: CheckCircle2 },
  { key: "notes", label: "Notes", icon: StickyNote },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
];

export default function Productivity() {
  const [tab, setTab] = useState("tasks");
  const [reloadKey, setReloadKey] = useState(0);

  const active = TABS.find((t) => t.key === tab);

  const jump = (to) => {
    if (to === "tasks") setTab("tasks");
    else if (to === "notes") setTab("notes");
    else if (to === "calendar") setTab("calendar");
  };

  const onCreated = (type) => {
    setReloadKey((k) => k + 1);
    if (type === "note") setTab("notes");
    else if (type === "task" || type === "remind") setTab("tasks");
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 sm:px-4 pb-28">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_320px]">

        {/* ---------- left sidebar ---------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-3 space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="grid h-8 w-8 place-items-center rounded-xl brand-grad text-black"><ListChecks className="h-4 w-4" /></span>
              <h1 className="text-[20px] font-extrabold tracking-[-0.02em]">Productivity</h1>
            </div>

            <nav className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              {TABS.map((t) => {
                const Icon = t.icon;
                const on = tab === t.key;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)} className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors ${on ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"}`}>
                    <Icon className={`h-4 w-4 ${on ? "text-[color:var(--brand)]" : "text-white/55"}`} />
                    <span className={`text-[13px] font-semibold ${on ? "text-white" : "text-white/65"}`}>{t.label}</span>
                    {on && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand)" }} />}
                  </button>
                );
              })}
            </nav>

            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/45"><Clock className="h-3.5 w-3.5" /> Focus</p>
              <div className="mt-2"><FocusTimer /></div>
            </div>
          </div>
        </aside>

        {/* ---------- center workspace ---------- */}
        <div className="min-w-0">
          <header className="sticky top-0 z-30 mb-3 border-b border-white/[0.08] bg-[#06060a]/85 backdrop-blur-2xl">
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-[9px] brand-grad text-black lg:hidden"><active.icon className="h-4 w-4" /></span>
              <h1 className="text-[16px] font-bold tracking-[-0.01em]">{active.label}</h1>
              <span className="ml-1 hidden items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.05] px-2 py-0.5 text-[10px] font-semibold text-white/50 sm:flex">
                <Sparkles className="h-3 w-3" style={{ color: "var(--brand)" }} /> Private to you
              </span>
            </div>
            <div className="flex gap-1 px-3 pb-2 lg:hidden">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${tab === t.key ? "brand-grad text-black" : "border border-white/10 text-white/55"}`}>
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              ))}
            </div>
          </header>

          <div className="mb-3"><QuickCapture onCreated={onCreated} /></div>
          <div className="mb-3"><ProductivityStats onJump={jump} /></div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            {tab === "tasks" && <TasksColumn reloadKey={reloadKey} />}
            {tab === "notes" && <NotesColumn key={`n-${reloadKey}`} />}
            {tab === "calendar" && <CalendarColumn />}
          </div>
        </div>

        {/* ---------- right rail ---------- */}
        <aside className="hidden xl:block">
          <div className="sticky top-3 space-y-3">
            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/45"><CalendarDays className="h-3.5 w-3.5" /> Today's agenda</p>
              <div className="mt-2"><TodayAgenda /></div>
            </section>
            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/45"><Bell className="h-3.5 w-3.5" /> Reminders</p>
              <div className="mt-2"><RemindersCard /></div>
            </section>
            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/45"><Clock className="h-3.5 w-3.5" /> Focus timer</p>
              <div className="mt-2"><FocusTimer /></div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}