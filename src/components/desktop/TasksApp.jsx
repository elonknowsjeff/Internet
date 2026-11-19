import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, BellRing, X, ListChecks, Loader2 } from "lucide-react";
import { playChime } from "@/lib/chime";
import TaskRow from "@/components/tasks/TaskRow";

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "today", label: "Today" },
  { key: "done", label: "Done" },
];

const inputCls =
  "bg-white/[.06] border border-white/12 rounded-lg px-2.5 py-1.5 text-[12px] outline-none focus:border-[var(--brand)] text-white placeholder:text-white/30";

export default function TasksApp() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("todo");
  const [filter, setFilter] = useState("open");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [due, setDue] = useState("");
  const [remind, setRemind] = useState("");
  const [fired, setFired] = useState(null);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  useEffect(() => {
    base44.entities.TodoTask.list("-created_date", 200)
      .then((r) => setTasks(r || []))
      .finally(() => setLoading(false));
  }, []);

  // reminder sweep — fires the chime once per reminder
  useEffect(() => {
    const check = async () => {
      const now = Date.now();
      const hit = tasksRef.current.filter(
        (t) => !t.done && !t.reminded && t.remind_at && new Date(t.remind_at).getTime() <= now
      );
      if (!hit.length) return;
      playChime();
      setFired(hit[0]);
      setTasks((prev) => prev.map((t) => (hit.some((h) => h.id === t.id) ? { ...t, reminded: true } : t)));
      try {
        await base44.entities.TodoTask.bulkUpdate(hit.map((h) => ({ id: h.id, reminded: true })));
      } catch {
        // keep the local state change even if the write fails
      }
    };
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!fired) return;
    const t = setTimeout(() => setFired(null), 9000);
    return () => clearTimeout(t);
  }, [fired]);

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      list_name: "To Do",
      priority,
      done: false,
      reminded: false,
    };
    if (due) payload.due_at = new Date(due).toISOString();
    if (remind) payload.remind_at = new Date(remind).toISOString();
    try {
      const created = await base44.entities.TodoTask.create(payload);
      setTasks((prev) => [created, ...prev]);
      setTitle("");
      setDue("");
      setRemind("");
    } catch (err) {
      setTitle("");
    }
  };

  const toggle = async (task) => {
    const done = !task.done;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done } : t)));
    try {
      await base44.entities.TodoTask.update(task.id, { done });
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: task.done } : t)));
    }
  };

  const remove = async (task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await base44.entities.TodoTask.delete(task.id);
    } catch {
      setTasks((prev) => [task, ...prev]);
    }
  };

  const open = tasks.filter((t) => !t.done);
  const todays = open.filter((t) => t.due_at && new Date(t.due_at).toDateString() === new Date().toDateString());
  const done = tasks.filter((t) => t.done);
  const reminders = open
    .filter((t) => t.remind_at)
    .sort((a, b) => new Date(a.remind_at) - new Date(b.remind_at));

  const list =
    tab === "reminders"
      ? reminders
      : filter === "done"
        ? done
        : filter === "today"
          ? todays
          : open;

  const counts = { open: open.length, today: todays.length, done: done.length };

  return (
    <div className="relative h-full flex flex-col bg-[#0b0d13] text-white">
      {/* header */}
      <div className="shrink-0 px-3 pt-2.5 pb-2 border-b border-white/10 bg-white/[.03]">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4" style={{ color: "var(--brand)" }} />
          <h2 className="text-sm font-semibold">To Do</h2>
          <span className="text-[10px] text-white/40">{open.length} open</span>
          <div className="ml-auto flex items-center gap-1 bg-white/[.06] border border-white/10 rounded-full p-0.5">
            {["todo", "reminders"].map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold capitalize transition ${tab === k ? "brand-grad text-black" : "text-white/55 hover:text-white"}`}
              >
                {k === "todo" ? "Tasks" : "Reminders"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* add bar */}
      <form onSubmit={add} className="shrink-0 px-3 py-2 border-b border-white/10 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task…"
            className={`${inputCls} flex-1`}
          />
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-7 h-7 rounded-lg brand-grad text-black flex items-center justify-center disabled:opacity-35 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputCls}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} className={inputCls} title="Due date" />
          <input type="datetime-local" value={remind} onChange={(e) => setRemind(e.target.value)} className={inputCls} title="Remind me" />
        </div>
      </form>

      {/* filter row */}
      {tab === "todo" && (
        <div className="shrink-0 flex items-center gap-1 px-3 py-1.5 border-b border-white/[.07]">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium ${filter === f.key ? "bg-white/15 text-white" : "text-white/45 hover:text-white/80"}`}
            >
              {f.label} <span className="text-white/30">{counts[f.key]}</span>
            </button>
          ))}
        </div>
      )}

      {/* list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-1.5 py-1.5">
        {loading ? (
          <div className="h-full flex items-center justify-center text-white/40 text-[11px] gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading tasks…
          </div>
        ) : list.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-1 text-white/35 text-center px-6">
            <ListChecks className="w-6 h-6" />
            <p className="text-[11.5px]">
              {tab === "reminders" ? "No reminders set. Add a time when creating a task." : "Nothing here. Add your first task above."}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {list.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggle} onDelete={remove} />
            ))}
          </div>
        )}
      </div>

      {/* reminder alert */}
      {fired && (
        <div className="absolute left-3 right-3 bottom-3 z-20 rounded-xl gloss-strong px-3 py-2.5 flex items-center gap-2.5 animate-slide-up">
          <span className="w-8 h-8 rounded-full brand-grad text-black flex items-center justify-center shrink-0">
            <BellRing className="w-4 h-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-white/45">Reminder</p>
            <p className="text-[12.5px] font-semibold truncate">{fired.title}</p>
          </div>
          <button onClick={() => setFired(null)} className="p-1 rounded-md hover:bg-white/10 text-white/50">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}