import React, { useRef } from "react";
import { Play, Plus, ChevronLeft, ChevronRight, Star } from "lucide-react";

// Netflix-style row: wide landscape cards that light up on hover.
export default function NetflixRow({ title, items = [], onPlay, ranked = false, onAddList }) {
  const scroller = useRef(null);
  if (!items.length) return null;

  const nudge = (dir) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="mt-7 group/row">
      <div className="flex items-center gap-2 px-4 sm:px-10 mb-2">
        <h3 className="text-[15px] sm:text-xl font-bold tracking-tight text-white">{title}</h3>
        <span className="text-[11px] text-neutral-500 opacity-0 group-hover/row:opacity-100 transition-opacity">Explore all ›</span>
        <div className="ml-auto hidden sm:flex items-center gap-1">
          <button onClick={() => nudge(-1)} className="w-7 h-7 rounded-full bg-black/60 border border-white/15 flex items-center justify-center hover:bg-white/15"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => nudge(1)} className="w-7 h-7 rounded-full bg-black/60 border border-white/15 flex items-center justify-center hover:bg-white/15"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div ref={scroller} className="flex gap-2 overflow-x-auto scrollbar-none pb-3 px-4 sm:px-10 snap-x">
        {items.map((m, i) => (
          <button
            key={(m.id || m.title) + i}
            onClick={() => onPlay(m)}
            className={`group/card relative shrink-0 snap-start text-left ${ranked ? "w-[300px] sm:w-[340px]" : "w-[240px] sm:w-[290px]"}`}
          >
            {ranked ? (
              <div className="flex items-end">
                <span className="text-[70px] sm:text-[86px] leading-[0.72] font-black text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.5)] -mr-3 shrink-0 select-none">
                  {i + 1}
                </span>
                <Card m={m} onAddList={onAddList} />
              </div>
            ) : (
              <Card m={m} onAddList={onAddList} />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function Card({ m }) {
  const img = m.trailer ? `https://img.youtube.com/vi/${m.trailer}/mqdefault.jpg` : m.poster;
  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-neutral-900 ring-1 ring-white/8 group-hover/card:ring-white/40 transition-all duration-200 group-hover/card:scale-[1.03] group-hover/card:z-10 shadow-lg shadow-black/50">
      {img && <img src={img} alt={m.title} loading="lazy" className="w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold uppercase tracking-wider text-neutral-200">
        {m.genre || "Movie"}
      </span>
      {m.ai_generated && <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-fuchsia-500 text-[9px] font-bold text-black">AI</span>}

      <div className="absolute bottom-1.5 left-2 right-2">
        <p className="text-[12px] font-semibold leading-tight line-clamp-2 drop-shadow">{m.title}</p>
        <p className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1.5">
          <Star className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" /> {m.release_date ? String(m.release_date).slice(0, 4) : "New"}
          {m.language ? <span className="truncate">· {m.language}</span> : null}
        </p>
      </div>

      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <span className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-xl"><Play className="w-4 h-4 fill-black" /></span>
        <span className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center bg-black/40"><Plus className="w-4 h-4" /></span>
      </div>
    </div>
  );
}