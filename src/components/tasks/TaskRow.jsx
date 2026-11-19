import React from "react";
import { Check, Trash2, Bell, CalendarDays } from "lucide-react";

const PRIORITY_DOT = { high: "bg-rose-400", medium: "bg-amber-300", low: "bg-emerald-400" };

const fmt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

export default function TaskRow({ task, onToggle, onDelete }) {
  const overdue = task.due_at && !task.done && new Date(task.due_at).getTime() < Date.now();
  return (
    <div className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[.06] transition-colors">
      <button
        onClick={() => onToggle(task)}
        title={task.done ? "Mark as not done" : "Mark as done"}
        className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 transition-colors ${
          task.done ? "bg-[var(--brand)] border-transparent text-black" : "border-white/30 hover:border-white/70"
        }`}
      >
        {task.done && <Check className="w-3 h-3" strokeWidth={3} />}
      </button>

      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] || "bg-white/30"}`} />

      <div className="flex-1 min-w-0">
        <p className={`text-[12.5px] leading-tight truncate ${task.done ? "text-white/35 line-through" : "text-white/90"}`}>{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/40">
          <span className="truncate">{task.list_name || "To Do"}</span>
          {task.due_at && (
            <span className={`flex items-center gap-1 ${overdue ? "text-rose-300" : ""}`}>
              <CalendarDays className="w-2.5 h-2.5" /> {fmt(task.due_at)}
            </span>
          )}
          {task.remind_at && (
            <span className="flex items-center gap-1 text-[var(--brand)]">
              <Bell className="w-2.5 h-2.5" /> {fmt(task.remind_at)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(task)}
        title="Delete task"
        className="p-1 rounded-md text-white/25 hover:text-rose-300 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}