import React, { useEffect } from "react";
import { X, ChevronUp, ChevronDown, ThumbsUp, Share2 } from "lucide-react";

const fmt = (n = 0) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : n);

// Full-screen vertical Shorts player with up / down navigation.
export default function ShortsPlayer({ shorts = [], index = 0, onIndex, onClose, onLike, liked }) {
  const short = shorts[index];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") onIndex(Math.min(index + 1, shorts.length - 1));
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") onIndex(Math.max(index - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, shorts.length, onIndex, onClose]);

  if (!short) return null;

  const share = async () => {
    const url = short.file_uri || `https://www.youtube.com/shorts/${short.youtube_id}`;
    try {
      if (navigator.share) await navigator.share({ title: short.title, url });
      else await navigator.clipboard?.writeText(url);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6">
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center z-10">
        <X className="w-5 h-5" />
      </button>

      <div className="relative flex items-center gap-3 sm:gap-5 max-h-full">
        <div className="relative h-[min(84vh,760px)] aspect-[9/16] rounded-2xl overflow-hidden bg-black ring-1 ring-white/15 shadow-[0_0_80px_-20px_rgba(217,70,239,0.6)]">
          {short.file_uri ? (
            <video key={short.id} src={short.file_uri} controls autoPlay loop playsInline className="w-full h-full object-contain" />
          ) : (
            <iframe
              key={short.id}
              src={`https://www.youtube.com/embed/${short.youtube_id}?autoplay=1&loop=1&playlist=${short.youtube_id}`}
              title={short.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 to-transparent">
            <p className="text-sm font-semibold leading-snug line-clamp-2">{short.title}</p>
            <p className="text-[11px] text-white/60 mt-1">{short.channel_name} · {fmt(short.views)} views</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 absolute right-3 bottom-24 sm:static sm:right-auto">
          <button onClick={() => onLike(short)} className={`w-11 h-11 rounded-full grid place-items-center bg-white/10 hover:bg-white/20 ${liked ? "text-fuchsia-400" : "text-white"}`}>
            <ThumbsUp className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
          </button>
          <button onClick={share} className="w-11 h-11 rounded-full grid place-items-center bg-white/10 hover:bg-white/20">
            <Share2 className="w-5 h-5" />
          </button>
          <div className="flex flex-col gap-1">
            <button onClick={() => onIndex(Math.max(index - 1, 0))} disabled={index === 0} className="w-9 h-9 rounded-full grid place-items-center bg-white/10 hover:bg-white/20 disabled:opacity-30">
              <ChevronUp className="w-4 h-4" />
            </button>
            <button onClick={() => onIndex(Math.min(index + 1, shorts.length - 1))} disabled={index >= shorts.length - 1} className="w-9 h-9 rounded-full grid place-items-center bg-white/10 hover:bg-white/20 disabled:opacity-30">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[10px] text-white/40">{index + 1}/{shorts.length}</span>
        </div>
      </div>
    </div>
  );
}