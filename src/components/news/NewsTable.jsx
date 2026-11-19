import React from "react";
import { ExternalLink, Heart, MessageCircle } from "lucide-react";
import NewsComments from "@/components/news/NewsComments";
import { storyKey } from "@/lib/newsTopics";

export default function NewsTable({ items, likes, comments, openKey, onLike, onToggleComments, onOpen, me, onSend }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-left">
        <thead>
          <tr className="border-y border-white/[0.08] bg-white/[0.03]">
            <th className="w-9 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">#</th>
            <th className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">Story</th>
            <th className="w-[130px] px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">Source</th>
            <th className="w-[110px] px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">Section</th>
            <th className="w-[120px] px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">Engagement</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a, i) => {
            const key = storyKey(a);
            const liked = !!likes[key]?.id;
            const likeCount = likes[key]?.count || 0;
            const commentCount = (comments[key] || []).length;
            const open = openKey === key;
            return (
              <React.Fragment key={`${a.headline}-${i}`}>
                <tr className={`border-b border-white/[0.06] align-top transition-colors ${open ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"}`}>
                  <td className="px-3 py-3 text-[11px] tabular-nums text-white/25">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-2 py-3">
                    <button onClick={() => onOpen(a)} className="group block text-left">
                      <p className="text-[13.5px] font-semibold leading-snug text-white group-hover:underline">{a.headline}</p>
                      {a.summary && <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-white/45">{a.summary}</p>}
                    </button>
                  </td>
                  <td className="px-2 py-3 text-[11.5px] text-white/55">{a.source || "—"}</td>
                  <td className="px-2 py-3">
                    <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">{a.category || "top"}</span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => onLike(a)}
                        title="Like"
                        className={`flex items-center gap-1 rounded-full px-1.5 py-1 text-[11px] font-semibold transition-colors hover:bg-rose-500/15 ${liked ? "text-rose-400" : "text-white/45 hover:text-rose-300"}`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${liked ? "fill-rose-400" : ""}`} /> {likeCount}
                      </button>
                      <button
                        onClick={() => onToggleComments()}
                        title="Comments"
                        className={`flex items-center gap-1 rounded-full px-1.5 py-1 text-[11px] font-semibold transition-colors hover:bg-sky-500/15 ${open ? "text-sky-300" : "text-white/45 hover:text-sky-300"}`}
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> {commentCount}
                      </button>
                      <button onClick={() => onOpen(a)} title="Open story" className="rounded-full p-1 text-white/35 hover:bg-white/10 hover:text-white">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {open && (
                  <tr className="border-b border-white/[0.06] bg-black/25">
                    <td colSpan={5} className="px-0">
                      <NewsComments comments={comments[key] || []} me={me} onSend={(text) => onSend(a, text)} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}