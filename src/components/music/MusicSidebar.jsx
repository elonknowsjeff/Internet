import React from "react";
import { Play, Pause, Upload, Music2, ListMusic, ChevronRight } from "lucide-react";

/*
  The Music page's own left rail: dark glass, brand-lit active state,
  library pinned underneath and the current track docked at the bottom.
*/
export default function MusicSidebar({
  nav = [], view, onView, playlists = [], onUpload, onClassic,
  current, playing, onToggle,
}) {
  return (
    <aside className="panel hidden w-[236px] shrink-0 flex-col overflow-hidden p-2 md:sticky md:top-3 md:flex md:h-[calc(100dvh-24px)]">
      <div className="flex items-center gap-2 px-2 pb-3 pt-1.5">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] brand-grad text-black shadow-[0_10px_22px_-12px_rgba(168,85,247,0.95)]">
          <Music2 className="h-4 w-4" />
        </span>
        <span className="font-display text-[15px] font-semibold tracking-[-0.01em]">
          XSI <span className="font-normal text-white/40">Music</span>
        </span>
      </div>

      <nav className="space-y-0.5">
        {nav.map((n) => {
          const active = view === n.key;
          return (
            <button
              key={n.key}
              onClick={() => onView(n.key)}
              className={`group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-colors ${
                active
                  ? "border border-white/[0.12] bg-white/[0.09] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
                  : "font-medium text-white/55 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full brand-grad shadow-[0_0_10px_rgba(168,85,247,0.9)]" />
              )}
              <n.icon className={`h-[16px] w-[16px] shrink-0 ${active ? "text-white" : "text-white/45 group-hover:text-white/80"}`} />
              <span className="truncate">{n.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="my-2.5 h-px bg-white/[0.08]" />

      <div className="flex items-center justify-between px-2 pb-1">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
          Library
        </span>
        <button onClick={onUpload} title="Add music" className="grid h-6 w-6 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
          <Upload className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto thin-scrollbar">
        {playlists.length === 0 ? (
          <p className="px-2 py-2 text-[11.5px] leading-relaxed text-white/35">Your playlists land here.</p>
        ) : (
          playlists.map((p) => (
            <button key={p.id} onClick={() => onView("library")} className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left hover:bg-white/[0.06]">
              <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md border border-white/[0.08] bg-white/[0.05]">
                {p.cover ? <img src={p.cover} alt="" className="h-full w-full object-cover" /> : <ListMusic className="h-4 w-4 text-white/40" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium">{p.name}</span>
                <span className="block text-[10px] text-white/35">{(p.track_ids || []).length} songs</span>
              </span>
            </button>
          ))
        )}
      </div>

      {current && (
        <div className="mt-2 rounded-xl border border-white/[0.1] bg-white/[0.05] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-white/[0.06]">
              {current.art && <img src={current.art} alt="" className="h-full w-full object-cover" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-semibold">{current.title}</span>
              <span className="block truncate text-[10px] text-white/40">{current.subtitle}</span>
            </span>
            <button onClick={onToggle} className="grid h-7 w-7 shrink-0 place-items-center rounded-full brand-grad text-black">
              {playing ? <Pause className="h-3 w-3 fill-black" /> : <Play className="h-3 w-3 fill-black" />}
            </button>
          </div>
        </div>
      )}

      {onClassic && (
        <button onClick={onClassic} className="mt-2 flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-white/40 hover:bg-white/[0.05] hover:text-white">
          Community look <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </aside>
  );
}