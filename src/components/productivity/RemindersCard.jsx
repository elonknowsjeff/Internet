import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Plus, Trash2, Loader2 } from "lucide-react";
import { playSound } from "@/lib/chime";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const QUICK = [
  { label: "5 min", mins: 5 },
  { label: "15 min", mins: 15 },
  { label: "1 hr", mins: 60 },
];

const timeOf = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";

const inWords = (iso) => {
  const diff = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diff / 60000);
  if (mins <= 0) return "now";
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.round(mins / 60);
  return hrs < 24 ? `in ${hrs}h` : `in ${Math.round(hrs / 24)}d`;
};

export default function RemindersCard() {
  const [title, setTitle] = useState("");
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await base44.entities.TodoTask.filter({ done: false }, { sort: "remind_at", limit: 20 });
      const upcoming = asItems(res)
        .filter((t) => t.remind_at && new Date(t.remind_at).getTime() > Date.now() - 60000)
        .sort((a, b) => new Date(a.remind_at) - new Date(b.remind_at));
      setItems(upcoming.slice(0, 3));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (mins) => {
    if (busy) return;
    setBusy(true);
    try {
      await base44.entities.TodoTask.create({
        title: title.trim() || "Reminder",
        list_name: "Reminders",
        priority: "high",
        remind_at: new Date(Date.now() + mins * 60000).toISOString(),
        reminded: false,
      });
      setTitle("");
      playSound("notification");
      load();
    } catch {}
    setBusy(false);
  };

  const remove = async (id) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    await base44.entities.TodoTask.update(id, { done: true }).catch(() => {});
  };

  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/45">
          <Bell className="h-3.5 w-3.5" /> Reminders
        </p>
        <span className="text-[11px] text-white/35">{loading ? "…" : `${items.length} set`}</span>
      </div>

      <div className="mt-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Remind me to…"
          className="h-8 min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder-white/35"
        />
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white/50" /> : <Plus className="h-3.5 w-3.5 text-white/35" />}
      </div>

      <div className="mt-1.5 flex gap-1">
        {QUICK.map((q) => (
          <button
            key={q.label}
            onClick={() => add(q.mins)}
            disabled={busy}
            className="flex-1 rounded-full border border-white/10 py-1 text-[11px] font-semibold text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
          >
            {q.label}
          </button>
        ))}
      </div>

      {items.length > 0 && (
        <ul className="mt-2 space-y-1">
          {items.map((t) => (
            <li key={t.id} className="flex items-center gap-2 text-[12px]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--brand)" }} />
              <span className="min-w-0 flex-1 truncate text-white/75">{t.title}</span>
              <span className="shrink-0 text-[10.5px] tabular-nums text-white/40">{timeOf(t.remind_at)} · {inWords(t.remind_at)}</span>
              <button onClick={() => remove(t.id)} title="Clear" className="shrink-0 text-white/30 hover:text-rose-300">
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}