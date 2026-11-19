import React from "react";
import { User } from "lucide-react";
import PostActions from "@/components/social/PostActions";
import CommentThread from "@/components/CommentThread";

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function ProfilePost({
  post, name, handle, avatar,
  liked, reposted, onLike, onRepost,
  commentsOpen, onComment, onCommented,
  onDm, onCall,
}) {
  return (
    <article className="flex gap-3 px-4 py-3 border-b border-white/[0.07] hover:bg-white/[0.03] transition-colors">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0 grid place-items-center">
        {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-white/40" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-bold truncate">{name}</span>
          <span className="text-white/45 truncate">@{handle}</span>
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
        <PostActions
          post={post}
          liked={liked}
          reposted={reposted}
          onLike={onLike}
          onRepost={onRepost}
          commentsOpen={commentsOpen}
          onComment={onComment}
          canContact={false}
          onDm={onDm}
          onCall={onCall}
        />
        {commentsOpen && (
          <div className="mt-3 pt-3 border-t border-white/10 animate-slide-up">
            <CommentThread post={post} onCommented={onCommented} />
          </div>
        )}
      </div>
    </article>
  );
}