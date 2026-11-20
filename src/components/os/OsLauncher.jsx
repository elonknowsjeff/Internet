import React, { useState } from "react";
import { Search, X, Minimize2, Sparkles, Monitor, Apple, Grid2x2 } from "lucide-react";

// App launcher — sits near the top of the screen, searches as you type.
export default function OsLauncher({ onClose, apps = [], shortcuts = [], openApp, onShowDesktop, onWall, os, setOs }) {
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const isMac = os === "macos";

  const appItems = apps.map((a) => ({ key: a.id, name: a.name, Icon: a.Icon, tone: a.tone, appId: a.id }));
  const shortItems = shortcuts.map((x) => ({ key: x.to, name: x.name, Icon: x.Icon, tone: x.tone, to: x.to }));
  const visible = [...appItems, ...shortItems].filter((i) => !s || i.name.toLowerCase().includes(s));

  const pick = (item) => {
    onClose();
    if (item.appId) openApp(item.appId);
    else window.location.assign(item.to);
  };

  return (
    <div className="absolute inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px] animate-fade-in" onClick={onClose} />

      <div
        className={`absolute inset-x-2 top-2 mx-auto max-w-[660px] overflow-hidden border shadow-[0_30px_80px_-24px_rgba(0,0,0,0.95)] animate-sheet-down ${
          isMac ? "rounded-[22px] border-white/25 gloss-strong" : "rounded-2xl border-fuchsia-300/25 gloss-strong"
        }`}
      >
        {/* search */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-white/[0.09]">
          <Search className="h-4 w-4 shrink-0 text-white/45" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search apps and services"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder-white/40"
          />
          {q && <button onClick={() => setQ("")} aria-label="Clear"><X className="h-3.5 w-3.5 text-white/45 hover:text-white" /></button>}
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">All apps</p>
          <p className="text-[10.5px] text-white/30">{visible.length} items</p>
        </div>

        <div className="grid grid-cols-5 gap-1 px-2.5 pb-3 max-h-[46vh] overflow-y-auto thin-scrollbar sm:grid-cols-7">
          {visible.map((a) => (
            <button key={a.key} onClick={() => pick(a)} className="group flex flex-col items-center gap-1.5 rounded-xl px-1 py-2 transition-colors hover:bg-white/[0.1]">
              <span className={`relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${a.tone} text-black/80 ring-1 ring-white/35 shadow-[0_8px_18px_-10px_rgba(168,85,247,0.9)] transition-transform duration-200 group-hover:-translate-y-0.5`}>
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent" />
                <a.Icon className="relative h-4 w-4" />
              </span>
              <span className="w-full truncate text-center text-[10px] text-white/70 group-hover:text-white">{a.name}</span>
            </button>
          ))}
          {!visible.length && <p className="col-span-full py-6 text-center text-xs text-white/40">No apps match "{q}".</p>}
        </div>

        <div className="flex flex-wrap items-center gap-1 border-t border-white/[0.09] px-3 py-2.5">
          <button onClick={() => { onShowDesktop(); onClose(); }} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] text-white/70 hover:bg-white/10 hover:text-white">
            <Minimize2 className="h-3.5 w-3.5" /> Show desktop
          </button>
          <button onClick={onWall} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] text-white/70 hover:bg-white/10 hover:text-white">
            <Sparkles className="h-3.5 w-3.5" /> Personalization
          </button>
          <button onClick={() => setOs(isMac ? "windows" : "macos")} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] text-white/70 hover:bg-white/10 hover:text-white">
            {isMac ? <Monitor className="h-3.5 w-3.5" /> : <Apple className="h-3.5 w-3.5" />}
            {isMac ? "Windows 11 style" : "macOS style"}
          </button>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-white/30"><Grid2x2 className="h-3 w-3" /> Valo OS</span>
        </div>
      </div>
    </div>
  );
}