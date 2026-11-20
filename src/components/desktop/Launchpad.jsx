import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

export default function Launchpad({ items, onOpen, onClose }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((i) => i.name.toLowerCase().includes(t));
  }, [q, items]);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center pt-14 px-6 backdrop-blur-2xl bg-black/55 animate-fade-in"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto max-w-sm flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2">
          <Search className="w-4 h-4 text-white/60 shrink-0" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search apps"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-white/40"
          />
          <button onClick={onClose} className="w-7 h-7 rounded-full grid place-items-center hover:bg-white/10" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-4 sm:grid-cols-6 gap-x-4 gap-y-5">
          {filtered.map((item) => (
            <button
              key={item.key}
              onClick={() => { onOpen(item); onClose(); }}
              className="group flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white/10"
            >
              <span className="w-14 h-14 rounded-2xl grid place-items-center border border-white/15 bg-gradient-to-b from-white/15 to-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform">
                <item.Icon className="w-7 h-7" />
              </span>
              <span className="text-[11px] text-white/80 text-center truncate max-w-[76px]">{item.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-white/50 text-sm py-10">No apps match.</p>
          )}
        </div>
      </div>
    </div>
  );
}