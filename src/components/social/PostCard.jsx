import React, { useState } from "react";
import { Repeat2, Trash2, MoreHorizontal, BadgeCheck } from "lucide-react";
import PostActions from "@/components/social/PostActions";
import PostPoll from "@/components/social/PostPoll";
import CommentThread from "@/components/CommentThread";
import { Image as ContentImage } from "@/components/ui/image";

const FALLBACK = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200";

function timeAgo(iso) {
  if (!iso) return "now";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (!Number.isFinite(diff)) return "now";
  if (diff < 60) return `${Math.max(1, Math.floor(diff))}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function PostCard({
  post,
  liked,
  reposted,
  compact,
  isOwn,
  commentsOpen,
  onOpenAuthor,
  onDelete,
  onLike,
  onRepost,
  onComment,
  onCommented,
  onDm,
  onCall,
  bookmarked,
  onBookmark,
}) {
  const [menu, setMenu] = useState(false);

  return (
    <article
      className={`animate-fade-in px-4 transition-colors duration-200 hover:bg-white/[0.03] ${compact ? "py-2.5" : "py-3.5"}`}
      style={{ borderBottom: "1px solid #2F3336", background: "#000" }}
    >
        <div className="flex gap-3">
          <button onClick={() => onOpenAuthor?.(post.author_handle)} className="shrink-0 self-start">
            <img
              src={post.author_avatar || FALLBACK}
              onError={(e) => { e.currentTarget.src = FALLBACK; }}
              alt={post.author_name}
              className="w-10 h-10 rounded-full object-cover transition"
              style={{ boxShadow: "0 0 0 1px #2F3336" }}
            />
          </button>

        <div className="flex-1 min-w-0">
          {post.repost_of && (
            <p className="text-[13px] font-semibold flex items-center gap-1.5 mb-0.5" style={{ color: "#71767b" }}>
              <Repeat2 className="w-3.5 h-3.5" /> Reposted @{post.original_author_handle || "user"}
            </p>
          )}

          <div className="flex items-center gap-1.5 min-w-0">
            <button onClick={() => onOpenAuthor?.(post.author_handle)} className="font-bold text-[15px] truncate text-white hover:underline">
              {post.author_name}
            </button>
            {post.is_creator && <BadgeCheck className="w-4 h-4 shrink-0 -ml-0.5" style={{ color: "#1d9bf0" }} title="Creator" />}
            <button onClick={() => onOpenAuthor?.(post.author_handle)} className="text-[15px] truncate hover:underline" style={{ color: "#71767b" }}>
              @{post.author_handle}
            </button>
            <span className="shrink-0" style={{ color: "#3d4147" }}>·</span>
            <span className="text-[15px] shrink-0 hover:underline" style={{ color: "#71767b" }} title={post.created_date}>
              {timeAgo(post.created_date)}
            </span>

            {isOwn && (
              <span className="relative ml-auto shrink-0">
                <button
                  onClick={() => setMenu((v) => !v)}
                  title="More"
                  className="w-8 h-8 -mr-2 rounded-full grid place-items-center hover:bg-white/[0.06]"
                  style={{ color: "#71767b" }}
                >
                  <MoreHorizontal className="w-[18px] h-[18px]" />
                </button>
                {menu && (
                  <span className="absolute right-0 top-full mt-1 w-44 rounded-2xl overflow-hidden z-40 animate-pop-in" style={{ background: "#000", border: "1px solid #2F3336", boxShadow: "0 12px 40px -12px rgba(0,0,0,0.9)" }}>
                    <button
                      onClick={() => { setMenu(false); onDelete?.(post); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] hover:bg-white/[0.06]"
                      style={{ color: "#f4212e" }}
                    >
                      <Trash2 className="w-4 h-4" /> Delete post
                    </button>
                  </span>
                )}
              </span>
            )}
          </div>

          {post.content && (
            <p className={`mt-1 whitespace-pre-wrap text-white ${compact ? "text-[14px] leading-[18px]" : "text-[15px] leading-[21px]"}`}>
              {post.content}
            </p>
          )}

          {post.media_url && (
            <div className="mt-2 rounded-2xl overflow-hidden" style={{ border: "1px solid #2F3336" }}>
              {post.media_type === "video" ? (
                <video src={post.media_url} controls className="w-full max-h-96 bg-black" />
              ) : post.media_type === "audio" ? (
                <div className="p-3" style={{ background: "#16181c" }}>
                  <audio src={post.media_url} controls className="w-full" />
                </div>
              ) : (
                <ContentImage src={post.media_url} alt="" className="w-full" fittingType="fit" />
              )}
            </div>
          )}

          {post.poll_options?.length > 0 && <PostPoll post={post} onVoted={onCommented} />}

          <PostActions
            post={post}
            liked={liked}
            reposted={reposted}
            onLike={onLike}
            onRepost={onRepost}
            commentsOpen={commentsOpen}
            onComment={onComment}
            canContact={!isOwn}
            onDm={onDm}
            onCall={onCall}
            bookmarked={bookmarked}
            onBookmark={onBookmark}
          />

          {commentsOpen && (
            <div className="mt-3 pt-3 animate-slide-up" style={{ borderTop: "1px solid #2F3336" }}>
              <CommentThread post={post} onCommented={onCommented} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}