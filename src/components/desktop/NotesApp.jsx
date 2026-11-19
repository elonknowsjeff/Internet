import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, StickyNote, Trash2, Loader2, Check } from "lucide-react";

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selId, setSelId] = useState(null);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(true);
  const savedNote = useRef(null);

  useEffect(() => {
    base44.entities.Note.list("-created_date", 200)
      .then((r) => {
        const list = r || [];
        setNotes(list);
        if (list.length) {
          setSelId(list[0].id);
          setDraft({ title: list[0].title, body: list[0].body || "" });
          savedNote.current = list[0];
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const select = (note) => {
    setSelId(note.id);
    setDraft({ title: note.title, body: note.body || "" });
    savedNote.current = note;
    setSaved(true);
  };

  // autosave
  useEffect(() => {
    const current = savedNote.current;
    if (!current || current.id !== selId) return;
    if (current.title === draft.title && (current.body || "") === draft.body) return;
    setSaved(false);
    const t = setTimeout(async () => {
      try {
        const updated = await base44.entities.Note.update(selId, { title: draft.title || "Untitled", body: draft.body });
        savedNote.current = { ...current, ...updated };
        setNotes((prev) => prev.map((n) => (n.id === selId ? { ...n, title: draft.title || "Untitled", body: draft.body } : n)));
        setSaved(true);
      } catch {
        setSaved(false);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [draft, selId]);

  const create = async () => {
    try {
      const created = await base44.entities.Note.create({ title: "Untitled", body: "", color: "violet", pinned: false });
      setNotes((prev) => [created, ...prev]);
      select(created);
    } catch {
      // ignore
    }
  };

  const remove = async (note) => {
    if (!note) return;
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    if (selId === note.id) {
      setSelId(null);
      setDraft({ title: "", body: "" });
      savedNote.current = null;
    }
    try {
      await base44.entities.Note.delete(note.id);
    } catch {
      // ignore
    }
  };

  const filtered = notes.filter((n) =>
    (n.title + " " + (n.body || "")).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="h-full flex bg-[#0b0d13] text-white">
      <aside className="w-[190px] shrink-0 border-r border-white/10 flex flex-col bg-white/[.02]">
        <div className="p-2 flex items-center gap-1.5">
          <div className="flex-1 flex items-center gap-1.5 bg-white/[.06] border border-white/10 rounded-lg px-2 py-1">
            <Search className="w-3 h-3 text-white/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent outline-none text-[11px] placeholder:text-white/30"
            />
          </div>
          <button onClick={create} title="New note" className="w-6 h-6 rounded-lg brand-grad text-black flex items-center justify-center shrink-0">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-1.5 pb-2 space-y-0.5">
          {loading ? (
            <p className="text-[11px] text-white/35 px-2 py-3 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-[11px] text-white/30 px-2 py-3">No notes yet.</p>
          ) : (
            filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => select(n)}
                className={`w-full text-left px-2 py-1.5 rounded-lg transition ${selId === n.id ? "bg-white/12" : "hover:bg-white/[.06]"}`}
              >
                <p className="text-[11.5px] font-medium truncate">{n.title || "Untitled"}</p>
                <p className="text-[10px] text-white/35 truncate">{(n.body || "Empty note").slice(0, 40)}</p>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex-1 min-w-0 flex flex-col">
        {selId ? (
          <>
            <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 border-b border-white/10">
              <span className="text-[10px] text-white/35 flex items-center gap-1">
                {saved ? <><Check className="w-3 h-3 text-emerald-400" /> Saved</> : "Saving…"}
              </span>
              <button
                onClick={() => remove(notes.find((n) => n.id === selId))}
                className="ml-auto p-1 rounded-md text-white/30 hover:text-rose-300 hover:bg-white/10"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Note title"
              className="shrink-0 bg-transparent outline-none px-3 pt-2.5 pb-1 text-sm font-semibold placeholder:text-white/25"
            />
            <textarea
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              placeholder="Start writing…"
              className="flex-1 min-h-0 bg-transparent outline-none px-3 py-2 text-[12px] leading-relaxed placeholder:text-white/25 resize-none"
            />
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-white/35">
            <StickyNote className="w-7 h-7" />
            <p className="text-[11.5px]">Select a note or create a new one.</p>
            <button onClick={create} className="mt-1 px-3 py-1.5 rounded-full brand-grad text-black text-[11px] font-bold">New note</button>
          </div>
        )}
      </section>
    </div>
  );
}