import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Power, Lock, RotateCcw, LogOut, ChevronRight, X, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import BrandLogo from "@/components/BrandLogo";

// Windows 11-style Start menu: search, pinned grid, all apps list, power row.
export default function StartMenu({ apps, shortcuts, onOpenApp, onNavigate, onClose, onWallpaper }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [powerOpen, setPowerOpen] = useState(false);

  const all = useMemo(
    () => [
      ...apps.map((a) => ({ id: a.id, name: a.name, Icon: a.Icon, kind: "app" })),
      ...shortcuts.map((s) => ({ id: s.to, name: s.name, Icon: s.Icon, kind: "link", to: s.to })),
    ],
    [apps, shortcuts]
  );

  const filtered = q.trim()
    ? all.filter((a) => a.name.toLowerCase().includes(q.trim().toLowerCase()))
    : null;

  const open = (item) => {
    if (item.kind === "app") onOpenApp(item.id);
    else onNavigate(item.to);
    onClose();
  };

  const power = async (action) => {
    setPowerOpen(false);
    onClose();
    if (action === "lock") return navigate("/");
    if (action === "restart") return window.location.reload();
    if (action === "signout") {
      try { await base44.auth.logout("/login"); } catch { window.location.href = "/login"; }
    }
  };

  return (
    <>
      <div className="absolute inset-0 z-[60]" onClick={onClose} />
      <div
        className="absolute left-1/2 bottom-[76px] z-[61] w-[min(680px,92vw)] -translate-x-1/2 overflow-hidden rounded-[20px] border border-white/12 bg-[#0c0a1a]/95 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search */}
        <div className="flex items-center gap-2 px-4 pt-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 h-10">
            <Search className="h-4 w-4 text-white/50" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search apps and the web"
              className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/40"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-white/40 hover:text-white"><X className="h-3.5 w-3.5" /></button>
            )}
          </div>
        </div>

        {/* Pinned */}
        {!filtered && (
          <div className="px-4 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/55">Pinned</span>
              <button onClick={() => setQ("all")} className="text-[11px] text-white/55 hover:text-white">All apps ›</button>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {apps.map((a) => (
                <button
                  key={a.id}
                  onClick={() => open({ id: a.id, name: a.name, Icon: a.Icon, kind: "app" })}
                  className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 hover:bg-white/10"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--brand) 16%, transparent)" }}>
                    <a.Icon className="h-[18px] w-[18px]" style={{ color: "var(--brand)" }} />
                  </span>
                  <span className="text-[10.5px] text-white/80 leading-tight line-clamp-1">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All apps / filtered list */}
        {filtered && (
          <div className="px-2 pt-3 pb-1 max-h-[46vh] overflow-y-auto thin-scrollbar">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-[12px] text-white/45">No apps match “{q}”.</p>
            ) : (
              filtered.map((a) => (
                <button
                  key={a.id + a.kind}
                  onClick={() => open(a)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/10"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: "color-mix(in srgb, var(--brand) 16%, transparent)" }}>
                    <a.Icon className="h-4 w-4" style={{ color: "var(--brand)" }} />
                  </span>
                  <span className="flex-1 text-[12.5px] text-white/90">{a.name}</span>
                  <span className="text-[10px] uppercase text-white/40">{a.kind === "app" ? "App" : "Page"}</span>
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </button>
              ))
            )}
          </div>
        )}

        {/* Footer: account + power */}
        <div className="mt-3 flex items-center justify-between border-t border-white/10 px-4 py-3">
          <button onClick={() => { onNavigate("/profile"); onClose(); }} className="flex items-center gap-2.5 hover:opacity-90">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
              <BrandLogo size={18} />
            </span>
            <span className="text-[12.5px] font-medium text-white/85">Internet X</span>
          </button>
          <div className="relative flex items-center gap-1">
            <button onClick={onWallpaper} title="Personalize" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10 text-white/70">
              <Sparkles className="h-4 w-4" />
            </button>
            <button onClick={() => setPowerOpen((v) => !v)} title="Power" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10 text-white/70">
              <Power className="h-4 w-4" />
            </button>
            {powerOpen && (
              <div className="absolute bottom-12 right-0 w-40 overflow-hidden rounded-xl border border-white/12 bg-[#0c0a1a]/95 backdrop-blur-xl shadow-2xl">
                {[
                  { key: "lock", label: "Lock", Icon: Lock },
                  { key: "restart", label: "Restart", Icon: RotateCcw },
                  { key: "signout", label: "Sign out", Icon: LogOut },
                ].map((p) => (
                  <button key={p.key} onClick={() => power(p.key)} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[12px] text-white/85 hover:bg-white/10">
                    <p.Icon className="h-4 w-4" /> {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}