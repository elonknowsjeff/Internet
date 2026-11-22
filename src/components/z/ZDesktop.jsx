import React, { useState } from "react";
import { Z_APPS } from "@/components/z/zApps";
import ZWindow from "@/components/z/ZWindow";
import { LayoutGrid, Search } from "lucide-react";

let zCounter = 10;

export default function ZDesktop() {
  const [wins, setWins] = useState([]);
  const [start, setStart] = useState(false);
  const [query, setQuery] = useState("");

  const focusWin = (id) =>
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: ++zCounter } : w)));

  const openApp = (app) => {
    setStart(false);
    setWins((ws) => {
      const ex = ws.find((w) => w.key === app.key);
      if (ex) return ws.map((w) => (w.id === ex.id ? { ...w, minimized: false, z: ++zCounter } : w));
      const off = (ws.length % 6) * 26;
      return [
        ...ws,
        {
          id: `${app.key}-${Date.now()}`,
          key: app.key,
          label: app.label,
          icon: app.icon,
          Comp: app.Comp,
          x: 90 + off,
          y: 52 + off,
          w: Math.min(880, window.innerWidth - 180),
          h: Math.min(600, window.innerHeight - 140),
          z: ++zCounter,
          minimized: false,
          maximized: false,
        },
      ];
    });
  };

  const closeWin = (id) => setWins((ws) => ws.filter((w) => w.id !== id));
  const minWin = (id) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  const maxWin = (id) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)));
  const updateWin = (id, patch) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  const restore = (id) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: false, z: ++zCounter } : w)));

  const filtered = Z_APPS.filter((a) => a.label.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div
      className="fixed left-0 right-0 top-0 bottom-[56px] z-30 overflow-hidden md:left-[76px] md:bottom-0 bg-[#0b0b0d]"
      style={{
        backgroundImage:
          "radial-gradient(1100px 560px at 72% -8%, rgba(29,155,240,0.10), transparent), radial-gradient(820px 480px at 8% 112%, rgba(255,255,255,0.04), transparent)",
      }}
    >
      {/* Desktop icons — every app in plain sight */}
      <div className="absolute left-3 top-3 flex max-h-[calc(100%-64px)] flex-col flex-wrap content-start gap-1">
        {Z_APPS.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.key}
              onDoubleClick={() => openApp(app)}
              onClick={(e) => { if (e.detail === 1) openApp(app); }}
              className="flex w-[84px] flex-col items-center gap-1 rounded-lg p-2 text-center hover:bg-white/[0.07]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.06] text-white/85 ring-1 ring-white/10">
                <Icon className="h-5 w-5" />
              </span>
              <span className="line-clamp-2 text-[10.5px] leading-tight text-white/70">{app.label}</span>
            </button>
          );
        })}
      </div>

      {/* Open windows */}
      {wins.map((w) => {
        const Comp = w.Comp;
        return (
          <ZWindow
            key={w.id}
            win={w}
            onFocus={focusWin}
            onClose={closeWin}
            onMinimize={minWin}
            onToggleMax={maxWin}
            onUpdate={updateWin}
          >
            <Comp />
          </ZWindow>
        );
      })}

      {/* Start menu */}
      {start && (
        <div className="absolute inset-0 z-[60]" onClick={() => setStart(false)}>
          <div
            className="absolute bottom-[58px] left-1/2 w-[min(92vw,580px)] -translate-x-1/2 rounded-2xl border border-[#2f3336] bg-[#0a0a0a]/96 p-4 shadow-2xl backdrop-blur-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2 rounded-full border border-[#2f3336] bg-white/[0.05] px-3 py-2">
              <Search className="h-4 w-4 text-white/50" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search apps"
                className="flex-1 bg-transparent text-sm outline-none placeholder-white/40"
                autoFocus
              />
            </div>
            <div className="grid max-h-[52vh] grid-cols-4 gap-2 overflow-auto thin-scrollbar sm:grid-cols-5">
              {filtered.map((a) => {
                const Icon = a.icon;
                return (
                  <button key={a.key} onClick={() => openApp(a)} className="flex flex-col items-center gap-1.5 rounded-xl p-3 hover:bg-white/[0.07]">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                      <Icon className="h-6 w-6 text-white/85" />
                    </span>
                    <span className="line-clamp-1 text-[11px] text-white/70">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="absolute inset-x-0 bottom-0 z-50 flex items-center justify-center gap-1 border-t border-[#2f3336] bg-black/80 px-2 py-1.5 backdrop-blur-2xl">
        <button
          onClick={() => setStart((v) => !v)}
          className={`grid h-10 w-10 place-items-center rounded-xl ${start ? "bg-white/15" : "hover:bg-white/10"}`}
          title="All apps"
        >
          <LayoutGrid className="h-5 w-5 text-white/85" />
        </button>
        <span className="mx-1 h-7 w-px bg-white/10" />
        {wins.map((w) => {
          const Icon = w.icon;
          const active = !w.minimized;
          return (
            <button
              key={w.id}
              onClick={() => (w.minimized ? restore(w.id) : focusWin(w.id))}
              title={w.label}
              className={`relative grid h-10 w-10 place-items-center rounded-xl ${active ? "bg-white/15" : "bg-white/[0.04] hover:bg-white/10"}`}
            >
              <Icon className="h-5 w-5 text-white/85" />
              {active && <span className="absolute -bottom-0.5 h-[3px] w-4 rounded-full bg-[#1d9bf0]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}