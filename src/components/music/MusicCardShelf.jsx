import React from "react";
import { Play, ChevronRight, Music2 } from "lucide-react";

// Spotify-style horizontal shelf: square artwork cards with a hover play button.
export default function MusicCardShelf({ title, items = [], onSeeAll, onPlay }) {
  if (!items.length) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between mb-2 px-1">
        <h3 className="text-[17px] font-bold tracking-tight">{title}</h3>
        {onSeeAll && (
          <button onClick={onSeeAll} className="text-[11px] font-semibold text-white/50 hover:text-white flex items-center gap-0.5">
            Show all <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto thin-scrollbar pb-2 -mx-1 px-1">
        {items.map((it, i) => (
          <button key={it.id || `${title}-${i}`} onClick={it.onClick} className="group shrink-0 w-[150px] sm:w-[172px] text-left">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white/[0.07] mb-2 shadow-xl shadow-black/50">
              {it.art ? (
                <img src={it.art} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Music2 className="w-7 h-7 text-white/40" /></div>
              )}
              <span className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white/25 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-[15px] h-[15px] fill-white text-white" />
              </span>
            </div>
            <p className="text-[13px] font-semibold truncate">{it.title}</p>
            <p className="text-[11px] text-white/45 truncate">{it.subtitle}</p>
          </button>
        ))}
      </div>
    </section>
  );
}