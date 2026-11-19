import React from "react";
import { Play, Info, Plus, Check, Star } from "lucide-react";

// Netflix-style full-bleed billboard hero.
export default function Billboard({ movie, onPlay, onAddList, inList }) {
  if (!movie) return null;
  const year = movie.release_date ? String(movie.release_date).slice(0, 4) : "";
  const backdrop = movie.trailer ? `https://img.youtube.com/vi/${movie.trailer}/hqdefault.jpg` : movie.poster;

  return (
    <section className="relative w-full h-[68vh] min-h-[440px] max-h-[720px] overflow-hidden">
      {backdrop && <img src={backdrop} alt="" className="absolute inset-0 w-full h-full object-cover object-top scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0814] via-[#0a0814]/75 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0814] via-[#0a0814]/10 to-[#0a0814]/60" />

      <div className="absolute inset-x-0 bottom-0 px-4 sm:px-10 pb-8 sm:pb-12 max-w-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#e50914] font-black text-xl leading-none tracking-tighter">W</span>
          <span className="text-[10px] tracking-[0.32em] font-semibold text-neutral-300">WALZA ORIGINAL</span>
        </div>
        <h1 className="text-3xl sm:text-6xl font-black leading-[0.95] tracking-tight drop-shadow-2xl">{movie.title}</h1>

        <div className="flex flex-wrap items-center gap-2 mt-3 text-[12px] font-semibold text-neutral-300">
          <span className="text-emerald-400 flex items-center gap-1"><Star className="w-3 h-3 fill-emerald-400" /> 97% Match</span>
          {year && <span>{year}</span>}
          <span className="px-1.5 py-0.5 border border-neutral-500 rounded text-[10px]">U/A 13+</span>
          <span>{movie.genre}</span>
          <span className="px-1.5 py-0.5 border border-neutral-500 rounded text-[10px]">HD</span>
          {movie.language && <span>{movie.language}</span>}
        </div>

        <p className="text-sm sm:text-base text-neutral-200 mt-3 line-clamp-3 max-w-xl drop-shadow">{movie.synopsis}</p>

        <div className="flex items-center gap-2.5 mt-5">
          <button onClick={() => onPlay(movie)} className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-colors">
            <Play className="w-4 h-4 fill-black" /> Play
          </button>
          <button onClick={() => onAddList(movie)} className="flex items-center gap-2 px-5 py-2.5 rounded bg-white/20 backdrop-blur text-sm font-bold hover:bg-white/30 transition-colors">
            {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />} My List
          </button>
          <button onClick={() => onPlay(movie)} title="More info" className="flex items-center gap-2 px-4 py-2.5 rounded bg-white/10 backdrop-blur text-sm font-semibold text-neutral-200 hover:bg-white/20">
            <Info className="w-4 h-4" /> <span className="hidden sm:inline">More Info</span>
          </button>
        </div>
      </div>
    </section>
  );
}