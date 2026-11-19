import React from "react";
import { Eye, Clock } from "lucide-react";

export default function ArticleCard({ article, onOpen }) {
  return (
    <button onClick={onOpen} className="text-left rounded-2xl overflow-hidden border border-white/12 bg-white/5 hover:bg-white/[0.09] transition-colors flex flex-col">
      <div className="aspect-[16/9] bg-white/10 overflow-hidden">
        {article.cover ? (
          <img src={article.cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-700/60 to-fuchsia-700/40" />
        )}
      </div>
      <div className="p-3.5 flex-1 flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-fuchsia-300">{article.category || "General"}</span>
        <h3 className="font-semibold leading-snug mt-1 line-clamp-2">{article.title}</h3>
        {article.subtitle && <p className="text-xs text-white/50 mt-1 line-clamp-2">{article.subtitle}</p>}
        <div className="mt-auto pt-3 flex items-center gap-3 text-[11px] text-white/40">
          <span className="truncate">{article.author_name || "Super Internet"}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.read_minutes || 3}m</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views || 0}</span>
        </div>
      </div>
    </button>
  );
}