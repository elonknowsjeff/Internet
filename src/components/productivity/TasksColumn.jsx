import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Plus, Trash2, Loader2, Flag, CalendarClock, Inbox } from "lucide-react";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const PRIORITY = { high: "#fb7185", medium: "#fbbf24", low: "#34d399" };
const PR_LABEL = { high: "High", medium: "Medium", low: "Low" };

const fmtDue = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const tom = new Date(now); tom.setDate(now.getDate() + 1);
  const isTom = d.toDateString() === tom.toDateString();
  const t = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (sameDay) return `Today · ${t}`;
  if (isTom) return `Tomorrow · ${t}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} · ${t}`;
};

export default function TasksColumn({ reloadKey }) {
  const [tasks, setTasks] = useState([]);
  const [done, setDone] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueAt, setDueAt] = useState("");
  const [listName, setListName] = useState("Inbox");
  const [busy, setBusy] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [openRes, doneRes] = await Promise.all([
        base44.entities.TodoTask.filter({ done: false }, { sort: "due_at", limit: 200 }),
        base44.entities.TodoTask.filter({ done: true }, { sort: "-updated_date", limit: 20 }),
      ]);
      setTasks(asItems(openRes));
      setDone(asItems(doneRes));
    } catch { setTasks([]); setDone([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [reloadKey]);

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      const rec = await base44.entities.TodoTask.create({
        title: title.trim(),
        list_name: listName.trim() || "Inbox",
        priority,
        due_at: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      setTasks((prev) => [rec, ...prev]);
      setTitle(""); setDueAt(""); setPriority("medium");
    } catch {}
    setBusy(false);
  };

  const complete = async (t) => {
    setTasks((prev) => prev.filter((x) => x.id !== t.id));
    setDone((prev) => [{ ...t, done: true }, ...prev]);
    await base44.entities.TodoTask.update(t.id, { done: true }).catch(() => {});
  };

  const remove = async (t, isOpen) => {
    if (isOpen) setTasks((prev) => prev.filter((x) => x.id !== t.id));
    else setDone((prev) => prev.filter((x) => x.id !== t.id));
    await base44.entities.TodoTask.delete(t.id).catch(() => {});
  };

  const lists = Array.from(new Set(tasks.map((t) => t.list_name || "Inbox")));

  const Card = ({ t, isOpen }) => (
    <article className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] border-b border-white/[0.05]">
      <button
        onClick={() => isOpen && complete(t)}
        disabled={!isOpen}
        title={isOpen ? "Mark done" : "Completed"}
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${isOpen ? "border-white/25 hover:border-[color:var(--brand)] hover:bg-white/10" : "border-emerald-400/60 bg-emerald-400/15"}`}
      >
        {!isOpen && <Check className="h-3 w-3 text-emerald-300" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-[14px] leading-snug ${isOpen ? "text-white/90" : "text-white/40 line-through"}`}>{t.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/45">
          <span className="flex items-center gap-1"><Flag className="h-3 w-3" style={{ color: PRIORITY[t.priority] || PRIORITY.medium }} />{PR_LABEL[t.priority] || "Medium"}</span>
          <span className="flex items-center gap-1 rounded-full bg-white/[0.06] px-1.5 py-px"><Inbox className="h-3 w-3" />{t.list_name || "Inbox"}</span>
          {t.due_at && <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />{fmtDue(t.due_at)}</span>}
        </div>
      </div>
      <button onClick={() => remove(t, isOpen)} className="shrink-0 text-white/25 opacity-0 transition group-hover:opacity-100 hover:text-rose-300">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </article>
  );

  return (
    <div className="min-w-0">
      {/* composer */}
      <form onSubmit={add} className="border-b border-white/[0.07] bg-white/[0.025] px-4 py-3">
        <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 focus-within:border-white/25">
          <Plus className="h-4 w-4 shrink-0 text-white/40" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task…"
            className="h-10 min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder-white/35"
          />
          {busy ? <Loader2 className="h-4 w-4 animate-spin text-white/50" /> : (
            <button type="submit" disabled={!title.trim()} className="shrink-0 rounded-full brand-grad px-3 py-1.5 text-[11px] font-bold text-black disabled:opacity-40">Add</button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-[11px] text-white/70 outline-none">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-[11px] text-white/70 outline-none [color-scheme:dark]" />
          <input value={listName} onChange={(e) => setListName(e.target.value)} placeholder="List" className="w-24 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-[11px] text-white/70 outline-none placeholder-white/30" />
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-white/40 text-sm"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading tasks…</div>
      ) : (
        <>
          {lists.map((list) => (
            <section key={list} className="border-b border-white/[0.05]">
              <h3 className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{list}</h3>
              {tasks.filter((t) => (t.list_name || "Inbox") === list).map((t) => <Card key={t.id} t={t} isOpen />)}
            </section>
          ))}
          {tasks.length === 0 && <p className="px-4 py-8 text-center text-[12.5px] text-white/35">Nothing open. You're clear.</p>}

          <button onClick={() => setShowDone((v) => !v)} className="mt-2 w-full px-4 py-2 text-left text-[11px] font-semibold text-white/40 hover:text-white/70">
            {showDone ? "Hide completed" : `Show completed (${done.length})`}
          </button>
          {showDone && done.length > 0 && (
            <div className="border-t border-white/[0.05]">
              {done.map((t) => <Card key={t.id} t={t} isOpen={false} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}