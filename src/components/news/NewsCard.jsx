import React from "react";
import { ExternalLink, Clock } from "lucide-react";
import { imageFor, CATEGORY_TINT, readingTime } from "@/lib/newsImages";

export default function NewsCard({ item, featured = false, onOpen }) {
  const cat = (item.category || "world").toLowerCase();
  const tint = CATEGORY_TINT[cat] || "text-white/60";
  const mins = readingTime(`${item.headline} ${item.summary}`);

  if (featured) {
    return (
      <button
        onClick={() => onOpen(item)}
        className="group relative w-full text-left rounded-3xl overflow-hidden border border-white/10 mb-4 animate-fade-in"
      >
        <div className="aspect-[16/9] sm:aspect-[16/8] overflow-hidden bg-white/5">
          <img
            src={imageFor(cat)}
            alt=""
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0716] via-[#0a0716]/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className={`text-[11px] font-bold uppercase tracking-[0.18em] ${tint}`}>{item.category || "news"}</span>
          <h2 className="mt-1.5 text-[22px] sm:text-[27px] font-black leading-tight tracking-tight max-w-[36ch]">
            {item.headline}
          </h2>
          {item.summary && (
            <p className="mt-2 text-[13.5px] text-white/70 leading-snug line-clamp-2 max-w-[56ch]">{item.summary}</p>
          )}
          <p className="mt-2.5 text-[11.5px] text-white/45 flex items-center gap-2">
            <span>{item.source}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <Clock className="w-3 h-3" /> {mins} min read
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onOpen(item)}
      className="group flex gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.06] hover:border-white/20 p-3 text-left transition-all duration-200 animate-fade-in"
    >
      <div className="min-w-0 flex-1">
        <span className={`text-[10.5px] font-bold uppercase tracking-[0.16em] ${tint}`}>{item.category || "news"}</span>
        <h3 className="mt-1 text-[15px] font-bold leading-snug line-clamp-3 group-hover:text-white">{item.headline}</h3>
        {item.summary && (
          <p className="mt-1 text-[12.5px] text-white/50 leading-snug line-clamp-2">{item.summary}</p>
        )}
        <p className="mt-2 text-[11px] text-white/40 flex items-center gap-1.5">
          {item.source} <span className="w-1 h-1 rounded-full bg-white/30" /> {mins} min
          {item.url && <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-60" />}
        </p>
      </div>
      <div className="w-[92px] h-[92px] sm:w-[112px] sm:h-[86px] rounded-xl overflow-hidden shrink-0 bg-white/5">
        <img
          src={imageFor(cat)}
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </button>
  );
}