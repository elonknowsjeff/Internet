import React, { useEffect, useState } from "react";
import { X, BadgeCheck, Loader2, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const FALLBACK = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200";

// Lightweight profile sheet: shows another user's PFP, name, handle and their posts.
export default function ProfileSheet({ handle, onClose }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    base44.entities.Post.filter({ author_handle: handle }, { sort: "-created_date", limit: 30 })
      .then((r) => { if (alive) setPosts(r.items || r || []); })
      .catch(() => { if (alive) setPosts([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [handle]);

  const head = posts[0] || {};
  const avatar = head.author_avatar || FALLBACK;
  const name = head.author_name || handle;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm p-3" onClick={onClose}>
      <div
        className="w-full max-w-[520px] max-h-[86vh] overflow-hidden rounded-3xl border border-white/12 bg-[#0b0b12]/95 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner + avatar */}
        <div className="relative h-24 bg-gradient-to-br from-sky-500/30 via-fuchsia-500/20 to-transparent">
          <button onClick={onClose} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white/80 hover:bg-black/60">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="-mt-10 flex items-end gap-3 px-4">
          <img src={avatar} alt={name} className="h-20 w-20 rounded-2xl object-cover ring-4 ring-[#0b0b12]" />
          <div className="pb-1 leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-[16px] font-bold truncate">{name}</span>
              <BadgeCheck className="h-4 w-4" style={{ color: "var(--brand)" }} />
            </div>
            <div className="text-[12.5px] text-white/50">@{handle}</div>
          </div>
          <Link
            to="/messages"
            onClick={onClose}
            className="ml-auto mb-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-black"
            style={{ background: "var(--brand)" }}
          >
            <MessageSquare className="h-3.5 w-3.5" /> Message
          </Link>
        </div>

        <div className="px-4 pt-2 text-[12px] text-white/45">
          {loading ? "…" : posts.length} posts
        </div>

        {/* Posts */}
        <div className="mt-2 max-h-[52vh] overflow-y-auto thin-scrollbar px-3 pb-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-white/50 text-[12px]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading posts…
            </div>
          ) : posts.length === 0 ? (
            <p className="py-8 text-center text-[12.5px] text-white/40">No posts yet from @{handle}.</p>
          ) : (
            <div className="space-y-2">
              {posts.map((p) => (
                <div key={p.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
                  {p.content && <p className="text-[13px] leading-relaxed text-white/85 whitespace-pre-wrap">{p.content}</p>}
                  {p.media_url && (
                    <img src={p.media_url} alt="" className="mt-2 max-h-64 w-full rounded-xl object-cover" />
                  )}
                  <div className="mt-1.5 text-[10.5px] text-white/35">
                    {new Date(p.created_date).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}