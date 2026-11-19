import React from "react";
import {
  ChevronLeft, ChevronRight, Search, X, Loader2, Sparkles, Upload, Drum, Disc3, Cloud, Link2,
} from "lucide-react";

const LAYOUTS = [
  { key: "apple", label: "Apple", icon: Disc3 },
  { key: "soundcloud", label: "SoundCloud", icon: Cloud },
  { key: "spotify", label: "Spotify", icon: Link2 },
];

export default function MusicCommandBar({
  query, setQuery, searching, onBack, onForward, layout, onLayout, onCreate, onUpload, onBeat,
}) {
  return (
    <div className="sticky top-0 z-20 -mx-2 px-2 sm:-mx-4 sm:px-4 pt-2 pb-2 bg-[#07070b]/90 backdrop-blur-2xl border-b border-white/[0.07]">
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 shrink-0 rounded-full bg-white/[0.05] border border-white/10 p-0.5">
          <button onClick={onBack} title="Listen Now" className="w-7 h-7 rounded-full grid place-items-center text-white/60 hover:text-white hover:bg-white/10">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={onForward} title="Browse" className="w-7 h-7 rounded-full grid place-items-center text-white/60 hover:text-white hover:bg-white/10">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="group relative flex-1 max-w-xl min-w-0">
          <div className="absolute -inset-px rounded-full bg-gradient-to-r from-[#FA2D48]/60 via-fuchsia-500/30 to-cyan-400/50 opacity-50 blur-[2px] transition-opacity group-focus-within:opacity-100" />
          <div className="relative flex items-center gap-2 rounded-full bg-[#0e0e14] border border-white/10 px-3.5 py-2">
            <Search className="w-4 h-4 text-white/40 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sounds, artists, albums"
              className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-white/35"
            />
            {searching && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                <X className="w-4 h-4 text-white/40 hover:text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-0.5 shrink-0 rounded-full bg-white/[0.05] border border-white/10 p-0.5">
          {LAYOUTS.map((l) => (
            <button
              key={l.key}
              onClick={() => onLayout(l.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                layout === l.key
                  ? "bg-white text-black shadow-[0_0_18px_-6px_rgba(255,255,255,0.7)]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <l.icon className="w-3.5 h-3.5" /> {l.label}
            </button>
          ))}
        </div>

        <button
          onClick={onBeat}
          title="Beat maker"
          className="hidden md:grid w-9 h-9 rounded-full place-items-center bg-white/[0.06] border border-white/12 text-white/70 hover:text-white hover:bg-white/[0.12] shrink-0"
        >
          <Drum className="w-4 h-4" />
        </button>
        <button
          onClick={onUpload}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/[0.08] border border-white/12 text-white text-xs font-bold hover:bg-white/[0.16] shrink-0"
        >
          <Upload className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Upload</span>
        </button>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-black text-xs font-bold bg-gradient-to-r from-[#FA2D48] to-fuchsia-400 shadow-[0_6px_22px_-8px_rgba(250,45,72,0.9)] hover:brightness-110 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Create</span>
        </button>
      </div>

      <div className="lg:hidden flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none">
        {LAYOUTS.map((l) => (
          <button
            key={l.key}
            onClick={() => onLayout(l.key)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border ${
              layout === l.key ? "bg-white text-black border-white" : "bg-white/[0.06] border-white/10 text-white/60"
            }`}
          >
            <l.icon className="w-3 h-3" /> {l.label}
          </button>
        ))}
        <button onClick={onBeat} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/[0.06] border border-white/10 text-white/60 whitespace-nowrap">
          <Drum className="w-3 h-3" /> Beat maker
        </button>
      </div>
    </div>
  );
}