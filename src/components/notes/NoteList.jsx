import React from "react";
import { Search, Plus, Pin } from "lucide-react";

const DOT = { violet: "bg-violet-400", sky: "bg-sky-400", emerald: "bg-emerald-400", amber: "bg-amber-400", rose: "bg-rose-400" };

export default function NoteList({ notes, activeId, query, onQuery, onSelect, onCreate }) {
  return (
    <div className="w-full sm:w-64 shrink-0 flex flex-col gap-2">
      <button onClick={onCreate} className="flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-amber-300 to-fuchsia-400 text-black text-sm font-semibold">
        <Plus className="w-4 h-4" /> New note
      </button>
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2">
        <Search className="w-4 h-4 text-neutral-500" />
        <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search notes" className="flex-1 bg-transparent outline-none text-sm" />
      </div>
      <div className="space-y-1 overflow-y-auto max-h-[62vh] pr-1">
        {notes.length === 0 && <p className="text-sm text-neutral-500 py-4 text-center">No notes yet.</p>}
        {notes.map((n) => (
          <button key={n.id} onClick={() => onSelect(n.id)} className={`w-full text-left rounded-xl p-3 border transition-colors ${activeId === n.id ? "bg-white/15 border-white/25" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${DOT[n.color] || DOT.violet}`} />
              <p className="text-sm font-semibold truncate flex-1">{n.title || "Untitled"}</p>
              {n.pinned && <Pin className="w-3 h-3 text-amber-300 shrink-0" />}
            </div>
            <p className="text-xs text-neutral-400 line-clamp-2 mt-0.5">{n.body || "Empty note"}</p>
          </button>
        ))}
      </div>
    </div>
  );
}