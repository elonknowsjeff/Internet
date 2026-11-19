import React from "react";
import { Play } from "lucide-react";
import VideoThumb from "@/components/video/VideoThumb";

const fmt = (n = 0) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : n);

export default function ShortsShelf({ shorts = [], onOpen, title = "Shorts" }) {
  if (!shorts.length) return null;
  return (
    <section className="mb-7">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-red-500 grid place-items-center shadow-[0_0_20px_-4px_rgba(217,70,239,0.7)]">
          <Play className="w-3.5 h-3.5 fill-white" />
        </span>
        <h2 className="text-base font-bold">{title}</h2>
        <span className="text-[11px] text-white/40">{shorts.length} clips</span>
      </div>
      <div className="flex gap-3 overflow-x-auto thin-scrollbar pb-2 -mx-1 px-1 snap-x">
        {shorts.map((s, i) => (
          <button key={s.id} onClick={() => onOpen(i)} className="snap-start shrink-0 w-[148px] sm:w-[166px] text-left group">
            <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black ring-1 ring-fuchsia-300/20 group-hover:ring-fuchsia-300/60 transition-all">
              <VideoThumb video={s} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/40" />
              <span className="absolute top-2 left-2 rounded-md bg-fuchsia-600/90 px-1.5 py-0.5 text-[9px] font-black tracking-widest">SHORT</span>
              <div className="absolute bottom-2 inset-x-2">
                <p className="text-[12px] font-semibold leading-snug line-clamp-2">{s.title}</p>
                <p className="text-[10px] text-white/60 mt-1">{fmt(s.views)} views · {s.channel_name}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}