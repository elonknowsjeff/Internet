import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Languages, FileText, X, Search, LayoutGrid } from "lucide-react";
import { NAV_SECTIONS, ALL_APPS } from "@/lib/navApps";
import AppTile from "@/components/os/AppTile";

const isActive = (pathname, to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

export default function AppsMenu({ open, onClose, onTranslate }) {
  const location = useLocation();
  const [q, setQ] = useState("");
  const [section, setSection] = useState("All");

  useEffect(() => {
    if (!open) { setQ(""); setSection("All"); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const s = q.trim().toLowerCase();
  const matches = (i) => !s || i.label.toLowerCase().includes(s) || i.to.includes(s);
  const base = section === "All" ? NAV_SECTIONS : NAV_SECTIONS.filter((x) => x.name === section);
  const sections = base
    .map((sec) => ({ ...sec, items: sec.items.filter(matches) }))
    .filter((sec) => sec.items.length);
  const total = sections.reduce((n, sec) => n + sec.items.length, 0);
  const flat = sections.length === 1 || !!s || section !== "All";

  return (
    <>
      <div className="fixed inset-0 z-[54] bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className="fixed inset-x-0 top-3 z-[55] mx-auto w-[min(97vw,1040px)] overflow-hidden rounded-[28px] atmo-glass animate-sheet-down">
        {/* search — the first thing you touch */}
        <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-4 py-3.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl brand-grad text-black"><LayoutGrid className="h-4 w-4" /></span>
          <h2 className="hidden shrink-0 font-display text-[15px] font-extrabold tracking-tight sm:block">All apps</h2>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-2 focus-within:border-white/30">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search every app…"
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder-white/35"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear" className="text-white/45 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <span className="hidden shrink-0 text-[10.5px] uppercase tracking-[0.08em] text-white/35 sm:block">{total} apps</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.1] text-white/55 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* section filter */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-white/[0.06] px-3 py-2 scrollbar-none">
          {["All", ...NAV_SECTIONS.map((x) => x.name)].map((name) => (
            <button
              key={name}
              onClick={() => setSection(name)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11.5px] font-semibold transition-colors ${
                section === name
                  ? "brand-grad text-black"
                  : "border border-white/[0.1] bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="max-h-[calc(100dvh-210px)] overflow-y-auto thin-scrollbar px-2.5 pb-4 pt-3">
          {sections.map((sec) => (
            <div key={`${sec.name}-${s}-${section}`} className="mb-3 last:mb-0">
              {!flat && (
                <p className="mb-1 flex items-center gap-2 px-2 text-[10px] uppercase tracking-[0.18em] text-white/30">
                  {sec.name}
                  <span className="h-px flex-1 bg-white/[0.07]" />
                </p>
              )}
              <div className="grid grid-cols-3 gap-0.5 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-7">
                {sec.items.map(({ key, to, label, icon }, i) => (
                  <AppTile
                    key={key}
                    to={to}
                    label={label}
                    icon={icon}
                    index={i}
                    active={isActive(location.pathname, to)}
                    onNavigate={onClose}
                  />
                ))}
              </div>
            </div>
          ))}
          {!total && (
            <p className="py-14 text-center text-[13px] text-white/40">
              No apps match “{q}”.
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 border-t border-white/[0.08] px-3 py-2.5">
          <button onClick={() => { onClose(); onTranslate(); }} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/55 hover:bg-white/[0.08] hover:text-white">
            <Languages className="h-3.5 w-3.5" /> Translator
          </button>
          <Link to="/terms" onClick={onClose} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/55 hover:bg-white/[0.08] hover:text-white">
            <FileText className="h-3.5 w-3.5" /> Terms
          </Link>
          <Link to="/settings" onClick={onClose} className="ml-auto rounded-full px-3 py-1.5 text-[11px] font-semibold text-white/55 hover:bg-white/[0.08] hover:text-white">
            More settings
          </Link>
        </div>
      </div>
    </>
  );
}