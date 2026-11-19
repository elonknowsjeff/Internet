import React from "react";
import { Play, Pause } from "lucide-react";

const fmt = (s) => `${Math.floor((s || 0) / 60)}:${String(Math.floor((s || 0) % 60)).padStart(2, "0")}`;

export default function SpotifyRow({ index, title, subtitle, art, duration, playing, onPlay, tag }) {
  return (
    <button onClick={onPlay} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 text-left group">
      <span className="w-5 text-center text-sm text-neutral-500 tabular-nums group-hover:hidden">{index}</span>
      <span className="w-5 hidden group-hover:flex items-center justify-center text-white">
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" fill="currentColor" />}
      </span>
      {art && <img src={art} alt="" className="w-10 h-10 rounded object-cover shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-sm truncate">{title}</p>
        <p className="text-xs text-neutral-400 truncate">{subtitle}</p>
      </div>
      {tag && <span className="hidden sm:block text-[10px] uppercase tracking-wide text-emerald-400 shrink-0">{tag}</span>}
      {duration ? <span className="text-xs text-neutral-500 tabular-nums shrink-0">{fmt(duration)}</span> : null}
    </button>
  );
}