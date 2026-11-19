import React from "react";
import { Plus, Trash2, X, Presentation } from "lucide-react";

export default function DeckLibrary({ decks, loading, onOpen, onDelete, onNew, onClose }) {
  return (
    <div className="absolute inset-0 z-[70] flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative m-auto w-[min(560px,92vw)] max-h-[72%] rounded-2xl bg-[#141030] border border-white/15 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <Presentation className="w-4 h-4 text-rose-300" />
          <p className="text-sm font-semibold">Your decks</p>
          <button onClick={onNew} className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs"><Plus className="w-3.5 h-3.5" /> New deck</button>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-2 overflow-y-auto thin-scrollbar">
          {loading ? (
            <p className="text-xs text-white/40 p-3">Loading…</p>
          ) : decks.length === 0 ? (
            <p className="text-xs text-white/40 p-3">No saved decks yet — build one and hit Save.</p>
          ) : (
            decks.map((d) => (
              <div key={d.id} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5">
                <button onClick={() => onOpen(d)} className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{d.name}</p>
                  <p className="text-[11px] text-white/40">{d.slides?.length || 0} slides</p>
                </button>
                <button onClick={() => onDelete(d)} className="text-white/40 hover:text-rose-300 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}