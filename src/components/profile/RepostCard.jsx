import React from "react";
import { Repeat2, User } from "lucide-react";

const timeAgo = (iso) => {
  if (!iso) return "";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d` : new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// A repost rendered the X way: "You reposted" header, then the original post.
export default function RepostCard({ post, onOpen }) {
  const originalHandle = post.original_author_handle || "";
  return (
    <article className="border-b border-white/[0.07] px-4 py-3 hover:bg-white/[0.03] transition-colors">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 mb-1.5 ml-1">
        <Repeat2 className="w-3.5 h-3.5" /> You reposted
      </p>
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 shrink-0 grid place-items-center">
          {post.author_avatar ? <img src={post.author_avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-white/40" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm">
            <button onClick={() => onOpen?.(originalHandle)} className="font-bold truncate hover:underline">
              {post.original_author_name || post.author_name}
            </button>
            <span className="text-white/45 truncate">@{originalHandle}</span>
            <span className="text-white/35">·</span>
            <span className="text-white/45 shrink-0">{timeAgo(post.created_date)}</span>
          </div>
          <p className="text-sm whitespace-pre-wrap mt-0.5 break-words">{post.content}</p>
          {post.media_url && (
            <div className="mt-2 rounded-2xl overflow-hidden border border-white/10">
              {post.media_type === "video" ? (
                <video src={post.media_url} controls className="w-full max-h-80 bg-black" />
              ) : (
                <img src={post.media_url} alt="" className="w-full max-h-80 object-cover" />
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}