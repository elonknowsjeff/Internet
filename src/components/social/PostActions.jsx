import React, { useRef, useState } from "react";
import { Heart, MessageCircle, Repeat2, Share2, Send, Phone, Video, Check, Bookmark, BarChart2 } from "lucide-react";

const base = "flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-colors";

const fmt = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
};
const viewsFor = (p) => {
  const seed = (p?.id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (p?.likes || 0) * 7 + (p?.comments || 0) * 13 + seed * 23 + 42;
};

export default function PostActions({
  post,
  liked,
  reposted,
  onLike,
  onRepost,
  commentsOpen,
  onComment,
  canContact,
  onDm,
  onCall,
  bookmarked,
  onBookmark,
}) {
  const [bursts, setBursts] = useState([]);
  const [copied, setCopied] = useState(false);
  const [callMenu, setCallMenu] = useState(false);
  const seq = useRef(0);

  const likes = post.likes || 0;
  const rebuzzs = post.rebuzzs || 0;
  const comments = post.comments || 0;

  const burst = () => {
    const items = Array.from({ length: 6 }, () => {
      const a = Math.random() * Math.PI * 2;
      const r = 14 + Math.random() * 20;
      return { id: seq.current++, x: Math.cos(a) * r, y: Math.sin(a) * r, s: 5 + Math.random() * 6 };
    });
    setBursts((b) => [...b, ...items]);
    items.forEach((i) => setTimeout(() => setBursts((b) => b.filter((x) => x.id !== i.id)), 620));
  };

  const tapLike = () => {
    if (!liked) burst();
    onLike?.(post);
  };

  const share = async () => {
    const url = `${window.location.origin}/?post=${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: post.author_name, text: post.content, url });
      else await navigator.clipboard.writeText(url);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="flex items-center justify-between mt-1.5 max-w-[440px] -ml-2" style={{ color: "#71767b" }}>
      <button onClick={() => onComment?.(post)} className={`${base} -ml-2`} style={{ color: commentsOpen ? "#1d9bf0" : undefined }}>
        <span className="grid h-8 w-8 place-items-center rounded-full group-hover:bg-[#1d9bf0]/10" style={{ background: commentsOpen ? "#1d9bf01a" : undefined }}>
          <MessageCircle className="w-[18px] h-[18px]" style={{ color: commentsOpen ? "#1d9bf0" : undefined }} />
        </span>
        <span key={`c-${comments}`} className="text-xs tabular-nums animate-count-pop">{fmt(comments)}</span>
      </button>

      <button
        onClick={() => onRepost?.(post)}
        className={`${base}`}
        style={{ color: reposted ? "#00ba7c" : undefined }}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: reposted ? "#00ba7c1a" : undefined }}>
          <Repeat2 className={`w-[18px] h-[18px] ${reposted ? "animate-repost-spin" : ""}`} />
        </span>
        <span key={`r-${rebuzzs}`} className="text-xs tabular-nums animate-count-pop">{fmt(rebuzzs)}</span>
      </button>

      <span className="relative">
        {bursts.map((b) => (
          <span
            key={b.id}
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
            style={{ width: b.s, height: b.s, background: "#f4212e", "--tx": `${b.x}px`, "--ty": `${b.y}px`, animation: "post-burst 600ms ease-out forwards" }}
          />
        ))}
        <button
          onClick={tapLike}
          className={`${base}`}
          style={{ color: liked ? "#f4212e" : undefined }}
        >
          <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: liked ? "#f4212e1a" : undefined }}>
            <Heart className={`w-[18px] h-[18px] ${liked ? "fill-[#f4212e] animate-heart-pop" : ""}`} />
          </span>
          <span key={`l-${likes}`} className="text-xs tabular-nums animate-count-pop">{fmt(likes)}</span>
        </button>
      </span>

      <span className={`${base}`} title="Views">
        <span className="grid h-8 w-8 place-items-center rounded-full">
          <BarChart2 className="w-[18px] h-[18px]" />
        </span>
        <span className="text-xs tabular-nums">{fmt(viewsFor(post))}</span>
      </span>

      <button
        onClick={() => onBookmark?.(post)}
        className={`${base}`}
        style={{ color: bookmarked ? "#1d9bf0" : undefined }}
        title={bookmarked ? "Remove bookmark" : "Bookmark"}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: bookmarked ? "#1d9bf01a" : undefined }}>
          <Bookmark className={`w-[18px] h-[18px] ${bookmarked ? "fill-current" : ""}`} />
        </span>
      </button>

      <button onClick={share} className={`${base}`} title="Share post">
        <span className="grid h-8 w-8 place-items-center rounded-full">
          {copied ? <Check className="w-[18px] h-[18px]" style={{ color: "#00ba7c" }} /> : <Share2 className="w-[18px] h-[18px]" />}
        </span>
      </button>

      {canContact && (
        <>
          <button onClick={() => onDm?.(post.author_handle)} className={`${base}`} title="Message">
            <span className="grid h-8 w-8 place-items-center rounded-full">
              <Send className="w-[18px] h-[18px]" />
            </span>
          </button>
          <span className="relative">
            <button
              onClick={() => setCallMenu((v) => !v)}
              className={`${base} -mr-2`}
              style={{ color: callMenu ? "#00ba7c" : undefined }}
              title="Call"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: callMenu ? "#00ba7c1a" : undefined }}>
                <Phone className="w-[18px] h-[18px]" />
              </span>
            </button>
            {callMenu && (
              <span className="absolute right-0 bottom-full mb-2 w-40 rounded-xl overflow-hidden z-40 animate-pop-in" style={{ background: "#000", border: "1px solid #2F3336", boxShadow: "0 12px 40px -12px rgba(0,0,0,0.9)" }}>
                <button
                  onClick={() => { setCallMenu(false); onCall?.(post.author_handle, "audio"); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-white/[0.06] text-white"
                >
                  <Phone className="w-3.5 h-3.5" style={{ color: "#00ba7c" }} /> Voice call
                </button>
                <button
                  onClick={() => { setCallMenu(false); onCall?.(post.author_handle, "video"); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-white/[0.06] text-white"
                >
                  <Video className="w-3.5 h-3.5" style={{ color: "#1d9bf0" }} /> Video call
                </button>
              </span>
            )}
          </span>
        </>
      )}
    </div>
  );
}