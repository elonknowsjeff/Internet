import React from "react";
import { Play, Pause } from "lucide-react";

export default function SpotifyCard({ title, subtitle, art, playing, onPlay, round = false, badge }) {
  return (
    <button onClick={onPlay} className="group w-full text-left rounded-lg bg-white/5 hover:bg-white/10 transition-colors p-3">
      <div className={`relative mb-2 aspect-square overflow-hidden ${round ? "rounded-full" : "rounded-md"} bg-neutral-800`}>
        {art ? <img src={art} alt={title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600" />}
        {badge && <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold uppercase tracking-wide">{badge}</span>}
        <span className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
        </span>
      </div>
      <p className="text-sm font-semibold truncate">{title}</p>
      <p className="text-xs text-neutral-400 truncate">{subtitle}</p>
    </button>
  );
}