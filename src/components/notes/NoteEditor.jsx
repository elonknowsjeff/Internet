import React from "react";
import { Trash2, Pin, Check, Loader2, Palette } from "lucide-react";

const COLORS = ["violet", "sky", "emerald", "amber", "rose"];
const SWATCH = { violet: "bg-violet-400", sky: "bg-sky-400", emerald: "bg-emerald-400", amber: "bg-amber-400", rose: "bg-rose-400" };

export default function NoteEditor({ note, onChange, onSave, onDelete, saving, dirty }) {
  if (!note) {
    return <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm rounded-2xl bg-white/5 border border-white/10 min-h-[45vh]">Pick a note or create one.</div>;
  }
  return (
    <div className="flex-1 rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col min-h-[45vh]">
      <div className="flex items-start justify-between gap-2">
        <input value={note.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Note title" className="flex-1 bg-transparent outline-none text-xl font-bold placeholder-neutral-600" />
        <div className="flex items-center gap-1">
          <button onClick={() => onChange({ pinned: !note.pinned })} title="Pin note" className={`w-8 h-8 rounded-full flex items-center justify-center ${note.pinned ? "text-amber-300 bg-amber-400/15" : "text-neutral-400 hover:bg-white/10"}`}><Pin className="w-4 h-4" /></button>
          <button onClick={onDelete} title="Delete note" className="w-8 h-8 rounded-full text-neutral-400 hover:text-rose-400 hover:bg-white/10 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      <textarea value={note.body} onChange={(e) => onChange({ body: e.target.value })} placeholder="Start writing…" className="flex-1 mt-2 bg-transparent outline-none resize-none text-sm leading-relaxed placeholder-neutral-600 min-h-[26vh]" />
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-neutral-500" />
          {COLORS.map((c) => (
            <button key={c} onClick={() => onChange({ color: c })} aria-label={c} className={`w-4 h-4 rounded-full ${SWATCH[c]} ${note.color === c ? "ring-2 ring-white/80 scale-110" : "opacity-70"}`} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-neutral-500">{(note.body || "").trim().split(/\s+/).filter(Boolean).length} words</span>
          <button onClick={onSave} disabled={saving || !dirty} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-300 to-fuchsia-400 text-black text-sm font-semibold disabled:opacity-40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}