import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { StickyNote, Loader2 } from "lucide-react";
import NoteList from "@/components/notes/NoteList";
import NoteEditor from "@/components/notes/NoteEditor";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const rows = await base44.entities.Note.list("-created_date", 200);
      setNotes(rows);
      if (!activeId && rows[0]) { setActiveId(rows[0].id); setDraft({ ...rows[0] }); }
    } catch (e) { setNotes([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const select = (id) => {
    const n = notes.find((x) => x.id === id);
    setActiveId(id);
    setDraft(n ? { ...n } : null);
  };

  const create = async () => {
    const rec = await base44.entities.Note.create({ title: "Untitled note", body: "", color: "violet" });
    await load();
    setActiveId(rec.id);
    setDraft({ ...rec });
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    await base44.entities.Note.update(draft.id, { title: draft.title, body: draft.body, color: draft.color, pinned: !!draft.pinned });
    await load();
    setSaving(false);
  };

  const remove = async () => {
    if (!draft || !confirm("Delete this note?")) return;
    await base44.entities.Note.delete(draft.id);
    setActiveId(null); setDraft(null);
    await load();
  };

  const stored = activeId ? notes.find((n) => n.id === activeId) : null;
  const dirty = !!draft && !!stored && (draft.title !== stored.title || draft.body !== stored.body || draft.color !== stored.color || !!draft.pinned !== !!stored.pinned);

  const filtered = notes
    .filter((n) => !query.trim() || (n.title + " " + (n.body || "")).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-28 sm:pb-8">
      <header className="py-4">
        <h1 className="text-2xl font-black font-display flex items-center gap-2"><StickyNote className="w-6 h-6 text-amber-300" /> Notes</h1>
        <p className="text-sm text-neutral-400">Pin ideas, draft posts, keep lists — saved to your account.</p>
      </header>
      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400 py-10"><Loader2 className="w-4 h-4 animate-spin" /> Loading notes…</div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <NoteList notes={filtered} activeId={activeId} query={query} onQuery={setQuery} onSelect={select} onCreate={create} />
          <NoteEditor note={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} onSave={save} onDelete={remove} saving={saving} dirty={dirty} />
        </div>
      )}
    </div>
  );
}