import React from "react";
import { Heart, MessageCircle, ExternalLink, Clock } from "lucide-react";
import { imageFor, readingTime } from "@/lib/newsImages";
import { colorFor } from "@/lib/newsTopics";

export default function NewsRow({ item, liked, likes = 0, comments = 0, commentsOpen, onLike, onToggleComments, onOpen }) {
  const cat = (item.category || "world").toLowerCase();
  const color = colorFor(cat);
  const mins = readingTime(`${item.headline} ${item.summary}`);

  return (
    <article className="px-4 py-3.5 border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors animate-fade-in">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[11px] text-white/45">
            <span className="font-bold uppercase tracking-[0.13em]" style={{ color }}>{item.category || "news"}</span>
            <span className="w-1 h-1 rounded-full bg-white/25" />
            <span className="truncate">{item.source}</span>
            <span className="w-1 h-1 rounded-full bg-white/25 shrink-0" />
            <Clock className="w-3 h-3 shrink-0" /> {mins}m
          </p>

          <button onClick={() => onOpen(item)} className="block text-left mt-1.5">
            <h3 className="text-[15.5px] font-bold leading-snug">{item.headline}</h3>
            {item.summary && <p className="mt-1 text-[12.5px] text-white/50 leading-snug line-clamp-2">{item.summary}</p>}
          </button>

          <div className="flex items-center gap-5 mt-2 text-[12px]">
            <button
              onClick={() => onLike(item)}
              className={`flex items-center gap-1.5 transition-colors ${liked ? "text-rose-400" : "text-white/45 hover:text-rose-300"}`}
            >
              <Heart className="w-[15px] h-[15px]" fill={liked ? "currentColor" : "none"} />
              <span className="tabular-nums">{likes || ""}</span>
            </button>
            <button
              onClick={() => onToggleComments(item)}
              className={`flex items-center gap-1.5 transition-colors ${commentsOpen ? "text-[color:var(--brand)]" : "text-white/45 hover:text-white"}`}
            >
              <MessageCircle className="w-[15px] h-[15px]" />
              <span className="tabular-nums">{comments || ""}</span>
            </button>
            {item.url && (
              <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-white/45 hover:text-white transition-colors">
                <ExternalLink className="w-[15px] h-[15px]" />
              </a>
            )}
          </div>
        </div>

        <button onClick={() => onOpen(item)} className="shrink-0 w-[84px] h-[84px] rounded-xl overflow-hidden border border-white/10 bg-white/5">
          <img src={imageFor(cat)} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
        </button>
      </div>
    </article>
  );
}