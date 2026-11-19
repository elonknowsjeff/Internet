import React from "react";
import { Heart, MessageCircle, ExternalLink } from "lucide-react";
import NewsComments from "@/components/news/NewsComments";
import { storyKey } from "@/lib/newsTopics";

const tint = (cat = "") => {
  const map = {
    world: "from-sky-400 to-blue-600",
    tech: "from-cyan-300 to-teal-500",
    ai: "from-violet-400 to-fuchsia-600",
    business: "from-amber-300 to-orange-500",
    science: "from-emerald-300 to-teal-600",
    sports: "from-lime-300 to-emerald-500",
    entertainment: "from-pink-400 to-rose-600",
    health: "from-teal-300 to-cyan-600",
    politics: "from-indigo-400 to-violet-600",
  };
  return map[(cat || "").toLowerCase()] || "from-slate-400 to-slate-600";
};

export default function BingResults({ items, likes, comments, openKey, onLike, onToggleComments, onOpen, me, onSend }) {
  return (
    <div className="divide-y divide-white/[0.06]">
      {items.map((a, i) => {
        const key = storyKey(a);
        const liked = !!likes[key]?.id;
        const likeCount = likes[key]?.count || 0;
        const commentRows = comments[key] || [];
        const open = openKey === key;
        const host = (() => {
          try { return a.url ? new URL(a.url).hostname.replace(/^www\./, "") : ""; } catch { return ""; }
        })();
        return (
          <article key={`${a.headline}-${i}`} className="group px-4 py-4 transition-colors hover:bg-white/[0.025] sm:px-5">
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${tint(a.category)} text-[11px] font-black text-black/80`}>
                {(a.source || "N").slice(0, 1).toUpperCase()}
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[11px] text-white/40">
                  <span className="font-semibold text-white/70">{a.source || "News"}</span>
                  {host && <><span>·</span><span className="truncate">{host}</span></>}
                  <span className="ml-1 rounded-full bg-white/[0.07] px-1.5 py-px text-[9.5px] font-semibold uppercase tracking-wide text-white/50">{a.category || "top"}</span>
                </p>

                <button onClick={() => onOpen(a)} className="mt-1 block text-left">
                  <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-[#a8c7fa] group-hover:underline">{a.headline}</h3>
                  {a.summary && <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-white/50">{a.summary}</p>}
                </button>

                <div className="mt-2 flex items-center gap-1">
                  <button
                    onClick={() => onLike(a)}
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors hover:bg-rose-500/15 ${liked ? "text-rose-400" : "text-white/40 hover:text-rose-300"}`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${liked ? "fill-rose-400" : ""}`} /> {likeCount}
                  </button>
                  <button
                    onClick={() => onToggleComments()}
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors hover:bg-sky-500/15 ${open ? "text-sky-300" : "text-white/40 hover:text-sky-300"}`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> {commentRows.length}
                  </button>
                  <button onClick={() => onOpen(a)} className="ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-white/35 hover:text-white">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {open && (
              <div className="mt-2 rounded-xl panel-inset overflow-hidden">
                <NewsComments comments={commentRows} me={me} onSend={(text) => onSend(a, text)} />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}