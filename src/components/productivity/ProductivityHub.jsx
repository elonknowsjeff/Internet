import React, { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import FocusTimer from "@/components/productivity/FocusTimer";
import QuickTasks from "@/components/productivity/QuickTasks";
import TodayAgenda from "@/components/productivity/TodayAgenda";
import RemindersCard from "@/components/productivity/RemindersCard";

export default function ProductivityHub() {
  const [open, setOpen] = useState(() => localStorage.getItem("laxin_hub_open") !== "0");

  const toggle = () =>
    setOpen((v) => {
      localStorage.setItem("laxin_hub_open", v ? "0" : "1");
      return !v;
    });

  return (
    <section className="px-3 pt-3 sm:px-4">
      <div className="panel rounded-2xl p-2.5">
        <div className="mb-2 flex items-center justify-between px-0.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            <Sparkles className="h-3 w-3" /> Today
          </p>
          <button
            onClick={toggle}
            className="flex h-6 items-center gap-1 rounded-full px-2 text-[10.5px] font-semibold text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            {open ? "Hide" : "Show"}
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>

        <FocusTimer />

        {open && (
          <div className="mt-2 grid gap-2 animate-fade-in sm:grid-cols-2">
            <QuickTasks />
            <RemindersCard />
            <div className="sm:col-span-2">
              <TodayAgenda />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}