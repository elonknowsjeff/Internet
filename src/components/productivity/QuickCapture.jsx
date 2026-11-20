import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Loader2, CheckSquare, StickyNote, Bell, Command } from "lucide-react";
import { playSound } from "@/lib/chime";

const TYPES = [
  { key: "task", label: "Task", icon: CheckSquare },
  { key: "note", label: "Note", icon: StickyNote },
  { key: "remind", label: "Reminder", icon: Bell },
];

export default function QuickCapture({ onCreated }) {
  const [type, setType] = useState("task");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const text = value.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      if (type === "task") {
        await base44.entities.TodoTask.create({ title: text, priority: "medium", list_name: "Inbox" });
      } else if (type === "note") {
        await base44.entities.Note.create({ title: text, body: "", color: "violet" });
      } else {
        await base44.entities.TodoTask.create({
          title: text,
          list_name: "Reminders",
          priority: "high",
          remind_at: new Date(Date.now() + 15 * 60000).toISOString(),
          reminded: false,
        });
        playSound("notification");
      }
      setValue("");
      onCreated?.(type);
    } catch {}
    setBusy(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 neon-edge-soft">
      <div className="flex items-center gap-1.5">
        {TYPES.map((t) => {
          const Icon = t.icon;
          const on = type === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                on ? "brand-grad text-black" : "border border-white/10 text-white/55 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>
      <form onSubmit={submit} className="mt-2.5 flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 focus-within:border-white/30 transition-colors">
        <Plus className="h-4 w-4 shrink-0 text-white/40" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            type === "task" ? "Quick add a task…" :
            type === "note" ? "Jot a note…" :
            "Remind me to… (in 15 min)"
          }
          className="h-11 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder-white/35"
        />
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin text-white/50" />
        ) : (
          <button type="submit" disabled={!value.trim()} className="shrink-0 rounded-full brand-grad px-4 py-1.5 text-[12px] font-bold text-black disabled:opacity-40">
            Add
          </button>
        )}
      </form>
      <p className="mt-2 flex items-center gap-1 text-[10.5px] text-white/35">
        <Command className="h-3 w-3" /> Capture anything in seconds — it lands in the right spot.
      </p>
    </div>
  );
}