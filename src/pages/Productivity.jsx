import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ListChecks, StickyNote, CalendarDays, Bell, Clock, Wrench, Calculator,
  Table, FileText, Presentation, Cloud as CloudIcon, ArrowUpRight, Sparkles,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import TasksColumn from "@/components/productivity/TasksColumn";
import NotesColumn from "@/components/productivity/NotesColumn";
import CalendarColumn from "@/components/productivity/CalendarColumn";
import FocusTimer from "@/components/productivity/FocusTimer";
import RemindersCard from "@/components/productivity/RemindersCard";
import TodayAgenda from "@/components/productivity/TodayAgenda";
import QuickCapture from "@/components/productivity/QuickCapture";
import ProductivityStats from "@/components/productivity/ProductivityStats";

const TOOLS = [
  { to: "/calculator", label: "Calculator", Icon: Calculator },
  { to: "/sheets", label: "Sheets", Icon: Table },
  { to: "/docs", label: "Docs", Icon: FileText },
  { to: "/slides", label: "Slides", Icon: Presentation },
  { to: "/cloud", label: "Cloud files", Icon: CloudIcon },
  { to: "/notes", label: "Notes", Icon: StickyNote },
  { to: "/calendar", label: "Calendar", Icon: CalendarDays },
];

function Section({ title, icon: Icon, children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] ${className}`}>
      <header className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} /> {title}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

export default function Productivity() {
  const [reloadKey, setReloadKey] = useState(0);
  const onCreated = () => setReloadKey((k) => k + 1);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 sm:px-4 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 -mx-3 sm:-mx-4 mb-4 border-b border-white/[0.08] bg-[#06060a]/85 px-3 sm:px-4 py-3 backdrop-blur-2xl">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={30} />
          <div className="leading-tight">
            <h1 className="text-[18px] font-extrabold tracking-[-0.01em]">Productivity</h1>
            <p className="text-[11px] text-white/45">Tasks, notes, calendar and tools in one scroll</p>
          </div>
          <span className="ml-auto hidden items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-white/50 sm:flex">
            <Sparkles className="h-3 w-3" style={{ color: "var(--brand)" }} /> Private to you
          </span>
        </div>
      </header>

      {/* Quick capture + stats */}
      <div className="mb-4"><QuickCapture onCreated={onCreated} /></div>
      <div className="mb-4"><ProductivityStats onJump={() => {}} /></div>

      {/* One scrollable stack: everything visible, no tabs */}
      <div className="space-y-4">
        <Section title="Tasks" icon={ListChecks}><TasksColumn reloadKey={reloadKey} /></Section>
        <Section title="Notes" icon={StickyNote}><NotesColumn key={`n-${reloadKey}`} /></Section>
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Calendar" icon={CalendarDays}><CalendarColumn /></Section>
          <Section title="Today's agenda" icon={CalendarDays}><TodayAgenda /></Section>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Reminders" icon={Bell}><RemindersCard /></Section>
          <Section title="Focus timer" icon={Clock}><FocusTimer /></Section>
        </div>

        {/* Tools — quick launch, same scroll */}
        <Section title="Tools" icon={Wrench}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {TOOLS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-3 text-center transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--brand) 14%, transparent)" }}>
                  <t.Icon className="h-4 w-4" style={{ color: "var(--brand)" }} />
                </span>
                <span className="text-[10.5px] font-medium text-white/70">{t.label}</span>
                <ArrowUpRight className="h-3 w-3 text-white/25 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}