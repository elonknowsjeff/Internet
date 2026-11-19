import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, ListChecks, Loader2, Plus } from "lucide-react";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const PRIORITY = { high: "#fb7185", medium: "#fbbf24", low: "#34d399" };

export default function QuickTasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await base44.entities.TodoTask.filter({ done: false }, { sort: "created_date", limit: 6 });
      setTasks(asItems(res));
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      const rec = await base44.entities.TodoTask.create({ title: title.trim(), list_name: "Inbox", priority: "medium" });
      setTasks((prev) => [rec, ...prev].slice(0, 6));
      setTitle("");
    } catch {}
    setBusy(false);
  };

  const complete = async (task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    await base44.entities.TodoTask.update(task.id, { done: true }).catch(() => {});
  };

  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/45">
          <ListChecks className="h-3.5 w-3.5" /> Tasks
        </p>
        <span className="text-[11px] text-white/35">{loading ? "…" : `${tasks.length} open`}</span>
      </div>

      <form onSubmit={add} className="mt-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 focus-within:border-white/25">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add something to do"
          className="h-8 min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder-white/35"
        />
        <button type="submit" disabled={!title.trim() || busy} className="shrink-0 text-white/45 hover:text-white disabled:opacity-30">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
      </form>

      {tasks.length === 0 ? (
        !loading && <p className="mt-2 text-[11.5px] text-white/30">Nothing open — you're clear.</p>
      ) : (
        <ul className="mt-2 space-y-px">
          {tasks.slice(0, 4).map((t) => (
            <li key={t.id} className="group flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-white/[0.05]">
              <button
                onClick={() => complete(t)}
                title="Mark done"
                className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-white/25 transition-colors hover:border-[color:var(--brand)] hover:bg-white/10"
              >
                <Check className="h-2.5 w-2.5 text-transparent transition-colors group-hover:text-white" />
              </button>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: PRIORITY[t.priority] || PRIORITY.medium }} />
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-white/80">{t.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}