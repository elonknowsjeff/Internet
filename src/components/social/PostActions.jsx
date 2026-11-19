import React, { useRef, useState } from "react";
import { Heart, MessageCircle, Repeat2, Share2, Send, Phone, Video, Check, Bookmark } from "lucide-react";

const base = "flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-colors";

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
    <div className="flex items-center justify-between mt-1.5 max-w-[425px] -ml-2 text-white/50">
      <button onClick={() => onComment?.(post)} className={`${base} -ml-2 hover:text-cyan-300 hover:bg-cyan-400/10`}>
        <MessageCircle className={`w-[18px] h-[18px] ${commentsOpen ? "text-cyan-300" : ""}`} />
        <span key={`c-${comments}`} className="text-xs tabular-nums animate-count-pop">{comments}</span>
      </button>

      <button
        onClick={() => onRepost?.(post)}
        className={`${base} ${reposted ? "text-emerald-400" : "hover:text-emerald-300 hover:bg-emerald-400/10"}`}
      >
        <Repeat2 className={`w-[18px] h-[18px] ${reposted ? "animate-repost-spin" : ""}`} />
        <span key={`r-${rebuzzs}`} className="text-xs tabular-nums animate-count-pop">{rebuzzs}</span>
      </button>

      <span className="relative">
        {bursts.map((b) => (
          <span
            key={b.id}
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full bg-rose-400"
            style={{ width: b.s, height: b.s, "--tx": `${b.x}px`, "--ty": `${b.y}px`, animation: "post-burst 600ms ease-out forwards" }}
          />
        ))}
        <button
          onClick={tapLike}
          className={`${base} ${liked ? "text-rose-400" : "hover:text-rose-400 hover:bg-rose-400/10"}`}
        >
          <Heart className={`w-[18px] h-[18px] ${liked ? "fill-rose-400 animate-heart-pop" : ""}`} />
          <span key={`l-${likes}`} className="text-xs tabular-nums animate-count-pop">{likes}</span>
        </button>
      </span>

      <button
        onClick={() => onBookmark?.(post)}
        className={`${base} ${bookmarked ? "text-[color:var(--brand)]" : "hover:text-[color:var(--brand)] hover:bg-white/10"}`}
        title={bookmarked ? "Remove bookmark" : "Bookmark"}
      >
        <Bookmark className={`w-[18px] h-[18px] ${bookmarked ? "fill-current" : ""}`} />
      </button>

      <button onClick={share} className={`${base} hover:text-cyan-300 hover:bg-cyan-400/10`} title="Share post">
        {copied ? <Check className="w-[18px] h-[18px] text-emerald-400" /> : <Share2 className="w-[18px] h-[18px]" />}
      </button>

      {canContact && (
        <>
          <button onClick={() => onDm?.(post.author_handle)} className={`${base} hover:text-fuchsia-300 hover:bg-fuchsia-400/10`} title="Message">
            <Send className="w-[18px] h-[18px]" />
          </button>
          <span className="relative">
            <button
              onClick={() => setCallMenu((v) => !v)}
              className={`${base} -mr-2 ${callMenu ? "text-emerald-300 bg-emerald-400/10" : "hover:text-emerald-300 hover:bg-emerald-400/10"}`}
              title="Call"
            >
              <Phone className="w-[18px] h-[18px]" />
            </button>
            {callMenu && (
              <span className="absolute right-0 bottom-full mb-2 w-40 rounded-xl border border-white/10 bg-[#140e2b] shadow-2xl overflow-hidden z-40 animate-pop-in">
                <button
                  onClick={() => { setCallMenu(false); onCall?.(post.author_handle, "audio"); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/10"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-300" /> Voice call
                </button>
                <button
                  onClick={() => { setCallMenu(false); onCall?.(post.author_handle, "video"); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/10"
                >
                  <Video className="w-3.5 h-3.5 text-fuchsia-300" /> Video call
                </button>
              </span>
            )}
          </span>
        </>
      )}
    </div>
  );
}