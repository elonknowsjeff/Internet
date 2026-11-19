import React, { useState } from "react";
import { List, Plus } from "lucide-react";

export default function ListsBar({ lists, activeId, onSelect, onCreate }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [handles, setHandles] = useState("");

  const create = async () => {
    if (!name.trim()) return;
    const parsed = handles.split(",").map((h) => h.trim().replace(/^@/, "")).filter(Boolean);
    await onCreate({ name: name.trim(), handles: parsed });
    setName("");
    setHandles("");
    setOpen(false);
  };

  return (
    <div className="px-4 py-2.5 border-b border-white/[0.08] bg-white/[0.02]">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <List className="w-4 h-4 text-white/45 shrink-0" />
        {lists.length === 0 && <span className="text-[12px] text-white/45">No lists yet</span>}
        {lists.map((l) => (
          <button
            key={l.id}
            onClick={() => onSelect(l)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border ${activeId === l.id ? "bg-white text-black border-white" : "border-white/15 text-white/70 hover:bg-white/10"}`}
          >
            {l.name} · {(l.handles || []).length}
          </button>
        ))}
        <button onClick={() => setOpen((v) => !v)} className="shrink-0 ml-auto w-7 h-7 rounded-full grid place-items-center border border-white/15 text-white/60 hover:bg-white/10" title="New list">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="mt-2 rounded-2xl border border-white/12 bg-white/[0.04] p-2.5 space-y-2 animate-pop-in">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="List name"
            className="w-full px-3 py-2 rounded-xl bg-black/35 border border-white/10 text-sm outline-none focus:border-[color:var(--brand)]"
          />
          <input
            value={handles}
            onChange={(e) => setHandles(e.target.value)}
            placeholder="Handles, comma separated (alex, maya)"
            className="w-full px-3 py-2 rounded-xl bg-black/35 border border-white/10 text-sm outline-none focus:border-[color:var(--brand)]"
          />
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 py-1.5 rounded-full border border-white/15 text-[12px] font-semibold text-white/60">Cancel</button>
            <button onClick={create} disabled={!name.trim()} className="flex-1 py-1.5 rounded-full brand-grad text-black text-[12px] font-bold disabled:opacity-40">Create list</button>
          </div>
        </div>
      )}
    </div>
  );
}