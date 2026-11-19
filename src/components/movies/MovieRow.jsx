import React from "react";
import { Play, Plus } from "lucide-react";

const grad = {
  "Sci-Fi": "from-violet-800 to-fuchsia-900", Action: "from-rose-800 to-orange-900", Drama: "from-sky-900 to-indigo-900",
  Horror: "from-neutral-900 to-rose-950", Romance: "from-pink-800 to-rose-900", Thriller: "from-emerald-900 to-slate-900",
  Comedy: "from-amber-700 to-yellow-900", Animation: "from-cyan-800 to-violet-900", Fantasy: "from-fuchsia-900 to-indigo-900",
};

export default function MovieRow({ title, items = [], onPlay, ranked = false }) {
  if (!items.length) return null;
  return (
    <section className="mt-6 sm:mt-8">
      <div className="flex items-baseline gap-2 px-1 mb-2">
        <h3 className="text-base sm:text-xl font-bold tracking-tight text-white">{title}</h3>
        <span className="text-[11px] text-neutral-500">View all</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 snap-x">
        {items.map((m, i) => (
          <button
            key={(m.id || m.title) + i}
            onClick={() => onPlay(m)}
            className={`snap-start shrink-0 text-left group ${ranked ? "w-[220px] sm:w-[280px]" : "w-[124px] sm:w-[164px]"}`}
          >
            <div className={`relative flex items-end ${ranked ? "h-[130px] sm:h-[160px]" : ""}`}>
              {ranked && (
                <span className="text-[86px] sm:text-[110px] leading-[0.72] font-black text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.45)] -mr-4 shrink-0 select-none">
                  {i + 1}
                </span>
              )}
              <div className={`relative aspect-[2/3] w-full rounded-md overflow-hidden bg-gradient-to-br ${grad[m.genre] || "from-neutral-800 to-neutral-900"} ring-1 ring-white/10 group-hover:ring-white/40 transition-all duration-300`}>
                {(m.poster || m.poster_url) && <img src={m.poster || m.poster_url} alt={m.title} loading="lazy" className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-2 left-2 right-2 text-[11px] font-semibold leading-tight line-clamp-2 drop-shadow">{m.title}</span>
                <span className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-3.5 h-3.5 fill-black" />
                </span>
                {m.ai_generated && <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-fuchsia-500 text-[9px] font-bold text-black">AI</span>}
              </div>
            </div>
            {!ranked && (
              <p className="mt-1.5 text-[11px] text-neutral-400 line-clamp-1 flex items-center gap-1">
                <Plus className="w-3 h-3 shrink-0" /> {m.genre}{m.release_date ? ` · ${String(m.release_date).slice(0, 4)}` : ""}
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}