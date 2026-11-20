import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Plus, Pin, Trash2, Check, Loader2, ArrowLeft, Palette } from "lucide-react";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const DOT = { violet: "bg-violet-400", sky: "bg-sky-400", emerald: "bg-emerald-400", amber: "bg-amber-400", rose: "bg-rose-400" };
const COLORS = ["violet", "sky", "emerald", "amber", "rose"];
const SWATCH = { violet: "bg-violet-400", sky: "bg-sky-400", emerald: "bg-emerald-400", amber: "bg-amber-400", rose: "bg-rose-400" };

export default function NotesColumn() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const rows = asItems(await base44.entities.Note.list("-created_date", 200));
      setNotes(rows);
    } catch { setNotes([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const stored = active ? notes.find((n) => n.id === active) : null;
  const dirty = !!draft && !!stored && (draft.title !== stored.title || draft.body !== stored.body || draft.color !== stored.color || !!draft.pinned !== !!stored.pinned);

  const create = async () => {
    const rec = await base44.entities.Note.create({ title: "Untitled note", body: "", color: "violet" });
    setNotes((p) => [rec, ...p]);
    setActive(rec.id); setDraft({ ...rec });
  };

  const open = (n) => { setActive(n.id); setDraft({ ...n }); };

  const back = async () => {
    if (dirty && draft) {
      setSaving(true);
      await base44.entities.Note.update(draft.id, { title: draft.title, body: draft.body, color: draft.color, pinned: !!draft.pinned }).catch(() => {});
      setSaving(false);
      setNotes((p) => p.map((n) => (n.id === draft.id ? { ...draft } : n)));
    }
    setActive(null); setDraft(null);
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    await base44.entities.Note.update(draft.id, { title: draft.title, body: draft.body, color: draft.color, pinned: !!draft.pinned });
    setNotes((p) => p.map((n) => (n.id === draft.id ? { ...draft } : n)));
    setSaving(false);
  };

  const remove = async () => {
    if (!draft || !confirm("Delete this note?")) return;
    await base44.entities.Note.delete(draft.id);
    setNotes((p) => p.filter((n) => n.id !== draft.id));
    setActive(null); setDraft(null);
  };

  const filtered = notes
    .filter((n) => !query.trim() || (n.title + " " + (n.body || "")).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  // ---- editor view ----
  if (active && draft) {
    return (
      <div className="flex min-h-[60vh] flex-col">
        <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2">
          <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.06]"><ArrowLeft className="h-4 w-4" /></button>
          <span className="flex items-center gap-1.5 text-[12px] text-white/45">
            <span className={`h-2 w-2 rounded-full ${DOT[draft.color] || DOT.violet}`} /> Note
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setDraft((d) => ({ ...d, pinned: !d.pinned }))} className={`grid h-9 w-9 place-items-center rounded-full ${draft.pinned ? "text-amber-300 bg-amber-400/15" : "text-white/50 hover:bg-white/[0.06]"}`}><Pin className="h-4 w-4" /></button>
            <button onClick={remove} className="grid h-9 w-9 place-items-center rounded-full text-white/50 hover:text-rose-300 hover:bg-white/[0.06]"><Trash2 className="h-4 w-4" /></button>
            <button onClick={save} disabled={saving || !dirty} className="flex items-center gap-1.5 rounded-full brand-grad px-4 py-2 text-[12px] font-bold text-black disabled:opacity-40">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
            </button>
          </div>
        </div>
        <div className="flex flex-1 flex-col px-4 py-3">
          <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Note title" className="bg-transparent text-[20px] font-bold outline-none placeholder-white/30" />
          <textarea value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} placeholder="Start writing…" className="mt-2 flex-1 resize-none bg-transparent text-[14px] leading-relaxed outline-none placeholder-white/30 min-h-[40vh]" />
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-white/[0.07] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-white/40" />
            {COLORS.map((c) => (
              <button key={c} onClick={() => setDraft((d) => ({ ...d, color: c }))} className={`h-4 w-4 rounded-full ${SWATCH[c]} ${draft.color === c ? "ring-2 ring-white/70 scale-110" : "opacity-70"}`} />
            ))}
          </div>
          <span className="text-[11px] text-white/35">{(draft.body || "").trim().split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>
    );
  }

  // ---- feed view ----
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
        <Search className="h-4 w-4 text-white/40" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes" className="h-9 min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder-white/35" />
        <button onClick={create} className="flex items-center gap-1 rounded-full brand-grad px-3 py-1.5 text-[11px] font-bold text-black"><Plus className="h-3.5 w-3.5" /> New</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-white/40 text-sm"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading notes…</div>
      ) : filtered.length === 0 ? (
        <button onClick={create} className="m-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-8 text-[13px] text-white/45 hover:bg-white/[0.03]">
          <Plus className="h-4 w-4" /> Create your first note
        </button>
      ) : (
        <ul>
          {filtered.map((n) => (
            <li key={n.id}>
              <button onClick={() => open(n)} className="block w-full border-b border-white/[0.05] px-4 py-3 text-left transition-colors hover:bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${DOT[n.color] || DOT.violet}`} />
                  <p className="min-w-0 flex-1 truncate text-[14px] font-semibold">{n.title || "Untitled"}</p>
                  {n.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-amber-300" />}
                </div>
                <p className="mt-1 line-clamp-2 text-[12.5px] text-white/45">{n.body || "Empty note"}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}